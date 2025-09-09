# Guía de Integración: EnanosDeLeyenda NFT Contract

## 📋 Resumen del Contrato

**EnanosDeLeyenda** es un contrato inteligente ERC721 que implementa un sistema de venta de NFTs con las siguientes características principales:

- **Token**: ERC721 con nombre "Enanos de Leyenda" y símbolo "ENANOS"
- **Suministro máximo**: 188 NFTs
- **Precio**: 1 USDC por NFT
- **Límite por wallet**: 10 NFTs máximo
- **Método de pago**: USDC (USD Coin)
- **Mint automático**: Todos los NFTs se mintean al desplegar el contrato
- **Dirección Contrato**: 0x629A84412816b28636Eb1323923Cb27075d21525
- **ABI Contrato**: [{"inputs":[{"internalType":"address","name":"_usdcToken","type":"address"},{"internalType":"string","name":"baseTokenURI","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721IncorrectOwner","type":"error"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721InsufficientApproval","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC721InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"operator","type":"address"}],"name":"ERC721InvalidOperator","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"ERC721InvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC721InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC721InvalidSender","type":"error"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ERC721NonexistentToken","type":"error"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"newBaseURI","type":"string"}],"name":"BaseURIUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"NFTSold","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":false,"internalType":"string","name":"tokenURI","type":"string"}],"name":"TokenURIUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokenWithdrawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"MAX_SUPPLY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_TOKENS_PER_WALLET","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PRICE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenAmount","type":"uint256"}],"name":"buyNFT","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAvailableTokensCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getBaseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"wallet","type":"address"}],"name":"getRemainingTokensForWallet","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getUSDCBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"isAvailableForSale","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newBaseURI","type":"string"}],"name":"setBaseURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"string","name":"newTokenURI","type":"string"}],"name":"setTokenURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"sold","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"tokensPurchased","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"usdcToken","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"token","type":"address"}],"name":"withdrawToken","outputs":[],"stateMutability":"nonpayable","type":"function"}]

## 🏗️ Arquitectura del Contrato

### Herencias
- `ERC721`: Estándar de tokens no fungibles
- `Ownable`: Control de acceso con propietario único

### Dependencias
- `@openzeppelin/contracts/token/ERC721/ERC721.sol`
- `@openzeppelin/contracts/token/ERC20/IERC20.sol`
- `@openzeppelin/contracts/access/Ownable.sol`

## 📊 Constantes del Contrato

| Constante | Valor | Descripción |
|-----------|-------|-------------|
| `MAX_SUPPLY` | 188 | Cantidad máxima de NFTs que se pueden crear |
| `PRICE` | 1e6 | Precio en USDC (1 USDC = 1,000,000 unidades con 6 decimales) |
| `MAX_TOKENS_PER_WALLET` | 10 | Límite máximo de NFTs que puede comprar una wallet |

## 🔧 Funciones Públicas

### 1. Constructor
```solidity
constructor(address _usdcToken, string memory baseTokenURI)
```

**Parámetros:**
- `_usdcToken`: Dirección del contrato USDC
- `baseTokenURI`: URI base para los metadatos de los NFTs

**Funcionalidad:**
- Inicializa el contrato con el token USDC
- Establece la URI base para metadatos
- Mintea automáticamente todos los 188 NFTs al contrato

### 2. Compra de NFTs
```solidity
function buyNFT(uint256 tokenAmount) external
```

**Parámetros:**
- `tokenAmount`: Cantidad de NFTs a comprar (1-10)

**Validaciones:**
- La cantidad debe ser mayor a 0
- No puede exceder el suministro disponible
- No puede exceder el límite por wallet (10 NFTs)
- El comprador debe tener suficiente USDC y haber aprobado la transferencia

**Funcionalidad:**
- Transfiere USDC del comprador al propietario del contrato
- Encuentra y transfiere los primeros NFTs disponibles
- Actualiza el contador de tokens comprados por wallet
- Emite evento `NFTSold` por cada NFT vendido

### 3. Gestión de Metadatos

#### Establecer URI Base
```solidity
function setBaseURI(string calldata newBaseURI) external onlyOwner
```

#### Establecer URI Específica por Token
```solidity
function setTokenURI(uint256 tokenId, string calldata newTokenURI) external onlyOwner
```

