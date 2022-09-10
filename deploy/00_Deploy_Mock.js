const { network } = require("hardhat")
const BASE_FEE = "250000000000000000"
const GAS_PRICE_LINK = "1000000000"

module.exports = async ({ getNamedAccounts, deployments }) => {
    if (network.config.chainId == 31337) {
        const { deployer } = await getNamedAccounts()
        const { deploy, log } = deployments
        chainId = network.config.chainId

        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
            waitConfirmations: 1,
        })

        log("Mock VRFCoordinator deployed")
    } else {
        console.log("deploying to testnet rinkeby")
    }
}

module.exports.tags = ["all", "mock"]
