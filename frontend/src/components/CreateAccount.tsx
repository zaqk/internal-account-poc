import { useWeb3React } from '@web3-react/core';
import { BigNumber, ethers } from 'ethers';
import { MouseEvent, ReactElement } from 'react';
import styled from 'styled-components';
import { Provider } from '../utils/provider';
import characterInfo from '../deployments/localhost/Character.json'
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

const StyledButton = styled.button`
  width: 150px;
  height: 2.2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;

export function CreateAccount(): ReactElement {
  const context = useWeb3React<Provider>();
  const { account, active, library } = context;

  async function onClick(event: MouseEvent<HTMLButtonElement>): Promise<void> {
    event.preventDefault();

    if (!library || !account) {
      window.alert('Wallet not connected');
      return;
    }

    async function create(
      library: Provider,
      account: string
    ): Promise<void> {

      console.log(`account == ${account}`)

      try {
        
        // get auth msg
        let authMsg;
        let signature;
        await fetch('http://localhost:8000/authMessage', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        .then((response: { json: () => any; }) => response.json())
        .then((data: any) => { 
          authMsg = data
        })

        signature = await library.send(
          'eth_signTypedData_v4',
          [account, JSON.stringify(authMsg)],
        )

        await fetch('http://localhost:8000/createAccount', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({account, signature})
        })
        .then((response: { json: () => any; }) => response.json())
        .then((data: any) => {
          console.log(JSON.stringify(data))
        })



      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    create(library, account);
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
      Create Account
    </StyledButton>
  );
}
