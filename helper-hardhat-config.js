const networkConfig = {
    default: {
        name: "hardhat",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        keepersUpdateInterval: "30",
        fundAmount: "10000000000000000000",
        callbackGasLimit: "500000",
    },
    31337: {
        name: "localhost",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        keepersUpdateInterval: "30",
        fundAmount: "10000000000000000000", // 10
        callbackGasLimit: "500000",
    },
    4: {
        name: "rinkeby",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        keepersUpdateInterval: "30",
        callbackGasLimit: "500000",
        subId: "123",
        vrfCoordinator: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    },
}

const developmentChains = ["hardhat", "localhost"]

const verficationBlockConfirmations = 6

module.exports = {
    networkConfig,
    developmentChains,
    verficationBlockConfirmations,
}
