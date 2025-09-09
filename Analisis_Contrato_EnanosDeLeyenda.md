# Documentación Completa - Contrato EnanosDeLeyenda

## Introducción

El contrato `EnanosDeLeyenda` representa una colección de NFTs (Non-Fungible Tokens) basada en el estándar ERC721 de Ethereum. Este contrato implementa un sistema de venta directa donde los usuarios pueden adquirir NFTs únicos pagando con tokens USDC. La colección está limitada a 188 piezas únicas, cada una representando un "Enano de Leyenda" con características distintivas.

La implementación utiliza las librerías de OpenZeppelin para garantizar la seguridad y compatibilidad con los estándares de la industria, mientras que incorpora funcionalidades personalizadas para manejar la lógica de negocio específica del proyecto.

## Arquitectura del Contrato

### Herencia y Dependencias

El contrato hereda de tres contratos principales de OpenZeppelin:

- **ERC721**: Proporciona la funcionalidad base para tokens no fungibles, incluyendo la capacidad de transferir, consultar propietarios y manejar metadatos.
- **Ownable**: Implementa un sistema de control de acceso donde solo el propietario puede ejecutar funciones administrativas críticas.
- **IERC20**: Interfaz para interactuar con tokens fungibles, específicamente USDC en este caso.

Esta arquitectura modular permite que el contrato se beneficie de las auditorías de seguridad y las mejores prácticas ya establecidas en la comunidad de desarrollo de Ethereum.

### Variables de Estado

#### Constantes Inmutables

```solidity
uint256 public constant MAX_SUPPLY = 188;
uint256 public constant PRICE = 1e6; // 1 USDC
uint256 public constant MAX_TOKENS_PER_WALLET = 10;
```

**MAX_SUPPLY**: Define el número total de NFTs que existirán en la colección. Este valor es inmutable y garantiza la escasez de la colección. Los IDs de los tokens van del 1 al 188, proporcionando un rango claro y predecible.

**PRICE**: Establece el precio fijo de cada NFT en 1 USDC. El valor `1e6` representa 1 USDC considerando que este token tiene 6 decimales. Esta constante asegura que el precio no pueda ser manipulado después del despliegue.

**MAX_TOKENS_PER_WALLET**: Implementa un mecanismo de limitación para prevenir la concentración excesiva de tokens en una sola dirección. Este límite de 10 tokens por wallet fomenta una distribución más equitativa entre los coleccionistas.

#### Variables de Almacenamiento

```solidity
IERC20 public immutable usdcToken;
mapping(uint256 => bool) public sold;
mapping(address => uint256) public tokensPurchased;
string private _baseTokenURI;
mapping(uint256 => string) private _tokenURIs;
```

**usdcToken**: Referencia inmutable al contrato del token USDC. Esta variable se establece una sola vez durante la construcción y no puede modificarse posteriormente, garantizando la integridad del sistema de pagos.

**sold**: Mapeo que rastrea el estado de venta de cada token. Un valor `true` indica que el token ha sido vendido, mientras que `false` significa que aún está disponible para la venta.

**tokensPurchased**: Registra cuántos tokens ha comprado cada dirección. Esta información es crucial para hacer cumplir el límite de tokens por wallet y proporcionar transparencia sobre la actividad de compra.

**baseTokenURI**: URI base para los metadatos de los NFTs. Esta variable permite actualizar la ubicación de los metadatos sin necesidad de modificar cada token individualmente.

**tokenURIs**: Mapeo opcional que permite establecer URIs específicas para tokens individuales, proporcionando flexibilidad para casos especiales o actualizaciones selectivas.

## Funcionalidades Principales

### Sistema de Compra de NFTs

La función `buyNFT` es el corazón del contrato, implementando un sistema sofisticado de compra que maneja múltiples validaciones y transferencias.

