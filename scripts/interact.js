const hre = require("hardhat");

// Configuración de direcciones USDC por red
const USDC_ADDRESSES = {
  mainnet: "0xA0b86a33E6441b8c4C8C0E1234567890abcdef12", // Reemplazar con dirección real
  sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // USDC en Sepolia
  goerli: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F", // USDC en Goerli
  localhost: "0x0000000000000000000000000000000000000000" // Mock para localhost
};

async function main() {
  const contractAddress = process.argv[2];
  const action = process.argv[3];
  
  if (!contractAddress) {
    console.log("❌ Error: Debes proporcionar la dirección del contrato.");
    console.log("Uso: npx hardhat run scripts/interact.js --network <red> -- <direccion_contrato> <accion>");
    console.log("\nAcciones disponibles:");
    console.log("  info - Mostrar información del contrato");
    console.log("  setBaseURI <nueva_uri> - Cambiar base URI");
    console.log("  setTokenURI <tokenId> <uri> - Establecer URI específica para token");
    console.log("  buy <cantidad> - Comprar NFTs (requiere USDC)");
    console.log("  tokens <wallet> - Mostrar tokens de una wallet");
    return;
  }
  
  console.log(`🔗 Conectando al contrato: ${contractAddress}`);
  
  // Obtener información de la red
  const network = await hre.ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  
  // Conectar al contrato
  const EnanosDeLeyenda = await hre.ethers.getContractFactory("EnanosDeLeyenda");
  const contract = EnanosDeLeyenda.attach(contractAddress);
  
  // Obtener signer
  const [signer] = await hre.ethers.getSigners();
  console.log(`👤 Usando cuenta: ${signer.address}`);
  
  try {
    switch (action) {
      case "info":
        await showContractInfo(contract);
        break;
      case "setBaseURI":
        const newBaseURI = process.argv[4];
        if (!newBaseURI) {
          console.log("❌ Error: Debes proporcionar la nueva base URI.");
          return;
        }
        await setBaseURI(contract, newBaseURI);
        break;
      case "setTokenURI":
        const tokenId = process.argv[4];
        const tokenURI = process.argv[5];
        if (!tokenId || !tokenURI) {
          console.log("❌ Error: Debes proporcionar tokenId y tokenURI.");
          return;
        }
        await setTokenURI(contract, parseInt(tokenId), tokenURI);
        break;
      case "buy":
        const amount = process.argv[4];
        if (!amount) {
          console.log("❌ Error: Debes proporcionar la cantidad a comprar.");
          return;
        }
        await buyNFTs(contract, parseInt(amount));
        break;
      case "tokens":
        const wallet = process.argv[4] || signer.address;
        await showWalletTokens(contract, wallet);
        break;
      default:
        console.log("❌ Acción no reconocida. Usa 'info' para ver las opciones disponibles.");
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

async function showContractInfo(contract) {
  console.log("\n📋 INFORMACIÓN DEL CONTRATO:");
  console.log(`   Nombre: ${await contract.name()}`);
  console.log(`   Símbolo: ${await contract.symbol()}`);
  console.log(`   Suministro máximo: ${await contract.MAX_SUPPLY()}`);
  console.log(`   Precio por NFT: ${await contract.PRICE()} wei`);
  console.log(`   Límite por wallet: ${await contract.MAX_TOKENS_PER_WALLET()}`);
  console.log(`   Base URI: ${await contract.getBaseURI()}`);
  console.log(`   NFTs disponibles: ${await contract.getAvailableTokensCount()}`);
  
  // Mostrar algunos tokens
  console.log("\n📄 PRIMEROS 3 TOKENS:");
  for (let i = 1; i <= 3; i++) {
    try {
      const tokenURI = await contract.tokenURI(i);
      const owner = await contract.ownerOf(i);
      const isAvailable = await contract.isAvailableForSale(i);
      
      console.log(`\n   NFT #${i}:`);
      console.log(`     📄 URI: ${tokenURI}`);
      console.log(`     👤 Propietario: ${owner}`);
      console.log(`     🛒 Disponible: ${isAvailable ? 'Sí' : 'No'}`);
    } catch (error) {
      console.log(`\n   ❌ Error con NFT #${i}: ${error.message}`);
    }
  }
}

async function setBaseURI(contract, newBaseURI) {
  console.log(`🔄 Cambiando base URI a: ${newBaseURI}`);
  
  const tx = await contract.setBaseURI(newBaseURI);
  console.log(`⏳ Transacción enviada: ${tx.hash}`);
  
  await tx.wait();
  console.log("✅ Base URI actualizada exitosamente!");
  
  // Verificar cambio
  const updatedBaseURI = await contract.getBaseURI();
  console.log(`✅ Base URI verificada: ${updatedBaseURI}`);
}

async function setTokenURI(contract, tokenId, tokenURI) {
  console.log(`🔄 Estableciendo URI específica para token #${tokenId}: ${tokenURI}`);
  
  const tx = await contract.setTokenURI(tokenId, tokenURI);
  console.log(`⏳ Transacción enviada: ${tx.hash}`);
  
  await tx.wait();
  console.log("✅ URI específica establecida exitosamente!");
  
  // Verificar cambio
  const updatedTokenURI = await contract.tokenURI(tokenId);
  console.log(`✅ URI del token verificada: ${updatedTokenURI}`);
}

async function buyNFTs(contract, amount) {
  console.log(`🛒 Intentando comprar ${amount} NFTs...`);
  
  // Verificar disponibilidad
  const available = await contract.getAvailableTokensCount();
  console.log(`📊 NFTs disponibles: ${available}`);
  
  if (available < amount) {
    console.log("❌ No hay suficientes NFTs disponibles.");
    return;
  }
  
  // Verificar límite de wallet
  const [signer] = await hre.ethers.getSigners();
  const remaining = await contract.getRemainingTokensForWallet(signer.address);
  console.log(`👤 NFTs que puedes comprar: ${remaining}`);
  
  if (remaining < amount) {
    console.log("❌ Excedes el límite de NFTs por wallet.");
    return;
  }
  
  // Calcular precio total
  const price = await contract.PRICE();
  const totalPrice = price * BigInt(amount);
  console.log(`💰 Precio total: ${hre.ethers.formatUnits(totalPrice, 6)} USDC`);
  
  // Nota: En un entorno real, necesitarías aprobar USDC primero
  console.log("⚠️  NOTA: Asegúrate de tener suficiente USDC y haber aprobado el contrato.");
  
  try {
    const tx = await contract.buyNFT(amount);
    console.log(`⏳ Transacción enviada: ${tx.hash}`);
    
    await tx.wait();
    console.log("✅ NFTs comprados exitosamente!");
  } catch (error) {
    console.log("❌ Error comprando NFTs:", error.message);
  }
}

async function showWalletTokens(contract, walletAddress) {
  console.log(`\n👤 Tokens de la wallet: ${walletAddress}`);
  
  const purchased = await contract.tokensPurchased(walletAddress);
  console.log(`📊 NFTs comprados: ${purchased}`);
  
  // Buscar tokens que pertenecen a esta wallet
  console.log("\n🔍 Buscando tokens...");
  const maxSupply = await contract.MAX_SUPPLY();
  const ownedTokens = [];
  
  for (let i = 1; i <= maxSupply; i++) {
    try {
      const owner = await contract.ownerOf(i);
      if (owner.toLowerCase() === walletAddress.toLowerCase()) {
        ownedTokens.push(i);
      }
    } catch (error) {
      // Token no existe o no es válido
    }
  }
  
  if (ownedTokens.length === 0) {
    console.log("❌ Esta wallet no posee ningún NFT.");
    return;
  }
  
  console.log(`✅ Tokens encontrados: ${ownedTokens.length}`);
  
  // Mostrar información de los primeros 10 tokens
  const tokensToShow = ownedTokens.slice(0, 10);
  for (const tokenId of tokensToShow) {
    try {
      const tokenURI = await contract.tokenURI(tokenId);
      console.log(`\n   NFT #${tokenId}:`);
      console.log(`     📄 URI: ${tokenURI}`);
    } catch (error) {
      console.log(`\n   ❌ Error con NFT #${tokenId}: ${error.message}`);
    }
  }
  
  if (ownedTokens.length > 10) {
    console.log(`\n   ... y ${ownedTokens.length - 10} tokens más`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