#### Obtener URI de Token
```solidity
function tokenURI(uint256 tokenId) public view returns (string memory)
```

### 4. Funciones de Consulta

#### Verificar Disponibilidad
```solidity
function isAvailableForSale(uint256 tokenId) external view returns (bool)
```

#### Contar NFTs Disponibles
```solidity
function getAvailableTokensCount() external view returns (uint256)
```

#### Tokens Restantes por Wallet
```solidity
function getRemainingTokensForWallet(address wallet) external view returns (uint256)
```

#### Balance USDC del Contrato
```solidity
function getUSDCBalance() external view returns (uint256)
```

### 5. Gestión de Fondos

#### Retirar Tokens ERC20
```solidity
function withdrawToken(IERC20 token) external onlyOwner
```

## 📡 Eventos

### 1. NFTSold
```solidity
event NFTSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
```
**Emitido cuando:** Se vende un NFT
**Parámetros:**
- `tokenId`: ID del NFT vendido
- `buyer`: Dirección del comprador
- `price`: Precio pagado (en USDC)

### 2. TokenWithdrawn
```solidity
event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);
```
**Emitido cuando:** El propietario retira tokens del contrato
**Parámetros:**
- `token`: Dirección del token retirado
- `to`: Dirección de destino
- `amount`: Cantidad retirada

### 3. BaseURIUpdated
```solidity
event BaseURIUpdated(string newBaseURI);
```
**Emitido cuando:** Se actualiza la URI base de metadatos

### 4. TokenURIUpdated
```solidity
event TokenURIUpdated(uint256 indexed tokenId, string tokenURI);
```
**Emitido cuando:** Se actualiza la URI específica de un token

## 🚀 Integración con Next.js

### 1. Configuración Inicial

#### Instalación de Dependencias
```bash
npm install ethers @openzeppelin/contracts
npm install -D @types/node
```

#### Configuración de Variables de Entorno
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=https://...
NEXT_PUBLIC_CHAIN_ID=8453
```

### 2. Configuración del Provider y Contrato

#### hooks/useContract.js
```javascript
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

// ABI del contrato (simplificado)
const CONTRACT_ABI = [
  "function buyNFT(uint256 tokenAmount) external",
  "function getAvailableTokensCount() external view returns (uint256)",
  "function isAvailableForSale(uint256 tokenId) external view returns (bool)",
  "function getRemainingTokensForWallet(address wallet) external view returns (uint256)",
  "function getUSDCBalance() external view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function MAX_SUPPLY() external view returns (uint256)",
  "function PRICE() external view returns (uint256)",
  "function MAX_TOKENS_PER_WALLET() external view returns (uint256)",
  "event NFTSold(uint256 indexed tokenId, address indexed buyer, uint256 price)"
];

const USDC_ABI = [
  "function balanceOf(address owner) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)"
];

export const useContract = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [usdcContract, setUsdcContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initProvider = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        setContract(contract);
        
        const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);
        setUsdcContract(usdcContract);
      }
    };

    initProvider();
  }, []);

  const connectWallet = async () => {
    if (provider) {
      try {
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
  };

  return {
    provider,
    contract,
    usdcContract,
    account,
    isConnected,
    connectWallet
  };
};
```

### 3. Componente de Compra de NFTs

#### components/NFTMinter.jsx
```jsx
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useContract } from '../hooks/useContract';

