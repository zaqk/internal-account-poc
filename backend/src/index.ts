import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import {toChecksumAddress, Address} from 'ethereumjs-util'
import {recoverTypedSignature_v4} from 'eth-sig-util'
import express from 'express'
import cors from 'cors'
import { ethers } from 'ethers'
import logicInfo from './deployments/localhost/Logic.json'
import accountManagerInfo from './deployments/localhost/AccountManager.json'
import itemInfo from './deployments/localhost/Item.json'

const prisma = new PrismaClient()
const app = express()

const provider = new ethers.providers.JsonRpcProvider()

const corsOptions = () => cors({
  origin: 'http://localhost:3000', // frontend
});

app.use(corsOptions());
app.options('*', corsOptions());

app.use(express.json())

app.get('/authMessage', async (req, res) => {
  res.json(authMsg)
})

app.post('/createAccount', async (req, res) => {
  const {account, signature} = req.body
  const externalAddress = toChecksumAddress(account)
  
  // ensure post was sent correctly
  try {
    if (!isValidSignature(externalAddress, signature)) throw new Error('Bad sig')
  
    const account = await prisma.account.findUnique({
      where: {
        externalAddress,
      }
    })
  
    if (account) throw new Error('Account alread exists')

  } catch (err) {
    console.error(err);
    res.status(400).send(err)
    return
  }

  
  // generate new account and save to db
  try {
    // generate private key
    const internalWallet = (ethers.Wallet.createRandom()).connect(provider);
    
    // generate internal address from pk
    const internalAddress = toChecksumAddress(internalWallet.address)

    // save new account data to db
    await prisma.account.create({
      data: {
        externalAddress,
        internalAddress,
        internalPk: internalWallet.privateKey,
      }
    })

    // write new internal address w/ internal account to AccountManager contract
    const adminAccount = ethers.Wallet.fromMnemonic(
      process.env.MNEMONIC || ''
    ).connect(provider)


    const accountManager = new ethers.Contract(
      accountManagerInfo.address, 
      accountManagerInfo.abi
    )
    await accountManager.connect(adminAccount).updateAccount(internalAddress, externalAddress);

    res.json( {externalAddress, internalAddress} )
    return

  } catch (err) {
    console.error(err);
    res.status(500).send(err)
    return
  }

})

// TODO this endpoint would need account based auth
app.post('/useItem', async (req, res) => {
  const {characterId, itemId, address} = req.body;
  let account;
  
  try {
    account = await prisma.account.findUnique({
      where: {externalAddress: toChecksumAddress(address)}
    });
  
    if (!account) throw new Error('Internal account not found')

  } catch (err) {
    console.error(err);
    res.status(400).send()
    return
  }

  try {  
    const logicContract = new ethers.Contract(logicInfo.address, logicInfo.abi)
    const signer = new ethers.Wallet(account.internalPk).connect(provider);
    await logicContract.connect(signer).useItem(characterId, itemId)

    console.log('success used item')

    res.json({ success: true })
    return

  } catch (err) {
    console.log(err);
    res.status(500).send()
    return
  }

})

const isValidSignature = (address: string, signature: string) => {
  
  const recovered = recoverTypedSignature_v4({
    data: authMsg,
    sig: signature,
  })

  return address == toChecksumAddress(recovered)
}


// this is not secure. we'd need to pass a nonce or something. 
// this is just for a proof of concept.
const authMsg: any = {
  domain: {
    chainId: 31337,
    name: 'POC',
    version: 'alpha',
  },
  message: {
    content: 'Sign this message to prove you '
      + 'have access to this wallet and we’ll log you in. '
      + 'This won’t cost you any Ether.',
    nonce: 0,
  },
  primaryType: 'Nonce',
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
    ],
    Nonce: [{ name: 'nonce', type: 'uint256' }],
  },
}

app.listen(8000, () =>
  console.log("🚀 Server ready at: http://localhost:8000"),
)

process.on('SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" )
  // some other closing procedures go here
  process.exit()
});