// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    enum RaffleState {
        OPEN,
        CALCULATING
    }

    uint256 private constant MIN_AMOUNT = 100000000000000000;
    uint16 private constant minimumRequestConfirmations = 3;
    uint32 private constant numWords = 1;

    VRFCoordinatorV2Interface private immutable i_vrfCoordinatorV2Interface;
    bytes32 private immutable i_keyHash;
    uint64 private immutable i_subId;
    uint32 private immutable i_callbackGasLimit;
    uint256 private immutable i_interval;

    RaffleState private s_raffleState;
    uint256 private s_lastTimeStamp;
    address payable[] private s_players;
    address s_winner;

    error InsufficientAmount();
    error RaffleCalculating();
    error RaffleNotOpen();
    error TransferFailed();

    event RaffleEnter(address indexed player);
    event RequestRaffleWinner(uint256 indexed Id);
    event WinnerPicked(address indexed winner);

    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subId,
        uint32 _callbackGasLimit,
        uint256 _interval
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_vrfCoordinatorV2Interface = VRFCoordinatorV2Interface(_vrfCoordinator);
        i_keyHash = _keyHash;
        i_subId = _subId;
        i_callbackGasLimit = _callbackGasLimit;
        i_interval = _interval;
    }

    function enterRaffle() public payable {
        if (msg.value < MIN_AMOUNT) {
            revert InsufficientAmount();
        }
        if (s_raffleState == RaffleState.CALCULATING) {
            revert RaffleCalculating();
        }
        s_players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    function checkUpkeep(
        bytes memory /*checkData*/
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /*performData*/
        )
    {
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        bool timePassed = (block.timestamp - s_lastTimeStamp) > i_interval;
        bool isOpen = s_raffleState == RaffleState.OPEN;

        upkeepNeeded = hasPlayers && hasBalance && timePassed && isOpen;

        return (upkeepNeeded, "0x");
    }

    function performUpkeep(
        bytes calldata /*performData*/
    ) external override {
        (bool status, ) = checkUpkeep("0x");
        if (!status) {
            revert RaffleNotOpen();
        }

        s_raffleState == RaffleState.CALCULATING;

        uint256 requestId = i_vrfCoordinatorV2Interface.requestRandomWords(
            i_keyHash,
            i_subId,
            minimumRequestConfirmations,
            i_callbackGasLimit,
            numWords
        );

        emit RequestRaffleWinner(requestId);
    }

    function fulfillRandomWords(
        uint256, /*requestId*/
        uint256[] memory randomWords
    ) internal override {
        uint256 winnerIndex = randomWords[0] % 2;
        address winner = s_players[winnerIndex];
        s_winner = winner;
        (
            bool success, /*bytes memory data*/

        ) = winner.call{value: address(this).balance}("");
        if (!success) {
            revert TransferFailed();
        }
        s_raffleState == RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        s_players = new address payable[](0);
        emit WinnerPicked(winner);
    }

    function getRaffleState() public view returns (uint256) {
        return uint256(s_raffleState);
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getWinner() public view returns (address) {
        return s_winner;
    }

    function getMinEntranceFee() public pure returns (uint256) {
        return MIN_AMOUNT;
    }

    function getNumWords() public pure returns (uint256) {
        return numWords;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }
}
