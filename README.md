# 🧙‍♂️ Enanos de Leyenda - Colección NFT

Una colección única de 188 NFTs que combina la magia de los enanos legendarios con la tecnología blockchain más avanzada. Este proyecto no es solo otro contrato de NFTs; es una experiencia completa que demuestra cómo crear, desplegar y gestionar una colección digital exitosa.

## 🌟 ¿Qué hace especial este proyecto?

Lo que realmente destaca de "Enanos de Leyenda" es cómo está construido pensando en el mundo real. No es solo un contrato que mueve tokens de un lado a otro, sino un ecosistema completo que considera desde la experiencia del usuario hasta la seguridad de los fondos. Cada línea de código está pensada para que funcione de manera fluida, segura y transparente.

El proyecto implementa un sistema de venta directa donde los usuarios pueden adquirir NFTs únicos pagando con USDC, la stablecoin más confiable del ecosistema. Pero no se queda ahí - incluye límites por wallet para prevenir acaparamientos, un sistema flexible de metadatos que puede evolucionar con el tiempo, y funciones administrativas que permiten gestionar la colección de manera profesional.

## 🏗️ Arquitectura del Sistema

### El Corazón del Proyecto: El Contrato Principal

El contrato `EnanosDeLeyenda` está construido sobre una base sólida de estándares probados. Hereda de ERC721 para la funcionalidad NFT, Ownable para el control de acceso, y utiliza la interfaz IERC20 para manejar los pagos en USDC. Esta combinación no es casual - cada pieza está ahí por una razón específica.

**Características Técnicas Clave:**
- **Suministro Fijo**: Exactamente 188 NFTs, ni uno más, ni uno menos
- **Precio Estable**: 1 USDC por NFT, sin sorpresas ni fluctuaciones
- **Límite Democrático**: Máximo 10 NFTs por wallet para distribución equitativa
- **Mint Automático**: Todos los NFTs se crean al desplegar el contrato
- **Metadatos Flexibles**: Sistema que permite actualizar URIs sin tocar el contrato

### El Sistema de Compra Inteligente

La función `buyNFT` es donde ocurre la magia. No es solo "dar un token a cambio de dinero", sino un proceso sofisticado que valida múltiples condiciones antes de proceder. Verifica que la cantidad sea válida, que no exceda los límites, que haya suficientes tokens disponibles, y que el usuario tenga USDC aprobado. Solo entonces procede con la transferencia.

Lo que más me gusta de esta implementación es cómo maneja la asignación de tokens. En lugar de asignar tokens aleatoriamente, utiliza un algoritmo secuencial que busca los primeros tokens disponibles. Esto hace que el proceso sea predecible y transparente - los usuarios saben exactamente qué tokens van a recibir.

### Gestión de Metadatos Avanzada

El sistema de metadatos es especialmente inteligente. Permite tanto URIs base globales como URIs específicas por token. Esto significa que puedes actualizar todos los metadatos de una vez, o personalizar tokens individuales cuando sea necesario. Es perfecto para casos donde algunos NFTs tienen características especiales que requieren metadatos únicos.

## 🚀 Características Principales

### Para los Coleccionistas
- **Compra Simple**: Un solo clic para comprar múltiples NFTs
- **Transparencia Total**: Siempre sabes cuántos tokens están disponibles
- **Límites Justos**: Nadie puede acaparar toda la colección
- **Metadatos Ricos**: Cada NFT tiene su propia identidad digital

### Para los Desarrolladores
- **API Completa**: Funciones para consultar cualquier aspecto del contrato
- **Eventos Detallados**: Seguimiento en tiempo real de todas las operaciones
- **Código Limpio**: Implementación clara y bien documentada
- **Tests Exhaustivos**: 31 tests que cubren todos los escenarios posibles

### Para los Administradores
- **Control Total**: Gestión completa de metadatos y fondos
- **Seguridad Robusta**: Solo el owner puede realizar operaciones críticas
- **Flexibilidad**: Actualización de URIs sin necesidad de redeploy
- **Transparencia**: Todos los cambios se registran en eventos

## 📊 Especificaciones Técnicas

| Característica | Valor | Descripción |
|----------------|-------|-------------|
| **Estándar** | ERC721 | Tokens no fungibles estándar |
| **Suministro** | 188 NFTs | Cantidad fija e inmutable |
| **Precio** | 1 USDC | Precio estable en stablecoin |
| **Límite por Wallet** | 10 NFTs | Prevención de acaparamientos |
| **Redes Soportadas** | Base, Base Sepolia | Optimizado para Base Network |
| **Decimales USDC** | 6 | Precisión estándar de USDC |

## 🔗 Enlaces del Contrato Desplegado

