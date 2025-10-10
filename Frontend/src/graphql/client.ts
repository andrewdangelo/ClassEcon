import { ApolloClient, InMemoryCache } from "@apollo/client"
import { link } from "./links"

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache({
    typePolicies: {
      Class: {
        keyFields: ["id"],
      },
      Student: {
        keyFields: ["id"],
      },
      PayRequest: {
        keyFields: ["id"],
      },
      // Fix for notification modal empty issue - ensures notifications are properly cached
      Notification: {
        keyFields: ["id"],
      },
      Query: {
        fields: {
          // example cursor-less merge policy for simple lists you may add
          classes: {
            merge(_existing, incoming) {
              return incoming
            },
          },
          // Fix for notification modal empty issue - ensures notification list updates properly
          notifications: {
            merge(_existing, incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
})
