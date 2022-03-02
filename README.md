# BSCS

## Overview
This monorepo consists of

### [Contract](https://github.com/curaOS/Creative-Project/tree/master/packages/contract) 
A frozen version of the cNFT contract.

### [Dashboard](https://github.com/curaOS/Creative-Project/tree/master/packages/dashboard) 
A stats page powered by The Graph

### [Scripts](https://github.com/curaOS/Creative-Project/tree/master/packages/scripts)
Scripts used to automate repetitive tasks (currently only a script for deploying the contract)

### [Tests](https://github.com/curaOS/Creative-Project/tree/master/packages/tests)
End-to-end tests for the contract

### [Website](https://github.com/curaOS/Creative-Project/tree/master/packages/website)
Frontend for [bscs.cura.run](https://bscs.cura.run/)

### [Subgraph](https://github.com/curaOS/Creative-Project/tree/master/packages/subgraph)
Frontend for [bscs.cura.run](https://bscs.cura.run/)

## Developement
### Install
```bash
yarn install
```

### Build commands 
```bash
yarn build:website # build the website under packages/website
```
```bash
yarn build:subgraph # build the subgraph under packages/subgraph
```
```bash
yarn build:contract # build the contract under packages/contract
```

### Deploy commands 
#### 1. Deploying the Contract
```bash
yarn deploy:contract 
```
This command will run deployement script from packages/scripts, this script will:
1. Read `/package.json` to determine the contract address and network
3. Create and deploy the contract to a new address
4. Update the version and contract address under `/package.json`
5. Update the contract address under `packages/subgraph/subgraph.yaml`
6. Read `/metadata.json` and use it to call `init`

#### 2. Deploying the Subgraph
Before running this command, we need to Only update `startBlock` under `packages/subgraph/subgraph.yaml` (optional but will make indexing faster)
```bash
yarn deploy:subgraph
```

#### 3. Deploying the website
That's handled via Vercel, and it uses the configs from `package.json`
