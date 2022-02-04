const fs = require("fs");

const homedir = require("os").homedir();
const credentialsPath = require("path").join(homedir, ".near-credentials");

exports.config = {
  testnet: {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    masterAccount: "achtest.testnet",
    keyPath: credentialsPath + "/testnet/achtest.testnet.json",
  },
  mainnet: {
    networkId: "mainnet",
    nodeUrl: "https://rpc.mainnet.near.org",
    masterAccount: "achtest.mainnet",
    keyPath: credentialsPath + "/mainnet/achtest.mainnet.json",
  },
};

const pck = fs.readFileSync("./package.json");
const pjson = JSON.parse(pck);

// PATCH version is increased by one on each new deploy
const tmp = pjson.version.split(".");
const newVersion = `${tmp[0]}.${tmp[1]}.${parseInt(tmp[2]) + 1}`;
fs.writeFileSync(
  "./package.json",
  pck.toString().replace(pjson.version, newVersion)
);

const version = newVersion.replaceAll(".", "_");
// A sub account will be created using this name
exports.CONTRACT_ADDRESS = `cura-${version}`;

// This will be used in init for Contract Metadata
const metadata = require("./metadata.json");
exports.METADATA = metadata;

// Contract file
exports.CONTRACT = "../contract/build/release/cNFT.wasm";
