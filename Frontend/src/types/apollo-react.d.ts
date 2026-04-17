declare module '@apollo/client/react' {
  import type * as React from 'react';
  import type { DocumentNode } from 'graphql';
  import type {
    ApolloClient,
    NormalizedCacheObject,
    MutationHookOptions,
    MutationTuple,
    OperationVariables,
    QueryHookOptions,
    QueryResult,
    SubscriptionHookOptions,
    SubscriptionResult,
  } from '@apollo/client';

  export function useQuery<
    TData = any,
    TVariables extends OperationVariables = OperationVariables
  >(
    query: DocumentNode,
    options?: QueryHookOptions<TData, TVariables>
  ): QueryResult<TData, TVariables>;

  export function useMutation<
    TData = any,
    TVariables extends OperationVariables = OperationVariables
  >(
    mutation: DocumentNode,
    options?: MutationHookOptions<TData, TVariables>
  ): MutationTuple<TData, TVariables>;

  export function useSubscription<
    TData = any,
    TVariables extends OperationVariables = OperationVariables
  >(
    subscription: DocumentNode,
    options?: SubscriptionHookOptions<TData, TVariables>
  ): SubscriptionResult<TData>;

  export const ApolloProvider: React.ComponentType<{
    client: ApolloClient<NormalizedCacheObject>;
    children?: React.ReactNode;
  }>;
}
