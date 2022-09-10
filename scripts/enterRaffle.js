const { getAccountPath } = require("ethers/lib/utils")
const { ethers, network } = require("hardhat")

const raffleEnter = async () => {
    const raffle = await ethers.getContract("Raffle")
    const entranceFee = await raffle.getMinEntranceFee()
    const additionalEntrances = 3
    const startingIndex = 1
    const accounts = await ethers.getSigners()

    await new Promise(async (resolve, reject) => {
        raffle.once("RaffleEnter", () => {
            console.log("Raffle Entered")
            resolve()
        })
        const tx = await raffle.enterRaffle({ value: entranceFee + 1 })
        await tx.wait(1)
    })
    for (i = startingIndex; i < additionalEntrances + startingIndex; i++) {
        const raffleContract = raffle.connect(accounts[i])
        await raffleContract.enterRaffle({ value: entranceFee + 1 })
    }
    console.log(`${await raffle.getNumberOfPlayers()} players in the Raffle`)
}

raffleEnter()
    .then(() => {
        process.exit(0)
    })
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
