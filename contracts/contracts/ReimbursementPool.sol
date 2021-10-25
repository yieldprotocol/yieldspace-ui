// SPDX-License-Identifier: MIT
pragma solidity >=0.8.7;

import "./interfaces/IReimbursementToken.sol";
import "./interfaces/IReimbursementOracle.sol";
import "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";

/**
 * @notice A ReimbursementPool manages the mechanics of paying out the redemption value of its associated
 * ReimbursementToken. It manages the collateral and treasury balances, and ensures token holders are
 * paid back their debt in full (if funds are available) or to the maximum extent possible (if there is
 * a shortfall) at maturity. The bond issuer may also reclaim any *excess* capital after maturity.
 */
contract ReimbursementPool {
  // ======================================= Events ================================================

  event TreasuryDeposit(address indexed depositor, uint256 amount);

  event CollateralDeposit(address indexed depositor, uint256 amount);

  event Redemption(
    address indexed redeemer,
    uint256 riTokenAmount,
    uint256 treasuryTokenAmount,
    uint256 collateralTokenAmount
  );

  // ======================================= State variables =======================================

  /// @notice The Reimbursement Token associated with this pool
  IReimbursementToken public immutable riToken;

  /// @notice The treasury token, i.e. the Reimbursement Token's "underlying", in which token holders are paid
  IERC20Metadata public immutable treasuryToken;

  /// @notice An optional collateral token, used to compensate holders in the case of treasury shortfall
  IERC20Metadata public immutable collateralToken;

  IReimbursementOracle public immutable collateralOracle;

  /// @notice Unix time at which toggling of the hasMatured flag becomes possible, enabling redemption of
  /// the treasury/collateral tokens stored in the pool
  uint256 public immutable maturity;

  /// @notice The maximum rate at which Reimbursement Tokens will be exchanged for treasury tokens at maturity,
  /// stored as a WAD; so 1 treasury token for 1 riToken = 1e18, 0.5 treasury tokens for 1 riToken = 0.5e18, etc...
  uint256 public immutable targetExchangeRate;

  /// @notice The quantity of treasury tokens that have been deposited to the pool as payment toward the
  /// face value debt
  uint256 public treasuryBalance;

  uint256 public collateralBalance;

  /// @notice Flag indicating whether this pool is considered mature; can only be flipped after maturity
  bool public hasMatured;

  /// @notice The final shortfall of treasury tokens compared to the face value debt, which is
  /// calculated and populated at maturity
  uint256 public finalShortfall;

  /// @notice The final surplus of treasury tokens compared to the face value debt, which is
  /// calculated and populated at maturity
  uint256 public finalSurplus;

  /// @notice The final exchange rate at which Reimbursement Tokens can be exchanged for treasury tokens,
  /// stored in the pool; this value is calculated at maturity and is equal to the target exchange rate if
  /// at least the face value debt was deposited to the pool
  uint256 public finalExchangeRate;

  /// @notice The quoted exchange rate of collateral tokens, denominated in treasury tokens, recorded at time
  /// of maturity if and only if collateral tokens will be used to make up for a treasury shortfall
  uint256 public collateralQuoteRate;

  /// @notice The final exchange rate at which Reimbursement Tokens can be exchanged for collateral tokens,
  /// stored in the pool; this value is calculated at maturity and is equal to zero if at least the face value
  /// debt was deposited to the pool; if there was a shortfall, this rate is determined based on the size of
  /// the shortfall, and the price of the collateral at maturity according to the collateral oracle
  uint256 public collateralExchangeRate;

  /// @notice The amount of collateral in the pool which will be distributed to make up for a shortfall after
  /// maturity; always zero before maturity; zero after maturity if no collateral will be distributed
  uint256 public redeemableCollateral;

  /**
   * @param _riToken The Reimbursement Token associated with this pool
   * @param _collateralToken An optional collateral token, used to compensate holders in the case of treasury shortfall;
   * should be the zero address if no collateral token will be used
   * @param _collateralOracle An oracle to provide price quotes of the collateral token denominated in the treasury token;
   * should be the zero address if no collateral token is used
   * @param _targetExchangeRate The maximum rate at which Reimbursement Tokens will be exchanged for treasury tokens
   * at maturity
   */
  constructor(
    IReimbursementToken _riToken,
    IERC20Metadata _collateralToken,
    IReimbursementOracle _collateralOracle,
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

    bool collateralFieldsEmpty = (address(_collateralToken) == address(0)) &&
      (address(_collateralOracle) == address(0));
    bool collateralFieldsPopulated = (address(_collateralToken) != address(0)) &&
      (address(_collateralOracle) != address(0));

    require(collateralFieldsEmpty || collateralFieldsPopulated, "ReimbursementPool: Collateral token/oracle mismatch");

    if (collateralFieldsPopulated) {
      require(
        _collateralOracle.getOracleQuote(_riToken.underlying(), address(_collateralToken)) > 0,
        "ReimbursementPool: Oracle must return positive quote"
      );
    }

    require(_riToken.maturity() > block.timestamp, "ReimbursementPool: Token maturity must be in the future");

    require(_targetExchangeRate > 0, "ReimbursementPool: Target exchange rate must be non-zero");

    riToken = _riToken;
    treasuryToken = IERC20Metadata(_riToken.underlying());
    collateralToken = IERC20Metadata(_collateralToken);
    collateralOracle = _collateralOracle;
    maturity = _riToken.maturity();
    targetExchangeRate = _targetExchangeRate;
  }

  // ======================================= Public view ===========================================

  /**
   * @return The total debt of the system at face value, denominated in the underlying, i.e. the treasury token
   */
  function totalDebtFaceValue() public view returns (uint256) {
    return wmul(riToken.totalSupply(), targetExchangeRate) / 10**(18 - treasuryToken.decimals());
  }

  /**
   * @notice Returns the pool's current shortfall or surplus, denominated in the underlying, i.e. the treasury token,
   * expressed as tuple where the first value is the shortfall, the second value is the surplus, and at least
   * one of them will always be 0.
   * @return shortfall The pool's current treasury token shortfall, compared to the face value debt
   * @return surplus The pool's current treasury token surplus, compared to the face value debt
   */
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

  /**
   * @notice Make a deposit of treasury tokens to the pool
   * @param _amount The quantity of treasury tokens to deposit
   */
  function depositToTreasury(uint256 _amount) external {
    require(!hasMatured, "ReimbursementPool: Cannot deposit to treasury after maturity");
    treasuryBalance += _amount;

    emit TreasuryDeposit(msg.sender, _amount);

    require(
      treasuryToken.transferFrom(msg.sender, address(this), _amount) == true,
      "ReimbursementPool: Treasury Token Transfer Failed"
    );
  }

  /**
   * @notice Make a deposit of collateral to the pool
   * @param _amount The quantity of collateral tokens to deposit
   */
  function depositCollateral(uint256 _amount) external {
    require(!hasMatured, "ReimbursementPool: Cannot deposit collateral after maturity");
    collateralBalance += _amount;

    emit CollateralDeposit(msg.sender, _amount);

    require(
      collateralToken.transferFrom(msg.sender, address(this), _amount) == true,
      "ReimbursementPool: Collateral Token Transfer Failed"
    );
  }

  /**
   * @notice Causes the reimbursement pool to reach maturity. Can only be called after the maturity
   * date, and can only be called once in the lifetime of a pool.
   */
  function mature() external {
    require(block.timestamp >= maturity, "ReimbursementPool: Cannot mature before maturity date");
    require(!hasMatured, "ReimbursementPool: Already matured");

    hasMatured = true;
    (finalShortfall, finalSurplus) = currentShortfallOrSurplus();

    if (finalShortfall == 0) {
      finalExchangeRate = targetExchangeRate;
    } else {
      uint256 _wadTreasuryBalance = treasuryBalance * 10**(18 - treasuryToken.decimals());
      finalExchangeRate = wdiv(_wadTreasuryBalance, riToken.totalSupply());

      // there's a shortfall and there is collateral, so do collateral calculations
      if (address(collateralToken) != address(0) && collateralBalance > 0) {
        // price of collat token as a wad
        collateralQuoteRate = collateralOracle.getOracleQuote(address(collateralToken), address(treasuryToken));

        uint256 _wadCollateralBalance = toWad(collateralBalance, collateralToken.decimals());
        uint256 _wadCollateralValue = wmul(_wadCollateralBalance, collateralQuoteRate);
        uint256 _wadFinalShortfall = toWad(finalShortfall, treasuryToken.decimals());

        if (_wadFinalShortfall >= _wadCollateralValue) {
          // the shortfall is so big all collateral will be distributed
          collateralExchangeRate = wdiv(_wadCollateralBalance, riToken.totalSupply());
          redeemableCollateral = collateralBalance;
        } else {
          // only some of collateral needs to be distributed
          uint256 _wadTokenCount = wdiv(wmul(_wadFinalShortfall, _wadCollateralBalance), _wadCollateralValue);
          collateralExchangeRate = wdiv(_wadTokenCount, riToken.totalSupply());
          redeemableCollateral = wmul(_wadTokenCount, 10**collateralToken.decimals());
        }
      }
    }

    // TODO: Emit a Mature event
  }

  /**
   * @notice Redeems the caller's Reimbursement Tokens for their share of the underlying, based on the
   * the final exchange rate. Can only be called once the pool has matured.
   * @param _amount The quantity of Reimbursement Tokens to redeem
   */
  function redeem(uint256 _amount) external {
    require(hasMatured, "ReimbursementPool: No redemptions before maturity");

    require(
      riToken.transferFrom(msg.sender, address(this), _amount),
      "ReimbursementPool: Reimbursement Token transfer failed"
    );

    uint256 _redemptionAmount = wmul(_amount, finalExchangeRate);
    treasuryToken.transfer(msg.sender, _redemptionAmount);

    uint256 _collateralRedemptionAmount = 0;
    if (collateralExchangeRate > 0) {
      _collateralRedemptionAmount = wmul(_amount, collateralExchangeRate);
      collateralToken.transfer(msg.sender, _collateralRedemptionAmount);
    }

    emit Redemption(msg.sender, _amount, _redemptionAmount, _collateralRedemptionAmount);
  }

  // ======================================= Utility functions =====================================

  /**
   * @notice Multiply two numbers where, one has WAD precision and one has precision less than or
   * equal to a WAD, while maintaining the precision of the latter.
   * @dev Sourced via https://github.com/yieldprotocol/yield-utils-v2/blob/main/contracts/math/WMul.sol
   */
  function wmul(uint256 x, uint256 y) internal pure returns (uint256 z) {
    z = x * y;
    unchecked {
      z /= 1e18;
    }
  }

  /**
   * @notice Divide x by y, where y has WAD precision and x has precision less than or equal to a WAD,
   * while maintaining the precision of y.
   * @dev Sourced via https://github.com/yieldprotocol/yield-utils-v2/blob/main/contracts/math/WDiv.sol
   */
  function wdiv(uint256 x, uint256 y) internal pure returns (uint256 z) {
    z = (x * 1e18) / y;
  }

  function toWad(uint256 amount, uint256 decimals) internal pure returns (uint256) {
    return amount * 10**(18 - decimals);
  }
}
