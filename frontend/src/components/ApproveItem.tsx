import { useWeb3React } from '@web3-react/core';
import { FormEvent, MouseEvent, ReactElement, useState } from 'react';
import styled from 'styled-components';
import { Provider } from '../utils/provider';
import itemInfo from '../deployments/localhost/Item.json'
import { ethers } from 'ethers';

const StyledButton = styled.button`
  width: 150px;
  height: 2.2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

export function ApproveItem(): ReactElement {
  const context = useWeb3React<Provider>();
  const { account, active, library } = context;
  const [itemId, setItemId] = useState("");
  const [internalAccount, setInternalAccount] = useState("");

  function onClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!library || !account) {
      window.alert('Wallet not connected');
      return;
    }

    async function approveItem(
      library: Provider,
      internalAccount:string,
    ): Promise<void> {

      try {
        const item = new ethers.Contract(itemInfo.address, itemInfo.abi)
        const tx = await item.connect(library.getSigner()).setApprovalForAll(internalAccount, true);
        const rc = await tx.wait()
        const event = rc.events?.find(
          (event: { event: string; }) => event.event === 'ApprovalForAll'
        );
        event ? console.log('item approved') : console.log('item approved failed')

      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    approveItem(library, internalAccount);
  }

  return (
    <div style={{textAlign: 'center'}}>
      <label>
        Internal Acccount:
        <input 
          type="string"
          value={internalAccount}
          onChange={e => setInternalAccount(e.target.value)}/>
      </label>
      <StyledButton
       disabled={!active ? true : false}
       style={{
         cursor: !active ? 'not-allowed' : 'pointer',
         borderColor: !active ? 'unset' : 'blue'
       }}
       onClick={onClick}
     >
       Approve Items for internal account
    </StyledButton>
    </div>

  );
}