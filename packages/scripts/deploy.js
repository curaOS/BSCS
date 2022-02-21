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
  config = await configFile.networkConfig();

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

  const version = await configFile.newVersion();

  contractAddress = version + "." + config.masterAccount;

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
  let metadata = await configFile.metadata();
  let standard = metadata.standard;
  let extra = metadata.extra;

  const contract = await new nearAPI.Contract(masterAccount, contractAddress, {
    changeMethods: ["init"],
  });

  await contract.init({
    args: {
      owner_id: masterAccount.accountId,
      contract_metadata: standard,
      contract_extra: extra,
    },
    gas: 300000000000000,
  });
  console.log("Finished init contract");

  configFile.updateContractAddress(contractAddress);
}

deploy();
