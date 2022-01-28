import { FC } from 'react';
import tw from 'tailwind-styled-components';

const TableWrap = tw.div`flex flex-col py-2 align-middle min-w-full`;
const Table = tw.table`min-w-full divide-y divide-gray-200`;
const TableInner = tw.div;
const THead = tw.thead``;
const TH = tw.th`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center`;
const TR = tw.tr`justify-center`;
const TD = tw.td`px-6 py-4 whitespace-nowrap text-sm align-middle`;
const TBody = tw.tbody`divide-y divide-gray-700`;
const Button = tw.button`w-full bg-primary-500/25 align-middle px-4 py-2 text-primary-500 rounded-md hover:bg-primary-600/25`;

type IClaimTable = {};

const ClaimTable: FC<IClaimTable> = () => {
  return (
    <TableWrap>
      <Table>
        <THead>
          <TR>
            <TH>Token</TH>
            <TH>Amount</TH>
            <TH>Value Now</TH>
            <TH>Value @Maturity</TH>
            <TH>APR</TH>
            <TH>Maturity Date</TH>
            <TH>Claim</TH>
          </TR>
        </THead>
        <TBody>
          <TR>
            <TD>riUSDC</TD>
            <TD>100</TD>
            <TD>100</TD>
            <TD>105</TD>
            <TD>5%</TD>
            <TD>November 2022</TD>
            <TD>
              <Button>Claim</Button>
            </TD>
          </TR>
          <TR>
            <TD>riNice</TD>
            <TD>1000</TD>
            <TD>10000</TD>
            <TD>10100</TD>
            <TD>1%</TD>
            <TD>December 2022</TD>
            <TD>
              <Button disabled>Claimed</Button>
            </TD>
          </TR>
        </TBody>
      </Table>
    </TableWrap>
  );
};

export default ClaimTable;
