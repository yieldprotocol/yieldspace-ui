import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import tw from 'tailwind-styled-components';
import useConnector from '../../hooks/useConnector';
import useContracts from '../../hooks/protocol/useContracts';
import { getPools } from '../../lib/protocol';
import AssetSelect from '../common/AssetSelect';
import BackButton from '../common/BackButton';
import Button from '../common/Button';
import Deposit from '../pool/Deposit';
import { ArrowCircleDownIcon, ArrowCircleUpIcon, ArrowDownIcon, ArrowUpIcon, PlusIcon } from '@heroicons/react/solid';
import Toggle from '../common/Toggle';

const BorderWrap = tw.div`mx-auto max-w-md p-2 border-2 border-secondary-400 shadow-sm rounded-lg bg-gray-800`;
const Inner = tw.div`m-4 text-center`;
const Header = tw.div`text-lg font-bold justify-items-start align-middle`;
const HeaderText = tw.span`align-middle`;
const HeaderSmall = tw.div`align-middle text-sm font-bold justify-start text-left`;

const Grid = tw.div`grid my-5 auto-rows-auto gap-2`;
const TopRow = tw.div`flex justify-between align-middle text-center items-center`;
const ClearButton = tw.button`text-sm`;

const Swap = () => {
  const router = useRouter();
  const { provider, chainId } = useConnector();
  const contracts = useContracts(provider, chainId);

  const [useFyTokenBalance, toggleUseFyTokenBalance] = useState<boolean>(false);
  const [isFyTokenOutput, setIsFyTokenOutput] = useState<boolean>(true);

  const INITIAL_FORM_STATE = {
    baseAmount: null,
    fyTokenAmount: null,
  };

  const [base, setBase] = useState<string | null>(INITIAL_FORM_STATE.baseAmount);
  const [fyToken, setFyToken] = useState<string | null>(INITIAL_FORM_STATE.fyTokenAmount);

  const [baseAmount, setBaseAmount] = useState<string | undefined>(undefined);
  const [fyTokenAmount, setFyTokenAmount] = useState<string | undefined>(undefined);

  // balances
  const [baseBalance, setBaseBalance] = useState<string | undefined>(undefined);
  const [fyTokenBalance, setFyTokenBalance] = useState<string | undefined>(undefined);

  const handleClearAll = () => {
    console.log('clearing state');
  };

  useEffect(() => {
    const _getBalance = (asset: string) => '0';

    setBaseBalance(_getBalance(base));
    setFyTokenBalance(_getBalance(fyToken));
  }, [base, fyToken]);

  useEffect(() => {
    (async () => {
      if (provider && contracts) {
        const pools = await getPools(provider, contracts);
      }
    })();
  }, [provider, contracts]);

  return (
    <BorderWrap>
      <Inner>
        <TopRow>
          <Header>
            <HeaderText>Trade</HeaderText>
          </Header>
          <ClearButton onClick={handleClearAll}>Clear All</ClearButton>
        </TopRow>

        <Grid>
          <div className="flex justify-between gap-5 align-middle">
            <AssetSelect asset={base} setAsset={setBase} hasCaret={true} />
            {/* <AssetSelect asset={fyToken} setAsset={setFyToken} hasCaret={true} /> */}
          </div>
        </Grid>

        <Grid>
          <Deposit
            amount={baseAmount}
            balance={baseBalance}
            setAsset={setBase}
            asset={base}
            setAmount={setBaseAmount}
          />
          {isFyTokenOutput ? (
            <ArrowCircleDownIcon
              className="justify-self-center text-gray-400 hover:border-2 hover:border-secondary-500 rounded-full hover:cursor-pointer"
              height={25}
              width={25}
              onClick={() => setIsFyTokenOutput(!isFyTokenOutput)}
            />
          ) : (
            <ArrowCircleUpIcon
              className="justify-self-center text-gray-400 hover:border-2 hover:border-secondary-500 rounded-full hover:cursor-pointer"
              height={25}
              width={25}
              onClick={() => setIsFyTokenOutput(!isFyTokenOutput)}
            />
          )}
          <Deposit
            amount={fyTokenAmount}
            balance={fyTokenBalance}
            setAsset={setFyToken}
            asset={fyToken}
            setAmount={setFyTokenAmount}
          />
        </Grid>
        <div className="py-1">
          <div className="my-2 h-20 flex items-center text-lg border-2 border-gray-700 rounded-md">
            <span className="mx-auto">some data once the inputs are selected</span>
          </div>
        </div>
        <Button action={() => console.log('trading')}>Trade</Button>
      </Inner>
    </BorderWrap>
  );
};

export default Swap;