```solidity
function buyNFT(uint256 tokenAmount) external {
    require(tokenAmount > 0, "Cantidad debe ser mayor a 0");
    
    uint256 availableTokens = this.getAvailableTokensCount();
    require(tokenAmount <= availableTokens, "Cantidad excede el suministro maximo");
    
    require(tokensPurchased[msg.sender] + tokenAmount <= MAX_TOKENS_PER_WALLET, 
            "Excede el limite de tokens por wallet");
    
    uint256 totalPrice = PRICE * tokenAmount;
    
    require(usdcToken.transferFrom(msg.sender, owner(), totalPrice), "Transferencia USDC fallida");
    
    uint256 tokensTransferred = 0;
    for (uint256 i = 1; i <= MAX_SUPPLY && tokensTransferred < tokenAmount; i++) {
        if (!sold[i] && ownerOf(i) == address(this)) {
            sold[i] = true;
            _transfer(address(this), msg.sender, i);
            tokensTransferred++;
            emit NFTSold(i, msg.sender, PRICE);
        }
    }
    
    tokensPurchased[msg.sender] += tokensTransferred;
}
```

#### Proceso de Validación

La función implementa un sistema de validación en capas que garantiza la integridad de cada transacción:

1. **Validación de Cantidad**: Verifica que la cantidad solicitada sea mayor a cero, previniendo transacciones vacías o maliciosas.

2. **Validación de Disponibilidad**: Consulta el número total de tokens disponibles y asegura que la cantidad solicitada no exceda el suministro actual.

3. **Validación de Límite por Wallet**: Verifica que la compra no exceda el límite establecido de 10 tokens por dirección, considerando las compras previas del usuario.

4. **Validación de Pago**: Confirma que la transferencia de USDC del comprador al propietario del contrato sea exitosa antes de proceder con la transferencia de NFTs.

#### Algoritmo de Asignación

El sistema utiliza un algoritmo de búsqueda secuencial que asigna los primeros tokens disponibles en orden numérico. Este enfoque garantiza:

- **Consistencia**: Los tokens se asignan de manera predecible
- **Eficiencia**: Minimiza el tiempo de búsqueda para cantidades pequeñas
- **Transparencia**: Los usuarios pueden predecir qué tokens recibirán

El bucle itera desde el token 1 hasta el 188, verificando dos condiciones para cada token:
- El token no ha sido marcado como vendido (`!sold[i]`)
- El token pertenece actualmente al contrato (`ownerOf(i) == address(this)`)

### Gestión de Metadatos

El contrato implementa un sistema flexible de metadatos que soporta tanto URIs base como URIs específicas por token.

#### Base URI Dinámica

```solidity
function setBaseURI(string calldata newBaseURI) external onlyOwner {
    _baseTokenURI = newBaseURI;
    emit BaseURIUpdated(newBaseURI);
}
```

Esta funcionalidad permite al propietario actualizar la ubicación base de todos los metadatos sin necesidad de modificar cada token individualmente. Es especialmente útil para:

- Migrar metadatos a nuevos servidores
- Actualizar la estructura de URLs
- Implementar sistemas de versionado de metadatos

#### URIs Específicas por Token

```solidity
function setTokenURI(uint256 tokenId, string calldata newTokenURI) external onlyOwner {
    require(tokenId >= 1 && tokenId <= MAX_SUPPLY, "Token no existe");
    _tokenURIs[tokenId] = newTokenURI;
    emit TokenURIUpdated(tokenId, newTokenURI);
}
```

Esta característica proporciona granularidad máxima para casos especiales como:

- Tokens con características únicas que requieren metadatos especiales
- Actualizaciones selectivas de metadatos
- Corrección de errores en metadatos específicos

#### Resolución de URIs

```solidity
function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(tokenId >= 1 && tokenId <= MAX_SUPPLY, "Token no existe");
    
    if (bytes(_tokenURIs[tokenId]).length > 0) {
        return _tokenURIs[tokenId];
    }
    
    return string(abi.encodePacked(_baseTokenURI, _toString(tokenId), ".json"));
}
```

