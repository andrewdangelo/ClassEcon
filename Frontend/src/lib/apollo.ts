// imports
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { Observable } from "@apollo/client/core"; // <-- add this
import { store } from "../redux/store/store";
import {
  selectAccessToken,
  setAccessToken,
  clearAuth,
} from "../redux/authSlice";

const GRAPHQL_URL =
  import.meta.env.VITE_GRAPHQL_URL || "http://localhost:4000/graphql";

const httpLink = new HttpLink({ uri: GRAPHQL_URL, credentials: "include" });

const authLink = new ApolloLink((operation, forward) => {
  const token = selectAccessToken(store.getState() as any);
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    fetchOptions: { credentials: "include" as const },
  }));
  return forward(operation);
});

const responseLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const sub = forward(operation).subscribe({
      next: (result) => {
        const res: Response | undefined = operation.getContext().response;
        const fresh = res?.headers?.get("x-access-token");
        if (fresh) {
          store.dispatch(setAccessToken(fresh));
        }
        observer.next(result);
      },
      error: (err) => observer.error(err),
      complete: () => observer.complete(),
    });

    // cleanup
    return () => sub.unsubscribe();
  });
});

// REPLACE your old errorLink implementation with this:
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    const isAuthError =
      (graphQLErrors &&
        graphQLErrors.some((e) => /unauthorized|forbidden/i.test(e.message))) ||
      // @ts-ignore
      (networkError &&
        (networkError.statusCode === 401 ||
          (networkError as any).status === 401));

    if (!isAuthError) return;

    // Return an Observable so Apollo can wait for the refresh then retry
    return new Observable((observer) => {
      (async () => {
        try {
          const r = await fetch(GRAPHQL_URL, {
            method: "POST",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ query: "mutation { refreshAccessToken }" }),
          });

          const freshHeader = r.headers.get("x-access-token");
          let token: string | null = null;

          if (freshHeader) {
            token = freshHeader;
          } else {
            const json = await r.json().catch(() => null);
            token = json?.data?.refreshAccessToken ?? null;
          }

          if (token) {
            store.dispatch(setAccessToken(token));
            // set the header for the retried request
            operation.setContext(({ headers = {} }) => ({
              headers: { ...headers, Authorization: `Bearer ${token}` },
              fetchOptions: { credentials: "include" as const },
            }));
          } else {
            store.dispatch(clearAuth());
          }

          // Retry original operation
          const sub = forward(operation).subscribe({
            next: (val) => observer.next(val),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });

          // Cleanup
          return () => sub.unsubscribe();
        } catch (e) {
          store.dispatch(clearAuth());
          observer.error(e);
        }
      })();
    });
  }
);

export function createApolloClient() {
  return new ApolloClient({
    link: from([errorLink, responseLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // Ensure classes and user data are fetched from network first, then cached
            me: {
              merge: true,
            },
            classesByUser: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            myClasses: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            studentsByClass: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            payRequestsByClass: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            payRequestsByStudent: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            storeItemsByClass: {
              merge(existing, incoming) {
                return incoming;
              },
            },
            reasonsByClass: {
              merge(existing, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    // Set default options for better UX on page reloads
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
    },
  });
}
