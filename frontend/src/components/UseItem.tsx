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

export function UseItem(): ReactElement {
  const context = useWeb3React<Provider>();
  const { account, active, library } = context;
  const [characterId, setCharacterId] = useState("");
  const [itemId, setItemId] = useState("");

  function onClick(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!library || !account) {
      window.alert('Wallet not connected');
      return;
    }

    async function use(
      account: string,
      characterId: string,
      itemId: string
    ): Promise<void> {

      try {


        await fetch('http://localhost:8000/useItem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({address:account, characterId, itemId})
        })

        const character = new ethers.Contract(
          characterInfo.address,
          characterInfo.abi,
          library
        )

        setTimeout(async () => {
          console.log(`character id: ${characterId}, items used: ${await character.getItemUsageCount(Number.parseInt(characterId))}`)
        }, 1000)

      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
    }

    use(account, characterId, itemId);
  }

  return (
    <div style={{textAlign: 'center'}}>
      <label>
        Character Id:
        <input 
          type="string"
          value={characterId}
          onChange={e => setCharacterId(e.target.value)}/>
      </label>
      <label>
        Item Id:
        <input 
          type="string"
          value={itemId}
          onChange={e => setItemId(e.target.value)}/>
      </label>
      <StyledButton 
        disabled={!active ? true : false} 
        onClick={onClick}
      >
        Use Item on Character
      </StyledButton>
    </div>
    // <StyledButton
    //   disabled={!active ? true : false}
    //   style={{
    //     cursor: !active ? 'not-allowed' : 'pointer',
    //     borderColor: !active ? 'unset' : 'blue'
    //   }}
    //   onClick={onClick}
    // >
    //   Mint Character
    // </StyledButton>
  );
}