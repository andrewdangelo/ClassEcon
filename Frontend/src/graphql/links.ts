import { ApolloLink, HttpLink, from, split } from "@apollo/client"
import { onError } from "@apollo/client/link/error"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { createClient } from "graphql-ws"
import { getMainDefinition } from "@apollo/client/utilities"

// Reads token from localStorage; change to your auth source when ready
function getToken() {
  return localStorage.getItem("authToken") || ""
}

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_HTTP_URL || "http://localhost:4000/graphql",
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_GRAPHQL_WS_URL || "ws://localhost:4000/graphql",
    connectionParams: () => {
      const token = getToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    },
  })
)

const authLink = new ApolloLink((operation, forward) => {
  const token = getToken()
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }))
  return forward(operation)
})

const errorLink = onError((errorResponse) => {
  console.error('GraphQL Error:', errorResponse)
})

// Split link to send subscriptions to WebSocket and queries/mutations to HTTP
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    )
  },
  wsLink,
  from([errorLink, authLink, httpLink])
)

export const link = splitLink
