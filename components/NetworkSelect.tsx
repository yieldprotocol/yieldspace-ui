import { CHAINS, URLS } from '../config/chains';

const NetworkSelect = ({ chainId, setChainId }: { chainId: number; setChainId?: (chainId: number) => void }) => (
  <label>
    Chain:{' '}
    <select
      value={`${chainId}`}
      onChange={
        setChainId
          ? (event) => {
              setChainId(Number(event.target.value));
            }
          : undefined
      }
      disabled={!setChainId}
    >
      <option value={-1}>Default</option>
      {Object.keys(URLS).map((_chainId) => (
        <option key={_chainId} value={_chainId}>
          {CHAINS[Number(_chainId)].name}
        </option>
      ))}
    </select>
  </label>
);

export default NetworkSelect;
