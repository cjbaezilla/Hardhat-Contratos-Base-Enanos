const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DAO", function () {
    let dao;
    let nftContract;
    let owner;
    let proposer1;
    let proposer2;
    let voter1;
    let voter2;
    let voter3;
    let otherAccounts;

    const MIN_PROPOSAL_VOTES = 10;
    const MIN_VOTES_TO_APPROVE = 10;
    const MIN_TOKENS_TO_APPROVE = 50;

    // Función helper para obtener tiempos de propuesta
    async function getProposalTimes() {
        const currentTime = await ethers.provider.getBlock('latest');
        const startTime = currentTime.timestamp + 3600; // 1 hora en el futuro
        const endTime = startTime + 86400; // 24 horas después
        return { startTime, endTime };
    }

    beforeEach(async function () {
        [owner, proposer1, proposer2, voter1, voter2, voter3, ...otherAccounts] = await ethers.getSigners();

        // Desplegar un mock de contrato NFT para las pruebas
        const MockNFT = await ethers.getContractFactory("EnanosDeLeyenda");
        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        
        // Crear mock USDC
        const usdcToken = await MockUSDC.deploy();
        await usdcToken.waitForDeployment();
        
        // Crear mock NFT
        nftContract = await MockNFT.deploy(await usdcToken.getAddress(), "https://api.test.com/");
        await nftContract.waitForDeployment();

        // Desplegar el contrato DAO
        const DAO = await ethers.getContractFactory("DAO");
        dao = await DAO.deploy(await nftContract.getAddress());
        await dao.waitForDeployment();

        // Dar USDC a los usuarios para que puedan comprar NFTs
        const usdcAmount = ethers.parseUnits("1000", 6); // 1000 USDC para cada usuario
        await usdcToken.mint(proposer1.address, usdcAmount);
        await usdcToken.mint(proposer2.address, usdcAmount);
        await usdcToken.mint(voter1.address, usdcAmount);
        await usdcToken.mint(voter2.address, usdcAmount);
        await usdcToken.mint(voter3.address, usdcAmount);

        // Aprobar al contrato NFT para gastar USDC
        await usdcToken.connect(proposer1).approve(await nftContract.getAddress(), ethers.parseUnits("1000", 6));
        await usdcToken.connect(proposer2).approve(await nftContract.getAddress(), ethers.parseUnits("1000", 6));
        await usdcToken.connect(voter1).approve(await nftContract.getAddress(), ethers.parseUnits("1000", 6));
        await usdcToken.connect(voter2).approve(await nftContract.getAddress(), ethers.parseUnits("1000", 6));
        await usdcToken.connect(voter3).approve(await nftContract.getAddress(), ethers.parseUnits("1000", 6));

        // Comprar NFTs para los usuarios usando la función buyNFT
        // Nota: MAX_TOKENS_PER_WALLET = 10, así que ajustamos las cantidades
        await nftContract.connect(proposer1).buyNFT(10); // 10 NFTs (máximo permitido)
        await nftContract.connect(proposer2).buyNFT(10); // 10 NFTs (máximo permitido)
        await nftContract.connect(voter1).buyNFT(5);     // 5 NFTs
        await nftContract.connect(voter2).buyNFT(8);     // 8 NFTs
        await nftContract.connect(voter3).buyNFT(3);     // 3 NFTs
    });

    describe("Constructor y Constantes", function () {
        it("Debería desplegar correctamente con las constantes correctas", async function () {
            expect(await dao.nftContract()).to.equal(await nftContract.getAddress());
            expect(await dao.MIN_PROPOSAL_VOTES()).to.equal(MIN_PROPOSAL_VOTES);
            expect(await dao.MIN_VOTES_TO_APPROVE()).to.equal(MIN_VOTES_TO_APPROVE);
            expect(await dao.MIN_TOKENS_TO_APPROVE()).to.equal(MIN_TOKENS_TO_APPROVE);
            expect(await dao.owner()).to.equal(owner.address);
            expect(await dao.proposalCount()).to.equal(0);
        });

        it("Debería inicializar con 0 propuestas", async function () {
            expect(await dao.getTotalProposals()).to.equal(0);
        });
    });

    describe("Función createProposal", function () {
        const username = "testuser";
        const description = "Propuesta de prueba";
        const link = "https://example.com/proposal";

        it("Debería crear una propuesta correctamente", async function () {
            const { startTime, endTime } = await getProposalTimes();
            await expect(dao.connect(proposer1).createProposal(username, description, link, startTime, endTime))
                .to.emit(dao, "ProposalCreated")
                .withArgs(0, proposer1.address, description, startTime, endTime);

            const proposal = await dao.getProposal(0);
            expect(proposal.id).to.equal(0);
            expect(proposal.proposer).to.equal(proposer1.address);
            expect(proposal.username).to.equal(username);
            expect(proposal.description).to.equal(description);
            expect(proposal.link).to.equal(link);
            expect(proposal.votesFor).to.equal(0);
            expect(proposal.votesAgainst).to.equal(0);
            expect(proposal.startTime).to.equal(startTime);
            expect(proposal.endTime).to.equal(endTime);
            expect(proposal.cancelled).to.be.false;

            expect(await dao.getTotalProposals()).to.equal(1);
        });

        it("Debería fallar si no tiene suficientes NFTs", async function () {
            const { startTime, endTime } = await getProposalTimes();
            // voter1 solo tiene 5 NFTs, necesita 10
            await expect(dao.connect(voter1).createProposal(username, description, link, startTime, endTime))
                .to.be.revertedWith("Necesitas al menos 10 NFTs para crear propuesta");
        });

        it("Debería fallar si startTime es en el pasado", async function () {
            const { endTime } = await getProposalTimes();
            const pastStartTime = Math.floor(Date.now() / 1000) - 3600; // 1 hora en el pasado
            await expect(dao.connect(proposer1).createProposal(username, description, link, pastStartTime, endTime))
                .to.be.revertedWith("startTime debe ser en el futuro");
        });

        it("Debería fallar si endTime es menor o igual a startTime", async function () {
            const { startTime } = await getProposalTimes();
            const invalidEndTime = startTime - 1;
            await expect(dao.connect(proposer1).createProposal(username, description, link, startTime, invalidEndTime))
                .to.be.revertedWith("endTime debe ser mayor que startTime");
        });

        it("Debería prevenir spam con límite de 24 horas", async function () {
            const { startTime, endTime } = await getProposalTimes();
            // Crear primera propuesta
            await dao.connect(proposer1).createProposal(username, description, link, startTime, endTime);
            
            // Intentar crear segunda propuesta inmediatamente
            await expect(dao.connect(proposer1).createProposal(username, description, link, startTime + 3600, endTime + 3600))
                .to.be.revertedWith("Solo puedes crear una propuesta cada 24 horas");
        });

        it("Debería permitir crear propuesta después de 24 horas", async function () {
            const { startTime, endTime } = await getProposalTimes();
            // Crear primera propuesta
            await dao.connect(proposer1).createProposal(username, description, link, startTime, endTime);
            
            // Avanzar tiempo 25 horas
            await ethers.provider.send("evm_increaseTime", [25 * 3600]);
            await ethers.provider.send("evm_mine");
            
            // Crear segunda propuesta
            const newStartTime = (await ethers.provider.getBlock('latest')).timestamp + 3600;
            const newEndTime = newStartTime + 86400;
            
            await expect(dao.connect(proposer1).createProposal(username, description, link, newStartTime, newEndTime))
                .to.emit(dao, "ProposalCreated")
                .withArgs(1, proposer1.address, description, newStartTime, newEndTime);
        });

        it("Debería incrementar proposalCount correctamente", async function () {
            const { startTime, endTime } = await getProposalTimes();
            expect(await dao.proposalCount()).to.equal(0);
            
            await dao.connect(proposer1).createProposal(username, description, link, startTime, endTime);
            expect(await dao.proposalCount()).to.equal(1);
            
            await dao.connect(proposer2).createProposal(username, description, link, startTime + 3600, endTime + 3600);
            expect(await dao.proposalCount()).to.equal(2);
        });
    });

    describe("Función vote", function () {
        let proposalId;
        const username = "testuser";
        const description = "Propuesta de prueba";
        const link = "https://example.com/proposal";
        let startTime;
        let endTime;

        beforeEach(async function () {
            const times = await getProposalTimes();
            startTime = times.startTime;
            endTime = times.endTime;
            
            // Crear una propuesta
            await dao.connect(proposer1).createProposal(username, description, link, startTime, endTime);
            proposalId = 0;
        });

        it("Debería votar a favor correctamente", async function () {
            // Avanzar tiempo para que la votación esté activa
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");

            await expect(dao.connect(voter1).vote(proposalId, true))
                .to.emit(dao, "VoteCast")
                .withArgs(proposalId, voter1.address, true, 5);

            const proposal = await dao.getProposal(proposalId);
            expect(proposal.votesFor).to.equal(5);
            expect(proposal.votesAgainst).to.equal(0);
            expect(await dao.hasVoted(proposalId, voter1.address)).to.be.true;
            expect(await dao.getUniqueVotersCount(proposalId)).to.equal(1);
            expect(await dao.getProposalTotalVotingPower(proposalId)).to.equal(5);
        });

        it("Debería votar en contra correctamente", async function () {
            // Avanzar tiempo para que la votación esté activa
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");

            await expect(dao.connect(voter1).vote(proposalId, false))
                .to.emit(dao, "VoteCast")
                .withArgs(proposalId, voter1.address, false, 5);

            const proposal = await dao.getProposal(proposalId);
            expect(proposal.votesFor).to.equal(0);
            expect(proposal.votesAgainst).to.equal(5);
        });

        it("Debería fallar si la propuesta no existe", async function () {
            await expect(dao.connect(voter1).vote(999, true))
                .to.be.revertedWith("Propuesta no existe");
        });

        it("Debería fallar si la votación no ha comenzado", async function () {
            await expect(dao.connect(voter1).vote(proposalId, true))
                .to.be.revertedWith("Votacion no ha comenzado");
        });

        it("Debería fallar si la votación ha terminado", async function () {
            // Avanzar tiempo para que la votación haya terminado
            await ethers.provider.send("evm_increaseTime", [25 * 3600]);
            await ethers.provider.send("evm_mine");

            await expect(dao.connect(voter1).vote(proposalId, true))
                .to.be.revertedWith("Votacion ha terminado");
        });

        it("Debería fallar si ya votó en la propuesta", async function () {
            // Avanzar tiempo para que la votación esté activa
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");

            // Votar por primera vez
            await dao.connect(voter1).vote(proposalId, true);
            
            // Intentar votar de nuevo
            await expect(dao.connect(voter1).vote(proposalId, false))
                .to.be.revertedWith("Ya votaste en esta propuesta");
        });

        it("Debería fallar si no tiene NFTs", async function () {
            // Crear un usuario sin NFTs
            const [userWithoutNFTs] = await ethers.getSigners();
            
            // Avanzar tiempo para que la votación esté activa
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");

            await expect(dao.connect(userWithoutNFTs).vote(proposalId, true))
                .to.be.revertedWith("Necesitas al menos 1 NFT para votar");
        });

        it("Debería fallar si la propuesta está cancelada", async function () {
            // Cancelar la propuesta
            await dao.connect(proposer1).cancelProposal(proposalId);
            
            // Avanzar tiempo para que la votación esté activa
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");

            await expect(dao.connect(voter1).vote(proposalId, true))
                .to.be.revertedWith("Propuesta cancelada");
        });

        it("Debería acumular votos correctamente", async function () {
            // Avanzar tiempo para que la votación esté activa
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");

            // Múltiples votos
            await dao.connect(voter1).vote(proposalId, true);  // 5 votos a favor
            await dao.connect(voter2).vote(proposalId, true);  // 8 votos a favor
            await dao.connect(voter3).vote(proposalId, false); // 3 votos en contra

            const proposal = await dao.getProposal(proposalId);
            expect(proposal.votesFor).to.equal(13);
            expect(proposal.votesAgainst).to.equal(3);
            expect(await dao.getUniqueVotersCount(proposalId)).to.equal(3);
            expect(await dao.getProposalTotalVotingPower(proposalId)).to.equal(16);
        });
    });

    describe("Función cancelProposal", function () {
        let proposalId;
        const username = "testuser";
        const description = "Propuesta de prueba";
        const link = "https://example.com/proposal";
        let startTime;
        let endTime;

        beforeEach(async function () {
            const times = await getProposalTimes();
            startTime = times.startTime;
            endTime = times.endTime;
            
            // Crear una propuesta
            await dao.connect(proposer1).createProposal(username, description, link, startTime, endTime);
            proposalId = 0;
        });

        it("Debería cancelar propuesta correctamente", async function () {
            await expect(dao.connect(proposer1).cancelProposal(proposalId))
                .to.emit(dao, "ProposalCancelled")
                .withArgs(proposalId);

            const proposal = await dao.getProposal(proposalId);
            expect(proposal.cancelled).to.be.true;
        });

        it("Debería fallar si no es el proposer", async function () {
            await expect(dao.connect(voter1).cancelProposal(proposalId))
                .to.be.revertedWith("Solo el proposer puede cancelar");
        });

        it("Debería fallar si la propuesta no existe", async function () {
            await expect(dao.connect(proposer1).cancelProposal(999))
                .to.be.revertedWith("Propuesta no existe");
        });

        it("Debería fallar si la propuesta ya está cancelada", async function () {
            await dao.connect(proposer1).cancelProposal(proposalId);
            
            await expect(dao.connect(proposer1).cancelProposal(proposalId))
                .to.be.revertedWith("Propuesta ya cancelada");
        });

        it("Debería fallar si la votación ya terminó", async function () {
            // Avanzar tiempo para que la votación haya terminado
            await ethers.provider.send("evm_increaseTime", [25 * 3600]);
            await ethers.provider.send("evm_mine");

            await expect(dao.connect(proposer1).cancelProposal(proposalId))
                .to.be.revertedWith("Votacion ya termino");
        });
    });

    describe("Funciones de Consulta", function () {
        let proposalId;
        const username = "testuser";
        const description = "Propuesta de prueba";
        const link = "https://example.com/proposal";
        let startTime;
        let endTime;

        beforeEach(async function () {
            const times = await getProposalTimes();
            startTime = times.startTime;
            endTime = times.endTime;
            
            // Crear una propuesta
            await dao.connect(proposer1).createProposal(username, description, link, startTime, endTime);
            proposalId = 0;
        });

        it("Debería retornar el poder de voto correctamente", async function () {
            expect(await dao.getVotingPower(voter1.address)).to.equal(5);
            expect(await dao.getVotingPower(voter2.address)).to.equal(8);
            expect(await dao.getVotingPower(proposer1.address)).to.equal(10);
        });

        it("Debería retornar el estado correcto de la propuesta", async function () {
            // Estado pendiente
            expect(await dao.getProposalStatus(proposalId)).to.equal("Pendiente");
            
            // Avanzar tiempo para que la votación esté activa
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");
            
            expect(await dao.getProposalStatus(proposalId)).to.equal("Votando");
            
            // Avanzar tiempo para que la votación termine
            await ethers.provider.send("evm_increaseTime", [24 * 3600]);
            await ethers.provider.send("evm_mine");
            
            expect(await dao.getProposalStatus(proposalId)).to.equal("Rechazada");
        });

        it("Debería retornar 'No existe' para propuesta inexistente", async function () {
            expect(await dao.getProposalStatus(999)).to.equal("No existe");
        });

        it("Debería retornar 'Cancelada' para propuesta cancelada", async function () {
            await dao.connect(proposer1).cancelProposal(proposalId);
            expect(await dao.getProposalStatus(proposalId)).to.equal("Cancelada");
        });

        it("Debería retornar 'Aprobada' cuando se cumplen todos los criterios", async function () {
            // Avanzar tiempo para que la votación esté activa
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");
            
            // Crear más votantes para cumplir los criterios mínimos
            // Necesitamos al menos 10 votantes únicos y 50 tokens totales
            const additionalVoters = otherAccounts.slice(0, 8);
            
            // Dar USDC a votantes adicionales y hacer que compren NFTs
            const usdcAmount = ethers.parseUnits("1000", 6);
            const usdcTokenAddress = await nftContract.usdcToken();
            const usdcToken = await ethers.getContractAt("MockUSDC", usdcTokenAddress);
            
            for (let i = 0; i < 8; i++) {
                await usdcToken.mint(additionalVoters[i].address, usdcAmount);
                await usdcToken.connect(additionalVoters[i]).approve(await nftContract.getAddress(), ethers.parseUnits("1000", 6));
                await nftContract.connect(additionalVoters[i]).buyNFT(5);
            }
            
            // Todos votan a favor
            await dao.connect(voter1).vote(proposalId, true);  // 5 votos
            await dao.connect(voter2).vote(proposalId, true);  // 8 votos
            await dao.connect(voter3).vote(proposalId, true);  // 3 votos
            
            for (let i = 0; i < 8; i++) {
                await dao.connect(additionalVoters[i]).vote(proposalId, true); // 5 votos cada uno
            }
            
            // Avanzar tiempo para que la votación termine
            await ethers.provider.send("evm_increaseTime", [24 * 3600]);
            await ethers.provider.send("evm_mine");
            
            expect(await dao.getProposalStatus(proposalId)).to.equal("Aprobada");
        });

        it("Debería retornar el total de propuestas correctamente", async function () {
            expect(await dao.getTotalProposals()).to.equal(1);
            
            // Crear más propuestas
            await dao.connect(proposer2).createProposal(username, description, link, startTime + 3600, endTime + 3600);
            expect(await dao.getTotalProposals()).to.equal(2);
        });
    });

    describe("Funciones de Administración", function () {
        it("Debería actualizar el contrato NFT correctamente", async function () {
            const newNFTAddress = voter1.address; // Simulamos una nueva dirección
            
            await expect(dao.updateNFTContract(newNFTAddress))
                .to.emit(dao, "NFTContractUpdated")
                .withArgs(await nftContract.getAddress(), newNFTAddress);
            
            expect(await dao.nftContract()).to.equal(newNFTAddress);
        });

        it("Debería fallar si un no-owner intenta actualizar el contrato NFT", async function () {
            await expect(dao.connect(voter1).updateNFTContract(voter2.address))
                .to.be.revertedWithCustomError(dao, "OwnableUnauthorizedAccount")
                .withArgs(voter1.address);
        });

        it("Debería fallar si se intenta actualizar con dirección inválida", async function () {
            await expect(dao.updateNFTContract(ethers.ZeroAddress))
                .to.be.revertedWith("Direccion invalida");
        });

        it("Debería fallar si se intenta actualizar con la misma dirección", async function () {
            await expect(dao.updateNFTContract(await nftContract.getAddress()))
                .to.be.revertedWith("Misma direccion actual");
        });

        it("Debería actualizar MIN_PROPOSAL_VOTES correctamente", async function () {
            const newValue = 15;
            
            await expect(dao.updateMinProposalVotes(newValue))
                .to.emit(dao, "MinProposalVotesUpdated")
                .withArgs(MIN_PROPOSAL_VOTES, newValue);
            
            expect(await dao.MIN_PROPOSAL_VOTES()).to.equal(newValue);
        });

        it("Debería fallar si se intenta actualizar MIN_PROPOSAL_VOTES con 0", async function () {
            await expect(dao.updateMinProposalVotes(0))
                .to.be.revertedWith("Valor debe ser mayor a 0");
        });

        it("Debería actualizar MIN_VOTES_TO_APPROVE correctamente", async function () {
            const newValue = 15;
            
            await expect(dao.updateMinVotesToApprove(newValue))
                .to.emit(dao, "MinVotesToApproveUpdated")
                .withArgs(MIN_VOTES_TO_APPROVE, newValue);
            
            expect(await dao.MIN_VOTES_TO_APPROVE()).to.equal(newValue);
        });

        it("Debería actualizar MIN_TOKENS_TO_APPROVE correctamente", async function () {
            const newValue = 100;
            
            await expect(dao.updateMinTokensToApprove(newValue))
                .to.emit(dao, "MinTokensToApproveUpdated")
                .withArgs(MIN_TOKENS_TO_APPROVE, newValue);
            
            expect(await dao.MIN_TOKENS_TO_APPROVE()).to.equal(newValue);
        });

        it("Debería fallar si un no-owner intenta actualizar parámetros", async function () {
            await expect(dao.connect(voter1).updateMinProposalVotes(15))
                .to.be.revertedWithCustomError(dao, "OwnableUnauthorizedAccount")
                .withArgs(voter1.address);
        });
    });

    describe("Casos Edge y Validaciones Complejas", function () {
        it("Debería manejar correctamente el estado de propuesta con votos mixtos", async function () {
            const username = "testuser";
            const description = "Propuesta de prueba";
            const link = "https://example.com/proposal";
            const { startTime, endTime } = await getProposalTimes();
            
            // Crear propuesta
            await dao.connect(proposer1).createProposal(username, description, link, startTime, endTime);
            const proposalId = 0;
            
            // Avanzar tiempo para que la votación esté activa
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");
            
            // Votos mixtos
            await dao.connect(voter1).vote(proposalId, true);  // 5 votos a favor
            await dao.connect(voter2).vote(proposalId, false); // 8 votos en contra
            await dao.connect(voter3).vote(proposalId, true);  // 3 votos a favor
            
            // Avanzar tiempo para que la votación termine
            await ethers.provider.send("evm_increaseTime", [24 * 3600]);
            await ethers.provider.send("evm_mine");
            
            // Debería estar rechazada (8 votos en contra vs 8 votos a favor, pero no cumple criterios mínimos)
            expect(await dao.getProposalStatus(proposalId)).to.equal("Rechazada");
        });

        it("Debería manejar correctamente múltiples propuestas simultáneas", async function () {
            const username = "testuser";
            const description = "Propuesta de prueba";
            const link = "https://example.com/proposal";
            const { startTime, endTime } = await getProposalTimes();
            
            // Crear múltiples propuestas
            await dao.connect(proposer1).createProposal(username, description, link, startTime, endTime);
            await dao.connect(proposer2).createProposal(username, description, link, startTime + 1800, endTime + 1800);
            
            expect(await dao.getTotalProposals()).to.equal(2);
            
            // Verificar que las propuestas son independientes
            const proposal1 = await dao.getProposal(0);
            const proposal2 = await dao.getProposal(1);
            
            expect(proposal1.proposer).to.equal(proposer1.address);
            expect(proposal2.proposer).to.equal(proposer2.address);
        });

        it("Debería manejar correctamente el límite de tiempo entre propuestas", async function () {
            const username = "testuser";
            const description = "Propuesta de prueba";
            const link = "https://example.com/proposal";
            const { startTime, endTime } = await getProposalTimes();
            
            // Crear primera propuesta
            await dao.connect(proposer1).createProposal(username, description, link, startTime, endTime);
            
            // Verificar que no puede crear otra inmediatamente
            await expect(dao.connect(proposer1).createProposal(username, description, link, startTime + 3600, endTime + 3600))
                .to.be.revertedWith("Solo puedes crear una propuesta cada 24 horas");
            
            // Avanzar exactamente 24 horas
            await ethers.provider.send("evm_increaseTime", [24 * 3600]);
            await ethers.provider.send("evm_mine");
            
            // Ahora debería poder crear otra propuesta
            const newStartTime = (await ethers.provider.getBlock('latest')).timestamp + 3600;
            const newEndTime = newStartTime + 86400;
            
            await expect(dao.connect(proposer1).createProposal(username, description, link, newStartTime, newEndTime))
                .to.emit(dao, "ProposalCreated");
        });

        it("Debería emitir eventos correctamente en todas las operaciones", async function () {
            const username = "testuser";
            const description = "Propuesta de prueba";
            const link = "https://example.com/proposal";
            const { startTime, endTime } = await getProposalTimes();
            
            // Evento ProposalCreated
            await expect(dao.connect(proposer1).createProposal(username, description, link, startTime, endTime))
                .to.emit(dao, "ProposalCreated")
                .withArgs(0, proposer1.address, description, startTime, endTime);
            
            // Avanzar tiempo para que la votación esté activa
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");
            
            // Evento VoteCast
            await expect(dao.connect(voter1).vote(0, true))
                .to.emit(dao, "VoteCast")
                .withArgs(0, voter1.address, true, 5);
            
            // Evento ProposalCancelled
            await expect(dao.connect(proposer1).cancelProposal(0))
                .to.emit(dao, "ProposalCancelled")
                .withArgs(0);
        });
    });
});
