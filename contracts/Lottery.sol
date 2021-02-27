// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.7.0;

contract Lottery {
    address public manager;
    address payable[] public players;
    address public player;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .01 ether);
        players.push(msg.sender);
    }

    function random() private view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(block.difficulty, block.timestamp, players)
                )
            );
    }

    function pickWinner() public restricted {
        uint256 index = random() % players.length;
        players[index].transfer(address(this).balance);
        player = players[index];
        players = new address payable[](0); //the 0 value inside paranrtheses indicates Emptey array
    }

    function returnWinnerAdress() public view returns (address) {
        return player;
    }

    modifier restricted() {
        require(msg.sender == manager);
        _; //underscore represent the target code
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }
}
