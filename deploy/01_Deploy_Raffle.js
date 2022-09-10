const { network, ethers } = require("hardhat")
const { verify } = require("../helper-functions")
const {
    networkConfig,
    developmentChains,
    verficationBlockConfirmations,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let subId
    let vrfCoordinator
    const chainId = network.config.chainId

    if (chainId == 31337) {
        const vrfCoordinatorMock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinator = vrfCoordinatorMock.address
        const transaction = await vrfCoordinatorMock.createSubscription()
        const transactionReceipt = await transaction.wait(1)
        subId = ethers.BigNumber.from(transactionReceipt.events[0].topics[1])
        const fundAmount = networkConfig[chainId]["fundAmount"]
        await vrfCoordinatorMock.fundSubscription(subId, fundAmount)
    } else {
        vrfCoordinator = networkConfig[chainId]["vrfCoordinator"]
        subId = networkConfig[chainId]["subId"]
    }
    const keyHash = networkConfig[chainId]["keyHash"]
    const interval = networkConfig[chainId]["keepersUpdateInterval"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const args = [vrfCoordinator, keyHash, subId, callbackGasLimit, interval]
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : verficationBlockConfirmations

    const raffle = await deploy("Raffle", {
        contract: "Raffle",
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    log(`Raffle Contract deployed at ${raffle.address}.`)
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(raffle.address, args)
    }
}

module.exports.tags = ["all", "raffle"]
