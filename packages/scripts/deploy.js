const nearAPI = require("near-api-js");
const BN = require("bn.js");
const fs = require("fs").promises;
const configFile = require("./config.js");

let config;
let masterAccount;
let masterKey;
let pubKey;
let keyStore;
let near;
let contractAddress;

async function initNear() {
  if (process.env.NEAR_ENV == "mainnet") {
    config = configFile.config.mainnet;
  } else {
    config = configFile.config.testnet;
  }

  const keyFile = require(config.keyPath);
  masterKey = nearAPI.utils.KeyPair.fromString(
    keyFile.secret_key || keyFile.private_key
  );
  pubKey = masterKey.getPublicKey();
  keyStore = new nearAPI.keyStores.InMemoryKeyStore();
  keyStore.setKey(config.networkId, config.masterAccount, masterKey);
  near = await nearAPI.connect({
    deps: {
      keyStore,
    },
    networkId: config.networkId,
    nodeUrl: config.nodeUrl,
  });
  masterAccount = new nearAPI.Account(near.connection, config.masterAccount);
  console.log("Finish init NEAR");
}

async function deploy() {
  await initNear();

  const contract = await fs.readFile(configFile.CONTRACT);

  contractAddress = configFile.CONTRACT_ADDRESS + "." + config.masterAccount;

  const response = await masterAccount.createAndDeployContract(
    contractAddress,
    pubKey,
    contract,
    new BN(9).pow(new BN(25))
  );

  console.log("Contract deployed to: " + contractAddress);

  init();
}

async function init() {
  let metadata = configFile.METADATA.standard;
  let extra = configFile.METADATA.extra;

  const contract = await new nearAPI.Contract(masterAccount, contractAddress, {
    changeMethods: ["init"],
  });

  await contract.init({
    args: {
      contract_metadata: metadata,
      contract_extra: extra,
    },
    gas: 300000000000000,
  });
  console.log("Finish init contract ");
}

deploy();
