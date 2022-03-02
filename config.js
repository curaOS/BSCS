const fs = require("fs/promises");
const path = require("path");

async function config() {
  const filePath = path.resolve(__dirname, "./package.json");
  const pck = await fs.readFile(filePath);
  const pckjson = JSON.parse(pck);

  return {
    version: pckjson.version,
    contractAddress: pckjson.config.contractAddress,
    network: pckjson.config.network,
    masterAccount: pckjson.config.masterAccount,
    graphAPI: pckjson.config.graphAPI,
  };
}

async function metadata() {
  const filePath = path.resolve(__dirname, "./metadata.json");
  const metadata = await fs.readFile(filePath);
  return JSON.parse(metadata);
}

module.exports = { config, metadata };