La función `tokenURI` implementa un sistema de resolución jerárquico:

1. **Prioridad Alta**: Si existe una URI específica para el token, la utiliza
2. **Prioridad Baja**: Si no existe URI específica, construye la URI concatenando la base URI con el ID del token y la extensión ".json"

### Funciones de Consulta

El contrato proporciona un conjunto completo de funciones de consulta que permiten a los usuarios y aplicaciones externas obtener información detallada sobre el estado del contrato.

#### Consulta de Disponibilidad

```solidity
function isAvailableForSale(uint256 tokenId) external view returns (bool) {
    return tokenId >= 1 && tokenId <= MAX_SUPPLY && !sold[tokenId] && ownerOf(tokenId) == address(this);
}
```

Esta función verifica múltiples condiciones para determinar si un token específico está disponible para la venta:

- El ID del token está dentro del rango válido (1-188)
- El token no ha sido marcado como vendido
- El token pertenece actualmente al contrato

#### Conteo de Tokens Disponibles

```solidity
function getAvailableTokensCount() external view returns (uint256) {
    uint256 availableTokens = 0;
    for (uint256 i = 1; i <= MAX_SUPPLY; i++) {
        if (!sold[i] && ownerOf(i) == address(this)) {
            availableTokens++;
        }
    }
    return availableTokens;
}
```

Esta función realiza un conteo completo de todos los tokens disponibles, iterando a través de toda la colección. Aunque puede ser costosa en términos de gas para consultas externas, proporciona información precisa y actualizada.

#### Límites por Wallet

```solidity
function getRemainingTokensForWallet(address wallet) external view returns (uint256) {
    uint256 purchased = tokensPurchased[wallet];
    if (purchased >= MAX_TOKENS_PER_WALLET) {
        return 0;
    }
    return MAX_TOKENS_PER_WALLET - purchased;
}
```

Esta función calcula cuántos tokens adicionales puede comprar una dirección específica, considerando sus compras previas y el límite establecido.

### Funciones Administrativas

#### Retiro de Tokens

```solidity
function withdrawToken(IERC20 token) external onlyOwner {
    uint256 balance = token.balanceOf(address(this));
    require(balance > 0, "No hay tokens para retirar");
    
    require(token.transfer(owner(), balance), "Transferencia de token fallida");
    
    emit TokenWithdrawn(address(token), owner(), balance);
}
```

Esta función permite al propietario retirar cualquier token ERC20 que se encuentre en el contrato. Es especialmente útil para:

- Retirar USDC acumulado de las ventas
- Recuperar tokens enviados por error
- Gestionar tokens adicionales que puedan llegar al contrato

La función incluye validaciones para asegurar que:
- Existe un balance positivo del token
- La transferencia se ejecuta correctamente
- Se emite un evento para transparencia

## Eventos del Contrato

El contrato emite eventos específicos para facilitar el seguimiento y la integración con aplicaciones externas:

### NFTSold

```solidity
event NFTSold(uint256 indexed tokenId, address indexed buyer, uint256 price);
```

Se emite cada vez que se vende un NFT, proporcionando información detallada sobre:
- ID del token vendido
- Dirección del comprador
- Precio pagado

Este evento es crucial para aplicaciones que necesitan rastrear la actividad de ventas en tiempo real.

### TokenWithdrawn

```solidity
event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);
```

Se emite cuando el propietario retira tokens del contrato, proporcionando transparencia sobre las operaciones administrativas.

### BaseURIUpdated

```solidity
event BaseURIUpdated(string newBaseURI);
```

Se emite cuando se actualiza la base URI, permitiendo que las aplicaciones externas se mantengan sincronizadas con los cambios en los metadatos.

### TokenURIUpdated

```solidity
event TokenURIUpdated(uint256 indexed tokenId, string tokenURI);
```

