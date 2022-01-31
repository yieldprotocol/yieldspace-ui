import { useState } from 'react';
import tw from 'tailwind-styled-components';
import AssetSelect from '../common/AssetSelect';
import BackButton from '../common/BackButton';
import Button from '../common/Button';
import Deposit from './Deposit';

const BorderWrap = tw.div`mx-auto max-w-md p-2 border-2 border-secondary-400 shadow-sm rounded-lg bg-gray-800`;
const Inner = tw.div`m-4 text-center`;
const Header = tw.div`text-lg font-bold justify-items-start align-middle`;
const HeaderText = tw.span`align-middle`;
const HeaderSmall = tw.div`align-middle text-sm font-bold justify-start text-left`;

const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center`;
const ClearButton = tw.button`text-sm`;

const AddLiquidity = () => {
  const [base, setBase] = useState<string | null>(null);
  const [fyToken, setFyToken] = useState<string | null>(null);

  const [baseAmount, setBaseAmount] = useState<string | null>('0');
  const [fyTokenAmount, setFyTokenAmount] = useState<string | null>('0');

  // balances
  const [baseBalance, setBaseBalance] = useState<string | undefined>(undefined);
  const [fyTokenBalance, setFyTokenBalance] = useState<string | undefined>(undefined);

  const handleGoBack = () => {
    console.log('going back');
  };

  const handleClearAll = () => {
    console.log('clearing all state');
  };

  return (
    <BorderWrap>
      <Inner>
        <TopRow>
          <BackButton onClick={handleGoBack} />
          <Header>
            <HeaderText>Add Liquidity</HeaderText>
          </Header>
          <ClearButton onClick={handleClearAll}>Clear All</ClearButton>
        </TopRow>

        <Grid>
          <HeaderSmall>Select Pair</HeaderSmall>
          <div className="flex justify-between gap-5">
            <AssetSelect asset={base} setAsset={setBase}>
              Select Base
            </AssetSelect>
            <AssetSelect asset={fyToken} setAsset={setFyToken}>
              Select fyToken
            </AssetSelect>
          </div>
        </Grid>

        <Grid>
          <HeaderSmall>Deposit Amounts</HeaderSmall>
          <Deposit symbol="ETH" amount={baseAmount} balance={baseBalance} setAsset={setBase} />
          <Deposit symbol="ETH" amount={fyTokenAmount} balance={fyTokenBalance} setAsset={setFyToken} />
        </Grid>

        <Button action={() => console.log('adding liq')}>Add Liquidity</Button>
      </Inner>
    </BorderWrap>
  );
};

export default AddLiquidity;
