import { ConnectButton } from '@rainbow-me/rainbowkit';

const Account = () => (
  <div className="flex justify-end">
    <ConnectButton accountStatus="full" />
  </div>
);

export default Account;
