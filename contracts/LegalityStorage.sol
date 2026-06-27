// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LegalityStorage {
    address payable public admin;
    mapping(address => bytes32[]) public userContracts;
    
    event HashStored(address indexed user, bytes32 hash);
    event ContractFeePaid(address indexed buyer, uint256 amount);

    constructor() {
        admin = payable(msg.sender);
    }

    function payForContract() public payable {
        require(msg.value == 0.1 ether, "Fee must be exactly 0.1 ETH");
        admin.transfer(msg.value);
        emit ContractFeePaid(msg.sender, msg.value);
    }

    function storeHash(bytes32 _hash) public {
        userContracts[msg.sender].push(_hash);
        emit HashStored(msg.sender, _hash);
    }

    function getUserHashes(address user) public view returns (bytes32[] memory) {
        return userContracts[user];
    }
}
