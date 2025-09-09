/*
 /$$$$$$$$ /$$   /$$  /$$$$$$  /$$   /$$  /$$$$$$   /$$$$$$        /$$$$$$$  /$$$$$$$$      
| $$_____/| $$$ | $$ /$$__  $$| $$$ | $$ /$$__  $$ /$$__  $$      | $$__  $$| $$_____/      
| $$      | $$$$| $$| $$  \ $$| $$$$| $$| $$  \ $$| $$  \__/      | $$  \ $$| $$            
| $$$$$   | $$ $$ $$| $$$$$$$$| $$ $$ $$| $$  | $$|  $$$$$$       | $$  | $$| $$$$$         
| $$__/   | $$  $$$$| $$__  $$| $$  $$$$| $$  | $$ \____  $$      | $$  | $$| $$__/         
| $$      | $$\  $$$| $$  | $$| $$\  $$$| $$  | $$ /$$  \ $$      | $$  | $$| $$            
| $$$$$$$$| $$ \  $$| $$  | $$| $$ \  $$|  $$$$$$/|  $$$$$$/      | $$$$$$$/| $$$$$$$$      
|________/|__/  \__/|__/  |__/|__/  \__/ \______/  \______/       |_______/ |________/      
                                                                                                                                                                                                                                                                 
 /$$       /$$$$$$$$ /$$     /$$ /$$$$$$$$ /$$   /$$ /$$$$$$$   /$$$$$$                     
| $$      | $$_____/|  $$   /$$/| $$_____/| $$$ | $$| $$__  $$ /$$__  $$                    
| $$      | $$       \  $$ /$$/ | $$      | $$$$| $$| $$  \ $$| $$  \ $$                    
| $$      | $$$$$     \  $$$$/  | $$$$$   | $$ $$ $$| $$  | $$| $$$$$$$$                    
| $$      | $$__/      \  $$/   | $$__/   | $$  $$$$| $$  | $$| $$__  $$                    
| $$      | $$          | $$    | $$      | $$\  $$$| $$  | $$| $$  | $$                    
| $$$$$$$$| $$$$$$$$    | $$    | $$$$$$$$| $$ \  $$| $$$$$$$/| $$  | $$                    
|________/|________/    |__/    |________/|__/  \__/|_______/ |__/  |__/  

- WEBSITE: https://baeza.me
- TWITTER: https://x.com/cjbazilla
- GITHUB: https://github.com/cjbaezilla
- TELEGRAM: https://t.me/VELVET_T_99
*/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract EnanosDeLeyenda is ERC721, Ownable {
    uint256 public constant MAX_SUPPLY = 188;
    uint256 public constant PRICE = 1e6; // 1 USDC (6 decimales)
    uint256 public constant MAX_TOKENS_PER_WALLET = 10;
    
    IERC20 public immutable usdcToken;
    mapping(uint256 => bool) public sold;
    mapping(address => uint256) public tokensPurchased;
    
    // Base URI dinámica para metadatos
    string private _baseTokenURI;
    // Mapeo para URIs individuales por token (opcional)
    mapping(uint256 => string) private _tokenURIs;

    constructor(address _usdcToken, string memory baseTokenURI) ERC721("Enanos de Leyenda", "ENANOS") Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
        _baseTokenURI = baseTokenURI;
        for (uint256 i = 1; i <= MAX_SUPPLY; i++) {
            _safeMint(address(this), i);
        }
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Compra una cantidad específica de NFTs no vendidos por 1 USDC cada uno
     * @param tokenAmount Cantidad de NFTs a comprar
     */
    function buyNFT(uint256 tokenAmount) external {
        require(tokenAmount > 0, "Cantidad debe ser mayor a 0");
        
        uint256 availableTokens = this.getAvailableTokensCount();
        require(tokenAmount <= availableTokens, "Cantidad excede el suministro maximo");
        
        // Validar límite por wallet
        require(tokensPurchased[msg.sender] + tokenAmount <= MAX_TOKENS_PER_WALLET, 
                "Excede el limite de tokens por wallet");
        
        uint256 totalPrice = PRICE * tokenAmount;
        
        // Transferir USDC del comprador al admin
        require(usdcToken.transferFrom(msg.sender, owner(), totalPrice), "Transferencia USDC fallida");
        
        // Encontrar y transferir los primeros tokenAmount NFTs no vendidos
        uint256 tokensTransferred = 0;
        for (uint256 i = 1; i <= MAX_SUPPLY && tokensTransferred < tokenAmount; i++) {
            if (!sold[i] && ownerOf(i) == address(this)) {
                // Marcar como vendido
                sold[i] = true;
                
                // Transferir NFT al comprador
                _transfer(address(this), msg.sender, i);
                
                tokensTransferred++;
                emit NFTSold(i, msg.sender, PRICE);
            }
        }
        
        // Actualizar contador de tokens comprados por wallet
        tokensPurchased[msg.sender] += tokensTransferred;
    }

    /**
     * @dev Retira todos los tokens ERC20 del contrato (solo owner)
     * @param token Dirección del token ERC20 a retirar
     */
    function withdrawToken(IERC20 token) external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No hay tokens para retirar");
        
        require(token.transfer(owner(), balance), "Transferencia de token fallida");
        
        emit TokenWithdrawn(address(token), owner(), balance);
    }

    /**
     * @dev Actualiza la base URI para los metadatos (solo owner)
     * @param newBaseURI Nueva base URI para los metadatos
     */
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @dev Establece una URI específica para un token individual (solo owner)
     * @param tokenId ID del token
     * @param newTokenURI URI específica para el token
     */
    function setTokenURI(uint256 tokenId, string calldata newTokenURI) external onlyOwner {
        require(tokenId >= 1 && tokenId <= MAX_SUPPLY, "Token no existe");
        _tokenURIs[tokenId] = newTokenURI;
        emit TokenURIUpdated(tokenId, newTokenURI);
    }

    /**
     * @dev Obtiene la URI completa de un token
     * @param tokenId ID del token
     * @return URI completa del token
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId >= 1 && tokenId <= MAX_SUPPLY, "Token no existe");
        
        // Si hay una URI específica para este token, usarla
        if (bytes(_tokenURIs[tokenId]).length > 0) {
            return _tokenURIs[tokenId];
        }
        
        // Si no, usar la base URI con el ID del token
        return string(abi.encodePacked(_baseTokenURI, _toString(tokenId), ".json"));
    }

    /**
     * @dev Obtiene la base URI actual
     * @return Base URI actual
     */
    function getBaseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Convierte un uint256 a string
     * @param value Valor a convertir
     * @return String representation del valor
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Obtiene el balance de USDC del contrato
     */
    function getUSDCBalance() external view returns (uint256) {
        return usdcToken.balanceOf(address(this));
    }

    /**
     * @dev Verifica si un NFT está disponible para venta
     * @param tokenId ID del NFT
     */
    function isAvailableForSale(uint256 tokenId) external view returns (bool) {
        return tokenId >= 1 && tokenId <= MAX_SUPPLY && !sold[tokenId] && ownerOf(tokenId) == address(this);
    }

    /**
     * @dev Obtiene la cantidad de NFTs disponibles para venta
     */
    function getAvailableTokensCount() external view returns (uint256) {
        uint256 availableTokens = 0;
        for (uint256 i = 1; i <= MAX_SUPPLY; i++) {
            if (!sold[i] && ownerOf(i) == address(this)) {
                availableTokens++;
            }
        }
        return availableTokens;
    }

    /**
     * @dev Obtiene cuántos tokens puede comprar aún un wallet específico
     * @param wallet Dirección del wallet a consultar
     */
    function getRemainingTokensForWallet(address wallet) external view returns (uint256) {
        uint256 purchased = tokensPurchased[wallet];
        if (purchased >= MAX_TOKENS_PER_WALLET) {
            return 0;
        }
        return MAX_TOKENS_PER_WALLET - purchased;
    }

    // Eventos
    event NFTSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);
    event BaseURIUpdated(string newBaseURI);
    event TokenURIUpdated(uint256 indexed tokenId, string tokenURI);
}
