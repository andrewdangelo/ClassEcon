import "dotenv/config"
import express from "express"
import cors from "cors"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"
import { typeDefs } from "./schema.js"
import { resolvers } from "./resolvers.js"
import { PrismaClient } from "@prisma/client"

const PORT = Number(process.env.PORT || 4000)
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173"

async function main() {
  const prisma = new PrismaClient()
  const server = new ApolloServer({ typeDefs, resolvers })
  await server.start()

  const app = express()
  app.use(
    "/graphql",
    cors({ origin: ORIGIN, credentials: false }),
    express.json(), 
    expressMiddleware(server, { context: async () => ({ prisma }) })
  )

  app.listen(PORT, () => {
    console.log(`🚀 GraphQL ready at http://localhost:${PORT}/graphql`)
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
