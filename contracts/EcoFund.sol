// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IToken {
    function mint(address to, uint256 amount) external;
}

contract EcoFund {

    struct Campaign {
        string title;
        string description;
        uint256 goal;
        uint256 deadline;
        uint256 raised;
        address creator;
        bool finished;
    }

    Campaign[] public campaigns;

    mapping(uint256 => mapping(address => uint256)) public contributions;

    IToken public token;

    constructor(address tokenAddress) {
        token = IToken(tokenAddress);
    }

    function createCampaign(
        string memory title,
        string memory description,
        uint256 goal,
        uint256 duration
    ) public {
        campaigns.push(
            Campaign(
                title,
                description,
                goal,
                block.timestamp + duration,
                0,
                msg.sender,
                false
            )
        );
    }

    function contribute(uint256 id) public payable {
        Campaign storage c = campaigns[id];

        require(block.timestamp < c.deadline, "Campaign ended");
        require(msg.value > 0, "Send ETH");

        c.raised += msg.value;
        contributions[id][msg.sender] += msg.value;

        // reward donor
        token.mint(msg.sender, msg.value);
    }

    function finalizeCampaign(uint256 id) public {
        Campaign storage c = campaigns[id];

        require(block.timestamp >= c.deadline, "Still active");

        c.finished = true;
    }

    // ✅ NEW — creator withdraws funds
    function withdraw(uint256 id) public {
        Campaign storage c = campaigns[id];

        require(block.timestamp >= c.deadline, "Campaign active");
        require(msg.sender == c.creator, "Not creator");
        require(c.raised > 0, "Nothing to withdraw");

        uint256 amount = c.raised;
        c.raised = 0;

        payable(c.creator).transfer(amount);
    }

    function getCampaignCount() public view returns (uint256) {
        return campaigns.length;
    }
}
