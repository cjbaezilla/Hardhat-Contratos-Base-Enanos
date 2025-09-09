const { ethers } = require("hardhat");

async function estimateDeploymentGas(contractFactory, ...args) {
  try {
    const deployTransaction = await contractFactory.getDeployTransaction(...args);
    const gasEstimate = await ethers.provider.estimateGas(deployTransaction);
    return gasEstimate;
  } catch (error) {
    console.warn("⚠️  No se pudo estimar gas:", error.message);
    return null;
  }
}

async function getOptimalGasPrice() {
  try {
    const feeData = await ethers.provider.getFeeData();
    // Usar maxFeePerGas si está disponible (EIP-1559), sino gasPrice
    if (feeData.maxFeePerGas) {
      return {
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.parseUnits("0.1", "gwei")
      };
    } else if (feeData.gasPrice) {
      return { gasPrice: feeData.gasPrice };
    } else {
      return { gasPrice: ethers.parseUnits("0.1", "gwei") }; // Más barato para testnet
    }
  } catch (error) {
    console.warn("⚠️  No se pudo obtener gas price óptimo, usando valor por defecto");
    return { gasPrice: ethers.parseUnits("0.1", "gwei") };
  }
}

async function main() {
  console.log("🚀 Desplegando contratos en Base Sepolia (Testnet)...");
  
  // Obtener el deployer
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("👤 Desplegando con la cuenta:", deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.formatEther(balance), "ETH");

  // Usar USDC de Base Sepolia (o mock si no existe)
  const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // USDC en Base Sepolia
  console.log("\n💰 Usando USDC de Base Sepolia:", usdcAddress);

  // Desplegar EnanosDeLeyenda
  console.log("\n🎭 Preparando deployment de EnanosDeLeyenda...");
  const baseTokenURI = "https://app.baeza.me/metadata/json/";
  console.log("📝 Base Token URI:", baseTokenURI);
  
  const EnanosDeLeyenda = await ethers.getContractFactory("EnanosDeLeyenda");
  
  // Estimar gas antes del deployment
  console.log("\n⛽ Estimando gas para el deployment...");
  const gasEstimate = await estimateDeploymentGas(EnanosDeLeyenda, usdcAddress, baseTokenURI);
  
  if (gasEstimate) {
    console.log(`📊 Gas estimado: ${gasEstimate.toString()}`);
    
    // Obtener gas price óptimo
    const gasConfig = await getOptimalGasPrice();
    console.log("⛽ Configuración de gas:", gasConfig);
    
    // Calcular costo estimado
    const gasPrice = gasConfig.maxFeePerGas || gasConfig.gasPrice;
    const estimatedCost = gasEstimate * gasPrice;
    console.log(`💸 Costo estimado: ${ethers.formatEther(estimatedCost)} ETH`);
    
    // Verificar balance
    const requiredBalance = estimatedCost * 120n / 100n; // 20% de margen
    if (balance < requiredBalance) {
      throw new Error(`❌ Balance insuficiente. Necesitas al menos ${ethers.formatEther(requiredBalance)} ETH`);
    }
    
    console.log("✅ Balance suficiente para el deployment");
  }
  
  // Desplegar con configuración optimizada
  console.log("\n📦 Iniciando deployment...");
  const gasConfig = await getOptimalGasPrice();
  
  const enanosDeLeyenda = await EnanosDeLeyenda.deploy(usdcAddress, baseTokenURI, {
    gasLimit: 50000000, // 50M gas limit
    ...gasConfig
  });
  
  console.log("⏳ Esperando confirmación...");
  await enanosDeLeyenda.waitForDeployment();
  const enanosDeLeyendaAddress = await enanosDeLeyenda.getAddress();
  console.log("✅ EnanosDeLeyenda desplegado en:", enanosDeLeyendaAddress);

  // Información adicional del contrato
  console.log("\n📋 INFORMACIÓN DEL CONTRATO:");
  try {
    console.log(`   Nombre: ${await enanosDeLeyenda.name()}`);
    console.log(`   Símbolo: ${await enanosDeLeyenda.symbol()}`);
    console.log(`   Suministro máximo: ${await enanosDeLeyenda.MAX_SUPPLY()}`);
    console.log(`   Precio por NFT: ${await enanosDeLeyenda.PRICE()} wei`);
    console.log(`   Límite por wallet: ${await enanosDeLeyenda.MAX_TOKENS_PER_WALLET()}`);
    console.log(`   NFTs disponibles: ${await enanosDeLeyenda.getAvailableTokensCount()}`);
  } catch (error) {
    console.log("⚠️  No se pudo obtener información adicional del contrato");
  }

  // Información de gas utilizada
  const deploymentTx = enanosDeLeyenda.deploymentTransaction();
  if (deploymentTx) {
    try {
      const receipt = await deploymentTx.wait();
      console.log(`\n⛽ Gas utilizado: ${receipt.gasUsed.toString()}`);
      console.log(`💸 Costo real: ${ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} ETH`);
    } catch (error) {
      console.log("⚠️  No se pudo obtener información de gas");
    }
  }

  console.log("\n✅ Despliegue completado!");
  console.log("📋 Resumen del despliegue:");
  console.log("- USDC (Base Sepolia):", usdcAddress);
  console.log("- EnanosDeLeyenda:", enanosDeLeyendaAddress);
  console.log("- Base Token URI:", baseTokenURI);
  console.log("\n🔍 Verifica los contratos en:");
  console.log("- EnanosDeLeyenda:", `https://sepolia.basescan.org/address/${enanosDeLeyendaAddress}`);
  console.log("- USDC:", `https://sepolia.basescan.org/address/${usdcAddress}`);
  
  console.log("\n💡 PRÓXIMOS PASOS:");
  console.log("   1. Prueba el contrato en Base Sepolia");
  console.log("   2. Si todo funciona correctamente, despliega en Base Mainnet");
  console.log("   3. Usa: npx hardhat run scripts/deploy-base.js --network base");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error durante el despliegue:", error);
    process.exit(1);
  });
