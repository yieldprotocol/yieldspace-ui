// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "./interfaces/IReimbursementToken.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

/**
 * @notice A ReimbursementPool manages the mechanics of paying out the redemption value of its associated
 * ReimbursementToken. It manages the collateral and treasury balances, and ensures token holders are
 * paid back their debt in full (if funds are available) or to the maximum extent possible (if there is
 * a shortfall) at maturity. The bond issuer may also reclaim any *excess* capital after maturity.
 */
contract ReimbursementPool {
  // ======================================= Events ================================================

  event TreasuryDeposit(address indexed despositer, uint256 amount);

  event Redemption(address indexed redeemer, uint256 riTokenAmount, uint256 treasuryTokenAmount);

  // ======================================= State variables =======================================

  /// @notice The Reimbursement Token associated with this pool
  IReimbursementToken public immutable riToken;

  /// @notice The treasury token, i.e. the Reimbursement Token's "underlying", in which token holders are paid
  IERC20Metadata public immutable treasuryToken;

  /// @notice An optional collateral token, used to compensate holders in the case of treasury shortfall
  IERC20Metadata public immutable collateralToken;

  /// @notice Unix time at which redemption of tokens for treasury/collateral tokens is possible
  uint256 public immutable maturity;

  /// @notice The maximum rate at which Reimbursement Tokens will be exchanged for treasury tokens at maturity,
  /// stored as a WAD; so 1 treasury token for 1 riToken = 1e18, 0.5 treasury tokens for 1 riToken = 0.5e18, etc...
  uint256 public immutable targetExchangeRate;

  uint256 public treasuryBalance;

  bool public hasMatured;

  uint256 public finalShortfall;

  uint256 public finalSurplus;

  uint256 public finalExchangeRate;

  /**
   * @param _riToken The Reimbursement Token associated with this pool
   * @param _collateralToken An optional collateral token, used to compensate holders in the case of treasury shortfall;
   * should be the zero address if no collateral token will be used.
   * @param _targetExchangeRate The maximum rate at which Reimbursement Tokens will be exchanged for treasury tokens
   * at maturity
   */
  constructor(
    IReimbursementToken _riToken,
    IERC20Metadata _collateralToken,
    uint256 _targetExchangeRate
  ) {
    require(
      IERC20(_riToken.underlying()).totalSupply() > 0,
      "ReimbursementPool: Treasury Token must have non-zero supply"
    );

    require(
      (address(_collateralToken) == address(0)) || (IERC20(_collateralToken).totalSupply() > 0),
      "ReimbursementPool: Collateral Token must have non-zero supply"
    );

    require(_riToken.maturity() > block.timestamp, "ReimbursementPool: Token maturity must be in the future");

    require(_targetExchangeRate > 0, "ReimbursementPool: Target exchange rate must be non-zero");

    riToken = _riToken;
    treasuryToken = IERC20Metadata(_riToken.underlying());
    collateralToken = IERC20Metadata(_collateralToken);
    maturity = _riToken.maturity();
    targetExchangeRate = _targetExchangeRate;
  }

  // ======================================= Public view ===========================================

  function totalDebtFaceValue() public view returns (uint256) {
    return wmul(riToken.totalSupply(), targetExchangeRate) / 10**(18 - treasuryToken.decimals());
  }

  function currentShortfallOrSurplus() public view returns (uint256 shortfall, uint256 surplus) {
    uint256 _totalDebtFaceValue = totalDebtFaceValue();

    // Our if/else prevents overflow, so we can save gas w/ unchecked
    unchecked {
      if (treasuryBalance >= _totalDebtFaceValue) {
        // surplus or exact face value debt paid
        return (0, treasuryBalance - _totalDebtFaceValue);
      } else {
        // shortfall
        return (_totalDebtFaceValue - treasuryBalance, 0);
      }
    }
  }

  // ======================================= External functions ====================================

  function depositToTreasury(uint256 _amount) external {
    treasuryBalance += _amount;

    emit TreasuryDeposit(msg.sender, _amount);

    require(
      treasuryToken.transferFrom(msg.sender, address(this), _amount) == true,
      "ReimbursementPool: Treasury Token Transfer Failed"
    );
  }

  function mature() external {
    require(block.timestamp >= maturity, "ReimbursementPool: Cannot mature before maturity date");
    hasMatured = true;
    (finalShortfall, finalSurplus) = currentShortfallOrSurplus();

    if (finalShortfall == 0) {
      finalExchangeRate = targetExchangeRate;
    } else {
      uint256 wadTreasuryBalance = treasuryBalance * 10**(18 - treasuryToken.decimals());
      finalExchangeRate = wdiv(wadTreasuryBalance, riToken.totalSupply());
    }
  }

  function redeem(uint256 _amount) external {
    require(hasMatured, "ReimbursementPool: No redemptions before maturity");

    require(
      riToken.transferFrom(msg.sender, address(this), _amount),
      "ReimbursementPool: Reimbursement Token transfer failed"
    );

    uint256 _redemptionAmount = wmul(_amount, finalExchangeRate);
    treasuryToken.transfer(msg.sender, _redemptionAmount);

    emit Redemption(msg.sender, _amount, _redemptionAmount);
  }

  // ======================================= Utility functions =====================================

  function wmul(uint256 x, uint256 y) internal pure returns (uint256 z) {
    z = x * y;
    unchecked {
      z /= 1e18;
    }
  }

  function wdiv(uint256 x, uint256 y) internal pure returns (uint256 z) {
    z = (x * 1e18) / y;
  }
}