Se emite cuando se actualiza la URI de un token específico, proporcionando granularidad en el seguimiento de cambios de metadatos.

## Consideraciones de Seguridad

### Validaciones Implementadas

El contrato implementa múltiples capas de validación para prevenir vulnerabilidades comunes:

1. **Validación de Rangos**: Todas las funciones que manejan IDs de tokens verifican que estén dentro del rango válido (1-188).

2. **Validación de Cantidades**: Las funciones de compra verifican que las cantidades sean positivas y no excedan los límites establecidos.

3. **Validación de Transferencias**: Todas las transferencias de tokens incluyen verificaciones de éxito para prevenir fallos silenciosos.

4. **Control de Acceso**: Las funciones administrativas están protegidas por el modificador `onlyOwner`.

### Prevención de Ataques Comunes

- **Reentrancy**: El contrato no realiza llamadas externas después de cambios de estado críticos
- **Overflow/Underflow**: Utiliza Solidity 0.8.27 que incluye protecciones automáticas
- **Front-running**: El sistema de asignación secuencial reduce la ventaja de los atacantes
- **Griefing**: Los límites por wallet previenen la concentración excesiva de tokens

## Consideraciones de Gas

### Optimizaciones Implementadas

1. **Packing de Variables**: Las variables de estado están optimizadas para minimizar el uso de slots de almacenamiento.

2. **Uso de `immutable`**: Las variables que no cambian después de la construcción están marcadas como `immutable` para reducir costos de gas.

3. **Funciones de Consulta**: Las funciones `view` y `pure` no consumen gas cuando se llaman externamente.

### Áreas de Alto Consumo de Gas

1. **Función `buyNFT`**: El bucle de búsqueda puede ser costoso para cantidades grandes de tokens.

2. **Función `getAvailableTokensCount`**: Requiere iterar a través de todos los tokens, lo que puede ser costoso para consultas externas.

## Integración con Aplicaciones Externas

### Flujo de Compra Típico

1. **Aprobación de USDC**: El usuario debe aprobar al contrato para gastar USDC en su nombre.

2. **Consulta de Disponibilidad**: La aplicación puede consultar `getAvailableTokensCount()` para mostrar cuántos tokens están disponibles.

3. **Compra**: El usuario llama a `buyNFT(cantidad)` con la cantidad deseada.

4. **Verificación**: La aplicación puede verificar la transacción y actualizar su interfaz.

## Despliegue y Configuración

### Parámetros del Constructor

```solidity
constructor(address _usdcToken, string memory baseTokenURI)
```

- **usdcToken**: Dirección del contrato USDC en la red correspondiente
- **baseTokenURI**: URI base para los metadatos de los NFTs

### Consideraciones de Despliegue

1. **Red de Despliegue**: Asegurar que la dirección USDC sea correcta para la red específica
2. **URI de Metadatos**: Configurar una URI base válida y accesible
3. **Verificación**: Verificar el contrato en el explorador de bloques para transparencia

## Conclusión

El contrato `EnanosDeLeyenda` representa una implementación robusta y bien diseñada de un sistema de venta de NFTs. Su arquitectura modular, validaciones de seguridad y funcionalidades flexibles lo convierten en una solución confiable para proyectos de colecciones de NFTs.

La combinación de estándares establecidos (ERC721, OpenZeppelin) con funcionalidades personalizadas específicas del negocio crea un equilibrio óptimo entre seguridad, funcionalidad y flexibilidad. El sistema de límites por wallet, la gestión flexible de metadatos y las funciones de consulta completas proporcionan una base sólida para aplicaciones de colecciones de NFTs exitosas.

La documentación exhaustiva de las funciones, la implementación de eventos para transparencia y las consideraciones de seguridad integradas demuestran un enfoque profesional en el desarrollo de contratos inteligentes, asegurando tanto la funcionalidad como la confiabilidad del sistema.
