const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EnanosDeLeyenda", function () {
    let enanosDeLeyenda;
    let usdcToken;
    let owner;
    let buyer1;
    let buyer2;
    let otherAccounts;

    const MAX_SUPPLY = 188;
    const PRICE = ethers.parseUnits("1", 6); // 1 USDC (6 decimales)
    const MAX_TOKENS_PER_WALLET = 10;
    const BASE_URI = "https://api.enanosdeleyenda.com/metadata/";

    beforeEach(async function () {
        [owner, buyer1, buyer2, ...otherAccounts] = await ethers.getSigners();

        // Desplegar un mock de USDC para las pruebas
        const USDC = await ethers.getContractFactory("MockUSDC");
        usdcToken = await USDC.deploy();
        await usdcToken.waitForDeployment();

        // Desplegar el contrato EnanosDeLeyenda
        const EnanosDeLeyenda = await ethers.getContractFactory("EnanosDeLeyenda");
        enanosDeLeyenda = await EnanosDeLeyenda.deploy(await usdcToken.getAddress(), BASE_URI);
        await enanosDeLeyenda.waitForDeployment();

        // Dar USDC a los compradores para las pruebas
        await usdcToken.mint(buyer1.address, ethers.parseUnits("1000", 6));
        await usdcToken.mint(buyer2.address, ethers.parseUnits("1000", 6));
        await usdcToken.mint(owner.address, ethers.parseUnits("1000", 6));

        // Aprobar al contrato para gastar USDC
        await usdcToken.connect(buyer1).approve(await enanosDeLeyenda.getAddress(), ethers.parseUnits("1000", 6));
        await usdcToken.connect(buyer2).approve(await enanosDeLeyenda.getAddress(), ethers.parseUnits("1000", 6));
    });

    describe("Constructor y Constantes", function () {
        it("Debería desplegar correctamente con las constantes correctas", async function () {
            expect(await enanosDeLeyenda.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
            expect(await enanosDeLeyenda.PRICE()).to.equal(PRICE);
            expect(await enanosDeLeyenda.MAX_TOKENS_PER_WALLET()).to.equal(MAX_TOKENS_PER_WALLET);
            expect(await enanosDeLeyenda.owner()).to.equal(owner.address);
        });

        it("Debería mintear todos los tokens al contrato en el constructor", async function () {
            for (let i = 1; i <= MAX_SUPPLY; i++) {
                expect(await enanosDeLeyenda.ownerOf(i)).to.equal(await enanosDeLeyenda.getAddress());
                expect(await enanosDeLeyenda.isAvailableForSale(i)).to.be.true;
            }
        });

        it("Debería establecer la base URI correctamente", async function () {
            expect(await enanosDeLeyenda.getBaseURI()).to.equal(BASE_URI);
        });

        it("Debería retornar el nombre y símbolo correctos", async function () {
            expect(await enanosDeLeyenda.name()).to.equal("Enanos de Leyenda");
            expect(await enanosDeLeyenda.symbol()).to.equal("ENANOS");
        });
    });

    describe("Función buyNFT", function () {
        it("Debería permitir comprar un NFT correctamente", async function () {
            const tokenAmount = 1;
            const totalPrice = PRICE * BigInt(tokenAmount);

            await expect(enanosDeLeyenda.connect(buyer1).buyNFT(tokenAmount))
                .to.emit(enanosDeLeyenda, "NFTSold")
                .withArgs(1, buyer1.address, PRICE);

            expect(await enanosDeLeyenda.ownerOf(1)).to.equal(buyer1.address);
            expect(await enanosDeLeyenda.isAvailableForSale(1)).to.be.false;
            expect(await enanosDeLeyenda.tokensPurchased(buyer1.address)).to.equal(1);
        });

        it("Debería permitir comprar múltiples NFTs", async function () {
            const tokenAmount = 3;
            const totalPrice = PRICE * BigInt(tokenAmount);

            await enanosDeLeyenda.connect(buyer1).buyNFT(tokenAmount);

            expect(await enanosDeLeyenda.ownerOf(1)).to.equal(buyer1.address);
            expect(await enanosDeLeyenda.ownerOf(2)).to.equal(buyer1.address);
            expect(await enanosDeLeyenda.ownerOf(3)).to.equal(buyer1.address);
            expect(await enanosDeLeyenda.tokensPurchased(buyer1.address)).to.equal(3);
        });

        it("Debería fallar si se intenta comprar 0 tokens", async function () {
            await expect(enanosDeLeyenda.connect(buyer1).buyNFT(0))
                .to.be.revertedWith("Cantidad debe ser mayor a 0");
        });

        it("Debería fallar si se excede el límite por wallet", async function () {
            // Comprar el máximo permitido
            await enanosDeLeyenda.connect(buyer1).buyNFT(MAX_TOKENS_PER_WALLET);
            
            // Intentar comprar uno más
            await expect(enanosDeLeyenda.connect(buyer1).buyNFT(1))
                .to.be.revertedWith("Excede el limite de tokens por wallet");
        });

        it("Debería fallar si se intenta comprar más tokens de los disponibles", async function () {
            await expect(enanosDeLeyenda.connect(buyer1).buyNFT(MAX_SUPPLY + 1))
                .to.be.revertedWith("Cantidad excede el suministro maximo");
        });

        it("Debería fallar si no hay suficientes USDC aprobados", async function () {
            // Revocar aprobación
            await usdcToken.connect(buyer1).approve(await enanosDeLeyenda.getAddress(), 0);
            
            await expect(enanosDeLeyenda.connect(buyer1).buyNFT(1))
                .to.be.reverted;
        });

        it("Debería transferir USDC al owner correctamente", async function () {
            const tokenAmount = 2;
            const totalPrice = PRICE * BigInt(tokenAmount);
            const ownerBalanceBefore = await usdcToken.balanceOf(owner.address);

            await enanosDeLeyenda.connect(buyer1).buyNFT(tokenAmount);

            const ownerBalanceAfter = await usdcToken.balanceOf(owner.address);
            expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(totalPrice);
        });
    });

    describe("Funciones de Administración", function () {
        it("Debería permitir al owner retirar tokens ERC20", async function () {
            // Transferir algunos USDC al contrato para probar la función withdrawToken
            await usdcToken.transfer(await enanosDeLeyenda.getAddress(), PRICE * BigInt(2));
            
            const contractBalance = await usdcToken.balanceOf(await enanosDeLeyenda.getAddress());
            const ownerBalanceBefore = await usdcToken.balanceOf(owner.address);

            await expect(enanosDeLeyenda.withdrawToken(usdcToken))
                .to.emit(enanosDeLeyenda, "TokenWithdrawn")
                .withArgs(await usdcToken.getAddress(), owner.address, contractBalance);

            const ownerBalanceAfter = await usdcToken.balanceOf(owner.address);
            expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(contractBalance);
        });

        it("Debería fallar si un no-owner intenta retirar tokens", async function () {
            await expect(enanosDeLeyenda.connect(buyer1).withdrawToken(usdcToken))
                .to.be.revertedWithCustomError(enanosDeLeyenda, "OwnableUnauthorizedAccount")
                .withArgs(buyer1.address);
        });

        it("Debería fallar si no hay tokens para retirar", async function () {
            await expect(enanosDeLeyenda.withdrawToken(usdcToken))
                .to.be.revertedWith("No hay tokens para retirar");
        });

        it("Debería permitir al owner actualizar la base URI", async function () {
            const newBaseURI = "https://newapi.enanosdeleyenda.com/metadata/";
            
            await expect(enanosDeLeyenda.setBaseURI(newBaseURI))
                .to.emit(enanosDeLeyenda, "BaseURIUpdated")
                .withArgs(newBaseURI);

            expect(await enanosDeLeyenda.getBaseURI()).to.equal(newBaseURI);
        });

        it("Debería fallar si un no-owner intenta actualizar la base URI", async function () {
            const newBaseURI = "https://newapi.enanosdeleyenda.com/metadata/";
            
            await expect(enanosDeLeyenda.connect(buyer1).setBaseURI(newBaseURI))
                .to.be.revertedWithCustomError(enanosDeLeyenda, "OwnableUnauthorizedAccount")
                .withArgs(buyer1.address);
        });

        it("Debería permitir al owner establecer URI específica para un token", async function () {
            const tokenId = 1;
            const specificURI = "https://api.enanosdeleyenda.com/metadata/special/1.json";
            
            await expect(enanosDeLeyenda.setTokenURI(tokenId, specificURI))
                .to.emit(enanosDeLeyenda, "TokenURIUpdated")
                .withArgs(tokenId, specificURI);

            expect(await enanosDeLeyenda.tokenURI(tokenId)).to.equal(specificURI);
        });

        it("Debería fallar si se intenta establecer URI para un token inexistente", async function () {
            const invalidTokenId = MAX_SUPPLY + 1;
            const specificURI = "https://api.enanosdeleyenda.com/metadata/special/999.json";
            
            await expect(enanosDeLeyenda.setTokenURI(invalidTokenId, specificURI))
                .to.be.revertedWith("Token no existe");
        });

        it("Debería fallar si un no-owner intenta establecer URI específica", async function () {
            const tokenId = 1;
            const specificURI = "https://api.enanosdeleyenda.com/metadata/special/1.json";
            
            await expect(enanosDeLeyenda.connect(buyer1).setTokenURI(tokenId, specificURI))
                .to.be.revertedWithCustomError(enanosDeLeyenda, "OwnableUnauthorizedAccount")
                .withArgs(buyer1.address);
        });
    });

    describe("Funciones de Consulta", function () {
        it("Debería retornar la URI correcta para un token sin URI específica", async function () {
            const tokenId = 1;
            const expectedURI = BASE_URI + "1.json";
            expect(await enanosDeLeyenda.tokenURI(tokenId)).to.equal(expectedURI);
        });

        it("Debería retornar la URI específica cuando está establecida", async function () {
            const tokenId = 1;
            const specificURI = "https://api.enanosdeleyenda.com/metadata/special/1.json";
            
            await enanosDeLeyenda.setTokenURI(tokenId, specificURI);
            expect(await enanosDeLeyenda.tokenURI(tokenId)).to.equal(specificURI);
        });

        it("Debería fallar al consultar URI de token inexistente", async function () {
            const invalidTokenId = MAX_SUPPLY + 1;
            await expect(enanosDeLeyenda.tokenURI(invalidTokenId))
                .to.be.revertedWith("Token no existe");
        });

        it("Debería retornar el balance de USDC del contrato", async function () {
            // El contrato no debería tener USDC ya que se transfiere directamente al owner
            expect(await enanosDeLeyenda.getUSDCBalance()).to.equal(0);
            
            // Transferir algunos USDC al contrato para probar la función
            await usdcToken.transfer(await enanosDeLeyenda.getAddress(), PRICE * BigInt(2));
            const expectedBalance = PRICE * BigInt(2);
            expect(await enanosDeLeyenda.getUSDCBalance()).to.equal(expectedBalance);
        });

        it("Debería retornar correctamente si un NFT está disponible para venta", async function () {
            // Token disponible
            expect(await enanosDeLeyenda.isAvailableForSale(1)).to.be.true;
            
            // Comprar el token
            await enanosDeLeyenda.connect(buyer1).buyNFT(1);
            
            // Token ya no disponible
            expect(await enanosDeLeyenda.isAvailableForSale(1)).to.be.false;
        });

        it("Debería retornar false para token inexistente", async function () {
            const invalidTokenId = MAX_SUPPLY + 1;
            expect(await enanosDeLeyenda.isAvailableForSale(invalidTokenId)).to.be.false;
        });

        it("Debería retornar la cantidad correcta de tokens disponibles", async function () {
            expect(await enanosDeLeyenda.getAvailableTokensCount()).to.equal(MAX_SUPPLY);
            
            // Comprar algunos tokens
            await enanosDeLeyenda.connect(buyer1).buyNFT(5);
            expect(await enanosDeLeyenda.getAvailableTokensCount()).to.equal(MAX_SUPPLY - 5);
        });

        it("Debería retornar los tokens restantes que puede comprar un wallet", async function () {
            // Wallet sin compras
            expect(await enanosDeLeyenda.getRemainingTokensForWallet(buyer1.address)).to.equal(MAX_TOKENS_PER_WALLET);
            
            // Comprar algunos tokens
            await enanosDeLeyenda.connect(buyer1).buyNFT(3);
            expect(await enanosDeLeyenda.getRemainingTokensForWallet(buyer1.address)).to.equal(MAX_TOKENS_PER_WALLET - 3);
            
            // Comprar el máximo
            await enanosDeLeyenda.connect(buyer1).buyNFT(7);
            expect(await enanosDeLeyenda.getRemainingTokensForWallet(buyer1.address)).to.equal(0);
        });
    });

    describe("Casos Edge y Validaciones", function () {
        it("Debería manejar correctamente la compra cuando hay tokens ya vendidos", async function () {
            // Comprar algunos tokens
            await enanosDeLeyenda.connect(buyer1).buyNFT(3);
            
            // Comprar más tokens (debería saltar los ya vendidos)
            await enanosDeLeyenda.connect(buyer2).buyNFT(2);
            
            expect(await enanosDeLeyenda.ownerOf(1)).to.equal(buyer1.address);
            expect(await enanosDeLeyenda.ownerOf(2)).to.equal(buyer1.address);
            expect(await enanosDeLeyenda.ownerOf(3)).to.equal(buyer1.address);
            expect(await enanosDeLeyenda.ownerOf(4)).to.equal(buyer2.address);
            expect(await enanosDeLeyenda.ownerOf(5)).to.equal(buyer2.address);
        });

        it("Debería actualizar correctamente el contador de tokens comprados", async function () {
            expect(await enanosDeLeyenda.tokensPurchased(buyer1.address)).to.equal(0);
            
            await enanosDeLeyenda.connect(buyer1).buyNFT(3);
            expect(await enanosDeLeyenda.tokensPurchased(buyer1.address)).to.equal(3);
            
            await enanosDeLeyenda.connect(buyer1).buyNFT(2);
            expect(await enanosDeLeyenda.tokensPurchased(buyer1.address)).to.equal(5);
        });

        it("Debería manejar correctamente la función _toString", async function () {
            // Probar con diferentes números para verificar la conversión a string
            const testCases = [1, 10, 100, 188];
            
            for (const testCase of testCases) {
                const expectedURI = BASE_URI + testCase.toString() + ".json";
                expect(await enanosDeLeyenda.tokenURI(testCase)).to.equal(expectedURI);
            }
        });

        it("Debería emitir eventos correctamente", async function () {
            // Probar evento NFTSold
            await expect(enanosDeLeyenda.connect(buyer1).buyNFT(1))
                .to.emit(enanosDeLeyenda, "NFTSold")
                .withArgs(1, buyer1.address, PRICE);

            // Probar evento BaseURIUpdated
            const newBaseURI = "https://newapi.enanosdeleyenda.com/metadata/";
            await expect(enanosDeLeyenda.setBaseURI(newBaseURI))
                .to.emit(enanosDeLeyenda, "BaseURIUpdated")
                .withArgs(newBaseURI);

            // Probar evento TokenURIUpdated
            const tokenId = 2;
            const specificURI = "https://api.enanosdeleyenda.com/metadata/special/2.json";
            await expect(enanosDeLeyenda.setTokenURI(tokenId, specificURI))
                .to.emit(enanosDeLeyenda, "TokenURIUpdated")
                .withArgs(tokenId, specificURI);
        });
    });
});

// Mock USDC para las pruebas
describe("MockUSDC", function () {
    let mockUSDC;
    let owner;
    let user;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        
        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        mockUSDC = await MockUSDC.deploy();
        await mockUSDC.waitForDeployment();
    });

    it("Debería permitir mintear tokens", async function () {
        const amount = ethers.parseUnits("1000", 6);
        await mockUSDC.mint(user.address, amount);
        expect(await mockUSDC.balanceOf(user.address)).to.equal(amount);
    });

    it("Debería permitir transferir tokens", async function () {
        const amount = ethers.parseUnits("1000", 6);
        await mockUSDC.mint(user.address, amount);
        
        await mockUSDC.connect(user).transfer(owner.address, amount);
        expect(await mockUSDC.balanceOf(owner.address)).to.equal(amount);
    });

    it("Debería permitir aprobar y transferFrom", async function () {
        const amount = ethers.parseUnits("1000", 6);
        await mockUSDC.mint(user.address, amount);
        
        await mockUSDC.connect(user).approve(owner.address, amount);
        await mockUSDC.connect(owner).transferFrom(user.address, owner.address, amount);
        
        expect(await mockUSDC.balanceOf(owner.address)).to.equal(amount);
    });
});
