const hre = require("hardhat");

// Configuración de direcciones USDC por red
const USDC_ADDRESSES = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
  mainnet: "0xA0b86a33E6441b8c4C8C0E1234567890abcdef12", // Reemplazar con dirección real
  sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC en Sepolia
  goerli: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F", // USDC en Goerli
  localhost: "0x0000000000000000000000000000000000000000" // Mock para localhost
};

// Configuración de Base URI por red
const BASE_URI_CONFIG = {
  mainnet: "https://app.baeza.me/metadata/json/",
  base: "https://app.baeza.me/metadata/json/",
  sepolia: "https://app.baeza.me/metadata/json/",
  goerli: "https://app.baeza.me/metadata/json/",
  localhost: "https://app.baeza.me/metadata/json/"
};

async function main() {
  console.log("🚀 Iniciando despliegue del contrato EnanosDeLeyenda...");
  
  // Obtener información de la red
  const network = await hre.ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  console.log(`📡 Red detectada: ${networkName} (Chain ID: ${network.chainId})`);
  
  // Obtener el deployer y verificar balance
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`👤 Desplegando con la cuenta: ${deployer.address}`);
  console.log(`💰 Balance disponible: ${hre.ethers.formatEther(balance)} ETH`);
  
  // Seleccionar dirección USDC según la red
  const USDC_ADDRESS = USDC_ADDRESSES[networkName] || USDC_ADDRESSES.localhost;
  const BASE_URI = BASE_URI_CONFIG[networkName] || BASE_URI_CONFIG.localhost;
  
  if (USDC_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.log("⚠️  ADVERTENCIA: Usando dirección mock para USDC. Asegúrate de desplegar un token USDC mock primero.");
  }
  
  console.log(`💰 Dirección USDC: ${USDC_ADDRESS}`);
  console.log(`🌐 Base URI: ${BASE_URI}`);
  
  // Estimar gas antes del deployment
  console.log("\n⛽ Estimando gas para el deployment...");
  const EnanosDeLeyenda = await hre.ethers.getContractFactory("EnanosDeLeyenda");
  
  try {
    // Estimar gas usando estimateGas
    const gasEstimate = await EnanosDeLeyenda.getDeployTransaction(USDC_ADDRESS, BASE_URI).then(tx => 
      hre.ethers.provider.estimateGas(tx)
    );
    
    console.log(`📊 Gas estimado: ${gasEstimate.toString()}`);
    
    // Obtener gas price actual
    const gasPrice = await hre.ethers.provider.getGasPrice();
    console.log(`⛽ Gas price actual: ${hre.ethers.formatUnits(gasPrice, "gwei")} gwei`);
    
    // Calcular costo estimado
    const estimatedCost = gasEstimate * gasPrice;
    console.log(`💸 Costo estimado: ${hre.ethers.formatEther(estimatedCost)} ETH`);
    
    // Verificar si hay suficiente balance
    if (balance < estimatedCost * 120n / 100n) { // 20% de margen
      throw new Error(`❌ Balance insuficiente. Necesitas al menos ${hre.ethers.formatEther(estimatedCost * 120n / 100n)} ETH`);
    }
    
    console.log("✅ Balance suficiente para el deployment");
    
  } catch (error) {
    console.error("❌ Error estimando gas:", error.message);
    if (error.message.includes("insufficient funds")) {
      throw new Error("❌ Fondos insuficientes para el deployment");
    }
    console.log("⚠️  Continuando con deployment sin estimación precisa...");
  }
  
  // Desplegar contrato con configuración de gas optimizada
  console.log("\n📦 Desplegando contrato...");
  
  try {
    const enanos = await EnanosDeLeyenda.deploy(USDC_ADDRESS, BASE_URI, {
      gasLimit: 50000000, // 50M gas limit
      gasPrice: gasPrice || 1000000000, // 1 gwei por defecto
    });
    
    console.log("⏳ Esperando confirmación del deployment...");
    await enanos.waitForDeployment();
    const address = await enanos.getAddress();
    
    console.log("✅ Contrato desplegado exitosamente!");
    console.log(`📍 Dirección del contrato: ${address}`);
    console.log(`🔗 Explorador: ${getExplorerUrl(network.chainId, address)}`);
    
    // Información básica del contrato
    console.log("\n📋 INFORMACIÓN DEL CONTRATO:");
    console.log(`   Nombre: ${await enanos.name()}`);
    console.log(`   Símbolo: ${await enanos.symbol()}`);
    console.log(`   Suministro máximo: ${await enanos.MAX_SUPPLY()}`);
    console.log(`   Precio por NFT: ${await enanos.PRICE()} wei`);
    console.log(`   Límite por wallet: ${await enanos.MAX_TOKENS_PER_WALLET()}`);
    
    // Información de URI
    console.log("\n🌐 CONFIGURACIÓN DE METADATOS:");
    const baseURI = await enanos.getBaseURI();
    console.log(`   Base URI: ${baseURI}`);
    console.log(`   NFTs disponibles: ${await enanos.getAvailableTokensCount()}`);
    
    // Mostrar metadatos de los primeros 5 NFTs
    console.log("\n📄 METADATOS DE LOS PRIMEROS 5 NFTs:");
    await showTokenMetadata(enanos, 5);
    
    // Información de gas
    const deploymentTx = enanos.deploymentTransaction();
    if (deploymentTx) {
      const receipt = await deploymentTx.wait();
      console.log(`\n⛽ Gas utilizado: ${receipt.gasUsed.toString()}`);
      console.log(`💸 Costo real: ${hre.ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} ETH`);
    }
    
    console.log("\n🎉 ¡Despliegue completado exitosamente!");
    
  } catch (error) {
    console.error("❌ Error durante el deployment:", error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 SOLUCIONES SUGERIDAS:");
      console.log("   1. Asegúrate de tener suficiente ETH en tu wallet");
      console.log("   2. Verifica que estés usando la red correcta");
      console.log("   3. Considera usar una red de test (Base Sepolia) primero");
      console.log("   4. Revisa el gas price en la red actual");
    } else if (error.message.includes("gas")) {
      console.log("\n💡 SOLUCIONES SUGERIDAS:");
      console.log("   1. El contrato consume mucho gas (mint de 188 NFTs)");
      console.log("   2. Considera usar un gas price más alto");
      console.log("   3. Verifica que el gas limit sea suficiente");
    }
    
    throw error;
  }
}


async function showTokenMetadata(contract, count) {
  for (let i = 1; i <= count; i++) {
    try {
      const tokenURI = await contract.tokenURI(i);
      const owner = await contract.ownerOf(i);
      const isAvailable = await contract.isAvailableForSale(i);
      
      console.log(`\n   NFT #${i}:`);
      console.log(`     📄 URL de metadatos: ${tokenURI}`);
      console.log(`     👤 Propietario: ${owner}`);
      console.log(`     🛒 Disponible para venta: ${isAvailable ? 'Sí' : 'No'}`);
    } catch (error) {
      console.log(`\n   ❌ Error obteniendo información del NFT #${i}: ${error.message}`);
    }
  }
}

function getExplorerUrl(chainId, address) {
  const explorers = {
    1: `https://etherscan.io/address/${address}`,
    11155111: `https://sepolia.etherscan.io/address/${address}`,
    5: `https://goerli.etherscan.io/address/${address}`,
    31337: `http://localhost:8545/address/${address}`
  };
  return explorers[chainId] || `https://etherscan.io/address/${address}`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
