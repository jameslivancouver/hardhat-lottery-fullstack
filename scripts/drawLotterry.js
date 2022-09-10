const { ethers, network } = require("hardhat")

const manualDrawLottery = async () => {
    const raffle = await ethers.getContract("Raffle")
    const interval = await raffle.getInterval()
    console.log(interval.toNumber())
    await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
    await network.provider.request({ method: "evm_mine", params: [] })
    // const data = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""))
    const { upkeepNeeded } = await raffle.callStatic.checkUpkeep("0x")
    if (upkeepNeeded) {
        const tx = await raffle.performUpkeep("0x")
        const txReceipt = await tx.wait(1)
        // console.log(txReceipt)
        // const requestId = ethers.BigNumber.from(txReceipt.events[1].topics[1])
        const requestId = txReceipt.events[1].args.Id
        // console.log(txReceipt.events[0].topics[1])
        // console.log(txReceipt.events[1].topics[1])
        // console.log(txReceipt.events[1].args.Id)
        await mockVrf(requestId, raffle)
    } else {
        console.log("upkeep is not needed")
    }
}

// const mockVrf = async (id, contract) => {
//     const vrfCoordinatorMock = await ethers.getContract("VRFCoordinatorV2Mock")
//     await vrfCoordinatorMock.fulfillRandomWords(id, contract.address)
//     const recentWinner = await contract.getWinner()
//     console.log(`The winner is ${recentWinner}`)
// }

const mockVrf = async (id, contract) => {
    await new Promise(async (resolve, reject) => {
        contract.once("WinnerPicked", async () => {
            const recentWinner = txReceipt.events[0].topics[1]
            console.log(`The winner is ${recentWinner}`)
            resolve()
        })
        const vrfCoordinatorMock = await ethers.getContract("VRFCoordinatorV2Mock")
        const tx = await vrfCoordinatorMock.fulfillRandomWords(id, contract.address)
        txReceipt = await tx.wait(1)
        console.log(txReceipt.events)
    })
}

manualDrawLottery()
    .then(() => {
        process.exit(0)
    })
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
