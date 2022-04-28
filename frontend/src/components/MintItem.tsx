import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers';
import { MouseEvent, ReactElement } from 'react';
import styled from 'styled-components';
import { Provider } from '../utils/provider';
import itemInfo from '../deployments/localhost/Item.json'

const StyledButton = styled.button`
  width: 150px;
  height: 2.2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

export function MintItem(): ReactElement {
  const context = useWeb3React<Provider>();
  const { account, active, library } = context;

  function onClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!library || !account) {
      window.alert('Wallet not connected');
      return;
    }

    async function approve(
      library: Provider,
    ): Promise<void> {

      try {

        const item = new ethers.Contract(
          itemInfo.address, 
          itemInfo.abi,
          library.getSigner()
        );

        const tx = await item.mint();
        const rc = await tx.wait();
        const event: {args: {id: BigNumber} } = rc.events.find((event: { event: string; }) => event.event === 'Transfer');
        const { id } = event.args;

        console.log(`minted new item NFT: ${id.toString()}`)

      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    approve(library);
  }

  return (
    <StyledButton
      disabled={!active ? true : false}
      style={{
        cursor: !active ? 'not-allowed' : 'pointer',
        borderColor: !active ? 'unset' : 'blue'
      }}
      onClick={onClick}
    >
      Mint Item
    </StyledButton>
  );
}