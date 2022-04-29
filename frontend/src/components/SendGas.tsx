import { useWeb3React } from '@web3-react/core';
import { MouseEvent, ReactElement, useState } from 'react';
import styled from 'styled-components';
import { Provider } from '../utils/provider';
import characterInfo from '../deployments/localhost/Character.json'
import { ethers } from 'ethers';

const StyledButton = styled.button`
  width: 150px;
  height: 2.2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

export function SendGas(): ReactElement {
  const context = useWeb3React<Provider>();
  const { account, active, library } = context;
  const [internalAccount, setInternalAccount] = useState("");

  function onClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!library || !account) {
      window.alert('Wallet not connected');
      return;
    }

    async function use(
      library: Provider,
      internalAccount: string,
    ): Promise<void> {

      try {

        library.getSigner().sendTransaction({
          to: internalAccount,
          value: ethers.utils.parseEther('0.1').toHexString(),
        })



      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    use(library, internalAccount);
  }

  return (
    <div style={{textAlign: 'center'}}>
      <label>
        Internal Account:
        <input 
          type="string"
          value={internalAccount}
          onChange={e => setInternalAccount(e.target.value)}/>
      </label>
      <StyledButton 
        disabled={!active ? true : false} 
        onClick={onClick}
      >
        Send gas to internal account
      </StyledButton>
    </div>
  );
}