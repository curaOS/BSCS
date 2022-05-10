const { program } = require('commander')
const nearAPI = require('near-api-js')
const fs = require('fs').promises
const configFile = require('./config.js')
const { homedir } = require('os')
const { KeyPair } = require('near-api-js')

let config
let masterAccount
let masterKey
let pubKey
let keyStore
let near
let contractAddress

program
    .option('-p, --new', 'Deploy to same minor version contract')
    .option('-m, --same', 'Deploy to new minor version contract')

program.parse(process.argv)

const options = program.opts()

if (options.new) {
    console.log('Deploying to new minor version...')
    deployNewContract()
}

if (options.same) {
    console.log('Deploying to same minor version...')
    deploySameContract()
}

async function deployNewContract() {
    await initNear()
    const contract = await fs.readFile(configFile.CONTRACT)

    const version = await configFile.newVersion()
    contractAddress = version + '.' + config.masterAccount

    const newKeyPair = KeyPair.fromRandom('ed25519')
    const newPublicKey = newKeyPair.publicKey.toString()
    await keyStore.setKey(config.networkId, contractAddress, newKeyPair)

    await masterAccount.createAndDeployContract(
        contractAddress,
        newPublicKey,
        contract,
        nearAPI.utils.format.parseNearAmount('1')
    )

    console.log('Contract deployed to: ' + contractAddress)

    init()
}

async function deploySameContract() {
    await initNear()
    const contract = await fs.readFile(configFile.CONTRACT)

    const version = await configFile.currentVersion()
    contractAddress = version + '.' + config.masterAccount

    const sameAccount = await near.account(contractAddress)

    sameAccount.deployContract(contract)

    console.log('Contract deployed to: ' + contractAddress)
}

async function initNear() {
    config = await configFile.networkConfig()

    const keyFile = require(config.keyPath)
    masterKey = nearAPI.utils.KeyPair.fromString(
        keyFile.secret_key || keyFile.private_key
    )
    pubKey = masterKey.getPublicKey()
    keyStore = new nearAPI.keyStores.UnencryptedFileSystemKeyStore(
        `${homedir()}/.near-credentials`
    )
    await keyStore.setKey(config.networkId, config.masterAccount, masterKey)
    near = await nearAPI.connect({
        keyStore,
        networkId: config.networkId,
        nodeUrl: config.nodeUrl,
    })
    masterAccount = new nearAPI.Account(near.connection, config.masterAccount)

    console.log('Finish init NEAR')
}

async function init() {
    let metadata = await configFile.metadata()
    let standard = metadata.standard
    let extra = metadata.extra

    // Encode packages_script to base64
    let buffer_packages_script = Buffer.from(extra.packages_script, 'utf8')
    let base_64_packages_script = buffer_packages_script.toString('base64')
    extra.packages_script = base_64_packages_script

    // Encode render_script to base64
    let buffer_render_script = Buffer.from(extra.render_script, 'utf8')
    let base_64_render_script = buffer_render_script.toString('base64')
    extra.render_script = base_64_render_script

    // Encode style_css to base64
    let buffer_style_css = Buffer.from(extra.style_css, 'utf8')
    let base_64_style_css = buffer_style_css.toString('base64')
    extra.style_css = base_64_style_css

    // Encode parameters to base64
    let buffer_parameters = Buffer.from(extra.parameters, 'utf8')
    let base_64_parameters = buffer_parameters.toString('base64')
    extra.parameters = base_64_parameters

    const contract = await new nearAPI.Contract(
        masterAccount,
        contractAddress,
        {
            changeMethods: ['init'],
        }
    )

    await contract.init({
        args: {
            owner_id: masterAccount.accountId,
            contract_metadata: standard,
            contract_extra: extra,
        },
        gas: 300000000000000,
    })
    console.log('Finished init contract')

    configFile.updateContractAddress(contractAddress)
}
