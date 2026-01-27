import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  ApolloLink,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql'

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
  accessToken = token
  if (token) {
    localStorage.setItem('admin_access_token', token)
  } else {
    localStorage.removeItem('admin_access_token')
  }
}

export const getAccessToken = () => {
  if (!accessToken) {
    accessToken = localStorage.getItem('admin_access_token')
  }
  return accessToken
}

export const clearTokens = () => {
  accessToken = null
  localStorage.removeItem('admin_access_token')
}

const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: 'include',
})

const authLink = new ApolloLink((operation, forward) => {
  const token = getAccessToken()
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    fetchOptions: { credentials: 'include' as const },
  }))
  return forward(operation)
})

const responseLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((response) => {
    const context = operation.getContext()
    const res = context.response as Response | undefined
    const freshToken = res?.headers?.get('x-access-token')
    if (freshToken) {
      setAccessToken(freshToken)
    }
    return response
  })
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      console.error(`[GraphQL error]: Message: ${err.message}`)
      if (err.message.toLowerCase().includes('unauthorized') || 
          err.message.toLowerCase().includes('forbidden')) {
        // Could trigger re-auth here
      }
    }
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, responseLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          classes: {
            merge(existing, incoming) {
              return incoming
            },
          },
          students: {
            merge(existing, incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})