### Exploradores de Blockchain
- **Basescan (Contrato)**: [Ver en Basescan](https://basescan.org/address/0x629A84412816b28636Eb1323923Cb27075d21525)
- **Basescan (NFT #1)**: [Ver NFT detalle](https://basescan.org/nft/0x629a84412816b28636eb1323923cb27075d21525/1)

### Mercados NFT
- **OpenSea**: [Colección en OpenSea](https://opensea.io/collection/enanos-de-leyenda)

### Información del Contrato
- **Dirección**: `0x629A84412816b28636Eb1323923Cb27075d21525`
- **Red**: Base Network (Mainnet)
- **Estándar**: ERC721

## 🛠️ Instalación y Configuración

### Requisitos Previos
Antes de comenzar, asegúrate de tener instalado:
- Node.js (versión 16 o superior)
- npm o yarn
- Git
- Una wallet con ETH para gas fees

### Instalación Paso a Paso

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/hardhat_duende.git
cd hardhat_duende

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves privadas y configuraciones
```

### Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Clave privada de la wallet que desplegará el contrato
PRIVATE_KEY=tu_clave_privada_aqui

# API Key de Basescan para verificación de contratos
BASESCAN_API_KEY=tu_api_key_aqui

# URL del RPC de Base Network (opcional, usa la por defecto)
BASE_RPC_URL=https://mainnet.base.org
```

## 🚀 Despliegue del Contrato

### Despliegue en Base Network (Producción)

```bash
# Desplegar en Base mainnet
npm run deploy:base

# Verificar el contrato
npm run verify:base
```

### Despliegue en Base Sepolia (Testing)

```bash
# Desplegar en Base Sepolia
npm run deploy:base-sepolia

# Verificar el contrato
npm run verify:base-sepolia
```

### Despliegue Manual

Si prefieres más control sobre el proceso:

```bash
# Compilar contratos
npx hardhat compile

# Desplegar en red específica
npx hardhat run scripts/deploy-base.js --network base

# Verificar contrato
npx hardhat verify --network base <direccion_del_contrato>
```

## 📋 Documentación Técnica Detallada

Para un análisis profundo del contrato y sus pruebas, consulta los siguientes documentos:

- **[Análisis Completo del Contrato](Analisis_Contrato_EnanosDeLeyenda.md)**: Documentación exhaustiva que desglosa cada función, variable de estado, y consideración de seguridad del contrato `EnanosDeLeyenda`. Incluye arquitectura, flujos de datos, y mejores prácticas implementadas.

- **[Análisis Detallado de Tests](Analisis_Tests_EnanosDeLeyenda.md)**: Análisis completo de la suite de pruebas que cubre los 31 tests implementados, incluyendo cobertura por categorías, casos edge, y validaciones de seguridad. Incluye métricas de cobertura y recomendaciones.

Estos documentos proporcionan una visión técnica profunda del proyecto, ideal para desarrolladores que deseen entender la implementación completa o contribuir al código.

## 🧪 Testing y Calidad

### Ejecutar la Suite de Tests

```bash
# Tests completos
npm test

# Tests con reporte de gas
npm run test:gas

# Tests específicos
npx hardhat test test/EnanosDeLeyenda.js
```

### ¿Por qué estos tests son especiales?

La suite de tests de este proyecto es realmente impresionante. No se trata solo de verificar que las funciones básicas funcionen, sino de asegurar que el contrato se comporte correctamente en todos los escenarios posibles, incluyendo los casos edge que podrían no ser obvios.

**Cobertura de Tests:**
- **31 tests** que cubren todas las funcionalidades
- **Casos positivos y negativos** para cada función
- **Validación de eventos** para transparencia
- **Tests de límites** para prevenir ataques
- **Simulación de escenarios reales** con múltiples usuarios

## 🔧 Interacción con el Contrato

### Script de Interacción Inteligente

El proyecto incluye un script de interacción que hace que trabajar con el contrato sea súper fácil:

```bash
# Ver información completa del contrato
npx hardhat run scripts/interact.js --network base -- <direccion_contrato> info

# Cambiar la base URI para metadatos
npx hardhat run scripts/interact.js --network base -- <direccion_contrato> setBaseURI "https://nuevos-metadatos.com/api/"

# Establecer URI específica para un token
npx hardhat run scripts/interact.js --network base -- <direccion_contrato> setTokenURI 1 "https://especial.com/token1.json"

# Comprar NFTs (requiere USDC aprobado)
npx hardhat run scripts/interact.js --network base -- <direccion_contrato> buy 2

# Ver tokens de una wallet específica
npx hardhat run scripts/interact.js --network base -- <direccion_contrato> tokens 0x1234...
```

### Funciones Principales del Contrato

#### Para Usuarios Finales

```solidity
// Comprar NFTs
function buyNFT(uint256 tokenAmount) external

// Verificar si un NFT está disponible
function isAvailableForSale(uint256 tokenId) external view returns (bool)

// Contar NFTs disponibles
function getAvailableTokensCount() external view returns (uint256)

// Ver cuántos NFTs puede comprar una wallet
function getRemainingTokensForWallet(address wallet) external view returns (uint256)

// Obtener metadatos de un NFT
function tokenURI(uint256 tokenId) public view returns (string memory)
```

#### Para Administradores

```solidity
// Actualizar base URI para metadatos
function setBaseURI(string calldata newBaseURI) external onlyOwner

// Establecer URI específica para un token
function setTokenURI(uint256 tokenId, string calldata newTokenURI) external onlyOwner

// Retirar tokens ERC20 del contrato
function withdrawToken(IERC20 token) external onlyOwner

// Obtener balance USDC del contrato
function getUSDCBalance() external view returns (uint256)
```

## 🌐 Integración con Aplicaciones Web

### Configuración Básica para Frontend

```javascript
// Configuración del contrato
const CONTRACT_ADDRESS = "0x629A84412816b28636Eb1323923Cb27075d21525";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// ABI simplificado para funciones principales
const CONTRACT_ABI = [
  "function buyNFT(uint256 tokenAmount) external",
  "function getAvailableTokensCount() external view returns (uint256)",
  "function isAvailableForSale(uint256 tokenId) external view returns (bool)",
  "function getRemainingTokensForWallet(address wallet) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function MAX_SUPPLY() external view returns (uint256)",
  "function PRICE() external view returns (uint256)",
  "function MAX_TOKENS_PER_WALLET() external view returns (uint256)",
  "event NFTSold(uint256 indexed tokenId, address indexed buyer, uint256 price)"
];
```

### Ejemplo de Compra de NFTs

```javascript
// Conectar wallet y aprobar USDC
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);

// Aprobar USDC para la compra
const price = await contract.PRICE();
const totalPrice = price * BigInt(2); // Comprar 2 NFTs
await usdcContract.approve(CONTRACT_ADDRESS, totalPrice);

// Comprar NFTs
const tx = await contract.buyNFT(2);
await tx.wait();

console.log("¡NFTs comprados exitosamente!");
```

## 📁 Estructura del Proyecto

```
hardhat_duende/
├── contracts/
│   ├── EnanosDeLeyenda.sol          # Contrato principal NFT
│   └── MockUSDC.sol                 # Token mock para testing
├── scripts/
│   ├── deploy-base.js               # Despliegue en Base Network
│   ├── deploy-base-sepolia.js       # Despliegue en Base Sepolia
│   ├── deploy.js                    # Despliegue genérico
│   ├── interact.js                  # Script de interacción
│   └── verify.js                    # Verificación de contratos
├── test/
│   └── EnanosDeLeyenda.js           # Suite completa de tests
├── ignition/
│   └── modules/
│       └── Lock.js                  # Módulo de ignition
├── hardhat.config.js                # Configuración de Hardhat
├── package.json                     # Dependencias y scripts
└── README.md                        # Este archivo
```

## 🔒 Consideraciones de Seguridad

### Validaciones Implementadas

El contrato implementa múltiples capas de seguridad que van más allá de las validaciones básicas:

1. **Validación de Rangos**: Todos los IDs de tokens se verifican contra el rango válido (1-188)
2. **Límites por Wallet**: Prevención de acaparamientos con límite de 10 NFTs
3. **Validación de Suministro**: Verificación de disponibilidad antes de cada compra
4. **Control de Acceso**: Solo el owner puede realizar operaciones administrativas
5. **Validación de Transferencias**: Verificación de éxito en todas las operaciones de tokens

### Prevención de Ataques Comunes

- **Reentrancy**: El contrato no realiza llamadas externas después de cambios de estado críticos
- **Overflow/Underflow**: Utiliza Solidity 0.8.28 con protecciones automáticas
- **Front-running**: El sistema de asignación secuencial reduce ventajas de atacantes
- **Griefing**: Los límites por wallet previenen concentración excesiva

## 📡 Eventos y Transparencia

El contrato emite eventos detallados para cada operación importante:

```solidity
// Emitido cuando se vende un NFT
event NFTSold(uint256 indexed tokenId, address indexed buyer, uint256 price);

// Emitido cuando el owner retira tokens
event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);

// Emitido cuando se actualiza la base URI
event BaseURIUpdated(string newBaseURI);

// Emitido cuando se actualiza URI específica de un token
event TokenURIUpdated(uint256 indexed tokenId, string tokenURI);
```

Estos eventos permiten que las aplicaciones frontend se mantengan sincronizadas en tiempo real con el estado del contrato, proporcionando una experiencia de usuario fluida y transparente.

## 🤝 Contribución al Proyecto

Este proyecto está abierto a contribuciones de la comunidad. Si tienes ideas para mejoras, correcciones de bugs, o nuevas funcionalidades, ¡nos encantaría escucharlas!

### Cómo Contribuir

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Esto significa que puedes usar, modificar y distribuir el código libremente, siempre que mantengas la atribución original.