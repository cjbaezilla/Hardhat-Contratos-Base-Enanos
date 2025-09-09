const hre = require("hardhat");

async function main() {
  console.log("🔍 Iniciando verificación del contrato...");
  
  // Obtener información de la red
  const network = await hre.ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  
  // Verificar si estamos en una red que soporta verificación
  if (networkName === "localhost" || networkName === "hardhat") {
    console.log("⚠️  La verificación no está disponible en redes locales.");
    return;
  }
  
  // Obtener la dirección del contrato del último despliegue
  const contractAddress = process.argv[2];
  if (!contractAddress) {
    console.log("❌ Error: Debes proporcionar la dirección del contrato.");
    console.log("Uso: npx hardhat run scripts/verify.js --network <red> -- <direccion_contrato>");
    return;
  }
  
  console.log(`📍 Verificando contrato en: ${contractAddress}`);
  console.log(`🌐 Red: ${networkName} (Chain ID: ${network.chainId})`);
  
  try {
    // Configuración de direcciones USDC por red
    const USDC_ADDRESSES = {
      mainnet: "0xA0b86a33E6441b8c4C8C0E1234567890abcdef12", // Reemplazar con dirección real
      sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC en Sepolia
      goerli: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F", // USDC en Goerli
    };
    
    const USDC_ADDRESS = USDC_ADDRESSES[networkName];
    if (!USDC_ADDRESS) {
      console.log("❌ Error: No se encontró dirección USDC para esta red.");
      return;
    }
    
    // Verificar el contrato
    console.log("⏳ Verificando contrato...");
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [USDC_ADDRESS],
    });
    
    console.log("✅ ¡Contrato verificado exitosamente!");
    console.log(`🔗 Ver en explorador: ${getExplorerUrl(network.chainId, contractAddress)}`);
    
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ El contrato ya está verificado.");
    } else {
      console.log("❌ Error verificando contrato:", error.message);
    }
  }
}

function getExplorerUrl(chainId, address) {
  const explorers = {
    1: `https://etherscan.io/address/${address}`,
    11155111: `https://sepolia.etherscan.io/address/${address}`,
    5: `https://goerli.etherscan.io/address/${address}`,
  };
  return explorers[chainId] || `https://etherscan.io/address/${address}`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