const NFTMinter = () => {
  const { contract, usdcContract, account, isConnected, connectWallet } = useContract();
  const [tokenAmount, setTokenAmount] = useState(1);
  const [availableTokens, setAvailableTokens] = useState(0);
  const [remainingTokens, setRemainingTokens] = useState(0);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (contract && isConnected) {
      loadContractData();
    }
  }, [contract, isConnected]);

  const loadContractData = async () => {
    try {
      const [available, remaining, balance, contractPrice] = await Promise.all([
        contract.getAvailableTokensCount(),
        contract.getRemainingTokensForWallet(account),
        usdcContract.balanceOf(account),
        contract.PRICE()
      ]);

      setAvailableTokens(Number(available));
      setRemainingTokens(Number(remaining));
      setUsdcBalance(Number(balance) / 1e6); // Convertir a USDC real
      setPrice(Number(contractPrice) / 1e6);
    } catch (error) {
      console.error('Error loading contract data:', error);
    }
  };

  const handleBuyNFT = async () => {
    if (!contract || !usdcContract || !account) return;

    setIsLoading(true);
    try {
      const totalPrice = price * tokenAmount;
      const totalPriceWei = ethers.parseUnits(totalPrice.toString(), 6);

      // Verificar y aprobar USDC si es necesario
      const allowance = await usdcContract.allowance(account, contract.target);
      if (allowance < totalPriceWei) {
        const approveTx = await usdcContract.approve(contract.target, totalPriceWei);
        await approveTx.wait();
      }

      // Comprar NFTs
      const buyTx = await contract.buyNFT(tokenAmount);
      await buyTx.wait();

      // Recargar datos
      await loadContractData();
      
      alert(`¡Compra exitosa! Has comprado ${tokenAmount} NFT(s)`);
    } catch (error) {
      console.error('Error buying NFT:', error);
      alert('Error en la compra: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center">
        <button 
          onClick={connectWallet}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          Conectar Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Comprar Enanos de Leyenda</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Cantidad de NFTs (Máximo: {Math.min(remainingTokens, availableTokens)})
          </label>
          <input
            type="number"
            min="1"
            max={Math.min(remainingTokens, availableTokens)}
            value={tokenAmount}
            onChange={(e) => setTokenAmount(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p><strong>Precio por NFT:</strong> {price} USDC</p>
          <p><strong>Total:</strong> {(price * tokenAmount).toFixed(6)} USDC</p>
          <p><strong>Tu balance USDC:</strong> {usdcBalance.toFixed(6)} USDC</p>
          <p><strong>NFTs disponibles:</strong> {availableTokens}</p>
          <p><strong>Puedes comprar:</strong> {remainingTokens} más</p>
        </div>

        <button
          onClick={handleBuyNFT}
          disabled={isLoading || tokenAmount > Math.min(remainingTokens, availableTokens) || usdcBalance < (price * tokenAmount)}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Procesando...' : `Comprar ${tokenAmount} NFT(s)`}
        </button>
      </div>
    </div>
  );
};

export default NFTMinter;
```

### 4. Componente de Lista de NFTs

#### components/NFTList.jsx
```jsx
import { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';

const NFTList = () => {
  const { contract } = useContract();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contract) {
      loadNFTs();
    }
  }, [contract]);

  const loadNFTs = async () => {
    try {
      const maxSupply = await contract.MAX_SUPPLY();
      const nftData = [];

      for (let i = 1; i <= Number(maxSupply); i++) {
        const isAvailable = await contract.isAvailableForSale(i);
        const tokenURI = await contract.tokenURI(i);
        
        nftData.push({
          id: i,
          available: isAvailable,
          uri: tokenURI
        });
      }

      setNfts(nftData);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Cargando NFTs...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nfts.map((nft) => (
        <div 
          key={nft.id} 
          className={`border rounded-lg p-4 ${
            nft.available 
              ? 'border-green-500 bg-green-50' 
              : 'border-red-500 bg-red-50'
          }`}
        >
          <h3 className="font-bold">Enano #{nft.id}</h3>
          <p className={`text-sm ${
            nft.available ? 'text-green-600' : 'text-red-600'
          }`}>
            {nft.available ? 'Disponible' : 'Vendido'}
          </p>
          {nft.available && (
            <button className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm">
              Comprar
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default NFTList;
```

### 5. Hook para Eventos

#### hooks/useContractEvents.js
```javascript
import { useEffect } from 'react';
import { useContract } from './useContract';

export const useContractEvents = (onNFTSold) => {
  const { contract, provider } = useContract();

  useEffect(() => {
    if (!contract || !provider) return;

    const handleNFTSold = (tokenId, buyer, price, event) => {
      console.log('NFT vendido:', { tokenId: tokenId.toString(), buyer, price: price.toString() });
      if (onNFTSold) {
        onNFTSold({
          tokenId: Number(tokenId),
          buyer,
          price: Number(price) / 1e6,
          transactionHash: event.transactionHash
        });
      }
    };

    // Escuchar eventos de NFT vendido
    contract.on('NFTSold', handleNFTSold);

    return () => {
      contract.off('NFTSold', handleNFTSold);
    };
  }, [contract, provider, onNFTSold]);
};
```