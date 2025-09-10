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
  console.log("🚀 Iniciando despliegue del contrato DAO en Base Sepolia...");
  
  // Dirección del contrato NFT proporcionada
  const nftContractAddress = "0x629A84412816b28636Eb1323923Cb27075d21525";
  
  // Obtener el deployer
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("👤 Desplegando con la cuenta:", deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.formatEther(balance), "ETH");
  
  // Obtener el contrato DAO
  const DAO = await ethers.getContractFactory("DAO");
  
  console.log("\n📋 Parámetros del despliegue:");
  console.log(`   - Contrato NFT: ${nftContractAddress}`);
  console.log(`   - Red: Base Sepolia (Chain ID: 84532)`);
  
  // Estimar gas antes del deployment
  console.log("\n⛽ Estimando gas para el deployment...");
  const gasEstimate = await estimateDeploymentGas(DAO, nftContractAddress);
  
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
  
  // Usar gas estimado + margen, pero no más de 15M (límite de Base)
  const maxGasLimit = 15000000; // Límite máximo de Base
  const gasWithMargin = gasEstimate ? gasEstimate + 100000n : 2000000n; // +100k margen o 2M por defecto
  const finalGasLimit = gasWithMargin > maxGasLimit ? maxGasLimit : gasWithMargin;
  
  console.log(`⛽ Usando gas limit: ${finalGasLimit.toString()}`);
  
  const dao = await DAO.deploy(nftContractAddress, {
    gasLimit: finalGasLimit,
    ...gasConfig
  });
  
  console.log("⏳ Esperando confirmación...");
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  console.log("✅ DAO desplegado en:", daoAddress);

  // Información adicional del contrato
  console.log("\n📋 INFORMACIÓN DEL CONTRATO:");
  try {
    const nftContract = await dao.nftContract();
    const minProposalVotes = await dao.MIN_PROPOSAL_VOTES();
    const minVotesToApprove = await dao.MIN_VOTES_TO_APPROVE();
    const minTokensToApprove = await dao.MIN_TOKENS_TO_APPROVE();
    const owner = await dao.owner();
    
    console.log(`   - Contrato NFT configurado: ${nftContract}`);
    console.log(`   - Mínimo NFTs para propuesta: ${minProposalVotes}`);
    console.log(`   - Mínimo votantes únicos: ${minVotesToApprove}`);
    console.log(`   - Mínimo tokens para aprobar: ${minTokensToApprove}`);
    console.log(`   - Propietario: ${owner}`);
  } catch (error) {
    console.log("⚠️  No se pudo obtener información adicional del contrato");
  }

  // Información de gas utilizada
  const deploymentTx = dao.deploymentTransaction();
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
  console.log("- Contrato NFT:", nftContractAddress);
  console.log("- DAO:", daoAddress);
  console.log("\n🔍 Verifica los contratos en:");
  console.log("- DAO:", `https://sepolia.basescan.org/address/${daoAddress}`);
  console.log("- NFT:", `https://sepolia.basescan.org/address/${nftContractAddress}`);
  
  console.log("\n📝 Información para verificación:");
  console.log(`npx hardhat verify --network base-sepolia ${daoAddress} "${nftContractAddress}"`);
  
  console.log("\n💡 PRÓXIMOS PASOS:");
  console.log("   1. Prueba el contrato DAO en Base Sepolia");
  console.log("   2. Si todo funciona correctamente, despliega en Base Mainnet");
  console.log("   3. Usa: npx hardhat run scripts/deploy-dao-base.js --network base");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error durante el despliegue:", error);
    process.exit(1);
  });
