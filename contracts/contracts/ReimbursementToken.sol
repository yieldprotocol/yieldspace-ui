// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract ReimbursementToken is ERC20Permit {
    uint256 public immutable maturity;
    address public immutable underlying;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maturity,
        address _underlying,
        uint256 _supply,
        address _receiver) ERC20Permit(_name) ERC20(_name, _symbol)
    {
        require(_maturity > block.timestamp, "ReimbursementToken: Maturity date must be in future");
        maturity = _maturity;
        underlying = _underlying;
        _mint(_receiver, _supply);
    }
}
