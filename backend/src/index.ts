import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import {toChecksumAddress, Address} from 'ethereumjs-util'
import {recoverTypedSignature_v4} from 'eth-sig-util'
import express from 'express'
import cors from 'cors'
import { ethers } from 'ethers'

const prisma = new PrismaClient()
const app = express()

const corsOptions = () => cors({
  origin: 'http://localhost:3000', // frontend
});

app.use(corsOptions());
app.options('*', corsOptions());

app.use(express.json())

app.get('/authMessage', async (req, res) => {
  console.log('called')
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
    const rawInternalPk = crypto.randomBytes(32)
    const internalPk = '0x' + rawInternalPk.toString('hex')
    
    // generate internal address from pk
    const internalAddress = toChecksumAddress(
      Address.fromPrivateKey(rawInternalPk).toString()
    )

    await prisma.account.create({
      data: {
        externalAddress,
        internalAddress,
        internalPk,
      }
    })

    // TODO save address to contracts

    res.json( {internalAddress} )
    return

  } catch (err) {
    console.error(err);
    res.status(500).send(err)
    return
  }

})

// TODO this endpoint would need account based auth
app.post('/useItems', async (req, res) => {
  const {characterId, itemId, address} = req.body;

  console.log(`characterId === ${characterId}, itemId === ${itemId}, address == ${address}`)

  // TODO load Logic contract using address and abi
  // call useItem and pass







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

// app.post(`/signup`, async (req, res) => {
//   const { name, email, posts } = req.body

//   const postData = posts?.map((post: Prisma.PostCreateInput) => {
//     return { title: post?.title, content: post?.content }
//   })

//   const result = await prisma.user.create({
//     data: {
//       name,
//       email,
//       posts: {
//         create: postData,
//       },
//     },
//   })
//   res.json(result)
// })

// app.post(`/post`, async (req, res) => {
//   const { title, content, authorEmail } = req.body
//   const result = await prisma.post.create({
//     data: {
//       title,
//       content,
//       author: { connect: { email: authorEmail } },
//     },
//   })
//   res.json(result)
// })

// app.put('/post/:id/views', async (req, res) => {
//   const { id } = req.params

//   try {
//     const post = await prisma.post.update({
//       where: { id: Number(id) },
//       data: {
//         viewCount: {
//           increment: 1,
//         },
//       },
//     })

//     res.json(post)
//   } catch (error) {
//     res.json({ error: `Post with ID ${id} does not exist in the database` })
//   }
// })

// app.put('/publish/:id', async (req, res) => {
//   const { id } = req.params

//   try {
//     const postData = await prisma.post.findUnique({
//       where: { id: Number(id) },
//       select: {
//         published: true,
//       },
//     })

//     const updatedPost = await prisma.post.update({
//       where: { id: Number(id) || undefined },
//       data: { published: !postData?.published },
//     })
//     res.json(updatedPost)
//   } catch (error) {
//     res.json({ error: `Post with ID ${id} does not exist in the database` })
//   }
// })

// app.delete(`/post/:id`, async (req, res) => {
//   const { id } = req.params
//   const post = await prisma.post.delete({
//     where: {
//       id: Number(id),
//     },
//   })
//   res.json(post)
// })

// app.get('/users', async (req, res) => {
//   const users = await prisma.user.findMany()
//   res.json(users)
// })

// app.get('/user/:id/drafts', async (req, res) => {
//   const { id } = req.params

//   const drafts = await prisma.user
//     .findUnique({
//       where: {
//         id: Number(id),
//       },
//     })
//     .posts({
//       where: { published: false },
//     })

//   res.json(drafts)
// })

// app.get(`/post/:id`, async (req, res) => {
//   const { id }: { id?: string } = req.params

//   const post = await prisma.post.findUnique({
//     where: { id: Number(id) },
//   })
//   res.json(post)
// })

// app.get('/feed', async (req, res) => {
//   const { searchString, skip, take, orderBy } = req.query

//   const or: Prisma.PostWhereInput = searchString
//     ? {
//         OR: [
//           { title: { contains: searchString as string } },
//           { content: { contains: searchString as string } },
//         ],
//       }
//     : {}

//   const posts = await prisma.post.findMany({
//     where: {
//       published: true,
//       ...or,
//     },
//     include: { author: true },
//     take: Number(take) || undefined,
//     skip: Number(skip) || undefined,
//     orderBy: {
//       updatedAt: orderBy as Prisma.SortOrder,
//     },
//   })

//   res.json(posts)
// })

app.listen(8000, () =>
  console.log("🚀 Server ready at: http://localhost:8000"),
)

process.on('SIGINT', function() {
  console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" )
  // some other closing procedures go here
  process.exit()
});