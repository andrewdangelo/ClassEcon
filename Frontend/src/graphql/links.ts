import { ApolloLink, HttpLink, from } from "@apollo/client"
import { onError } from "@apollo/client/link/error"

// Reads token from localStorage; change to your auth source when ready
function getToken() {
  return localStorage.getItem("authToken") || ""
}

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_HTTP_URL || "http://localhost:4000/graphql",
})

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

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors?.length) {
    for (const e of graphQLErrors) {
      console.error(`[GraphQL error] (${operation.operationName})`, e)
    }
  }
  if (networkError) {
    console.error(`[Network error] (${operation.operationName})`, networkError)
  }
})

// If you want subscriptions later, create a split link here with graphql-ws.
// export const wsLink = new GraphQLWsLink(createClient({ url: import.meta.env.VITE_GRAPHQL_WS_URL }))

export const link = from([errorLink, authLink, httpLink])
