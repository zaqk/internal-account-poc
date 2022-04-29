import { ReactElement } from 'react';
import styled from 'styled-components';
import { ActivateDeactivate } from './components/ActivateDeactivate';
import { SectionDivider } from './components/SectionDivider';
import { WalletStatus } from './components/WalletStatus';

import { MintItem } from './components/MintItem';
import { MintCharacter } from './components/MintCharacter';
import { CreateAccount } from './components/CreateAccount';
import { UseItem } from './components/UseItem';
import { ApproveItem } from './components/ApproveItem';
import { SendGas } from './components/SendGas';

const StyledAppDiv = styled.div`
  display: grid;
  grid-gap: 20px;
`;

export function App(): ReactElement {
  return (
    <StyledAppDiv>
      <ActivateDeactivate />
      <SectionDivider />
      <WalletStatus />
      <SectionDivider />
      <MintCharacter />
      <SectionDivider />
      <MintItem />
      <SectionDivider />
      <CreateAccount />
      <SectionDivider />
      <ApproveItem />
      <SectionDivider />
      <SendGas />
      <SectionDivider />
      <UseItem />
    </StyledAppDiv>
  );
}

/*
- first mint character
- then mint item
- then create account
- then approve the created account?
- then click a button that burns (consumes) the item w/o a metamask confirmation modal
*/
