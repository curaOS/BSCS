const fs = require("fs");
const configFile = require("../../config");

const homedir = require("os").homedir();
const credentialsPath = require("path").join(homedir, ".near-credentials");

/***
 *  Network config used by NEAR
 ***/
exports.networkConfig = async () => {
  const config = await configFile.config();
  return {
    networkId: config.network,
    nodeUrl: "https://rpc." + config.network + ".near.org",
    masterAccount: config.masterAccount,
    keyPath:
      credentialsPath +
      "/" +
      config.network +
      "/" +
      config.masterAccount +
      ".json",
  };
};

/***
 *  Contract Metadata used to call init
 ***/
exports.metadata = configFile.metadata;

/***
 *  Contract wasm file to deploy
 ***/
exports.CONTRACT = "../contract/build/release/cNFT.wasm";

/***
 *  Updates contract version by x.x.1 and returns it
 ***/
exports.newVersion = async () => {
  const pck = fs.readFileSync("../../package.json");
  const pjson = JSON.parse(pck);

  // PATCH version is increased by one on each new deploy
  const tmp = pjson.version.split(".");
  const newVersion = `${tmp[0]}.${tmp[1]}.${parseInt(tmp[2]) + 1}`;
  fs.writeFileSync(
    "../../package.json",
    pck.toString().replace(pjson.version, newVersion)
  );

  const version = newVersion.replaceAll(".", "_");

  return version;
};

/***
 *  Updates contractAddress in package.json
 ***/
exports.updateContractAddress = async (newContract) => {
  const pck = fs.readFileSync("../../package.json");
  const oldContract = JSON.parse(pck).config.contractAddress;

  fs.writeFileSync(
    "../../package.json",
    pck.toString().replace(oldContract, newContract)
  );
};
