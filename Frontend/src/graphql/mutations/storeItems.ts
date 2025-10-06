import { gql } from "@apollo/client"

export const CREATE_STORE_ITEM = gql`
  mutation CreateStoreItem($input: CreateStoreItemInput!) {
    createStoreItem(input: $input) {
      id
      title
      price
      description
      imageUrl
      stock
      perStudentLimit
      active
      sort
    }
  }
`

export const UPDATE_STORE_ITEM = gql`
  mutation UpdateStoreItem($id: ID!, $input: UpdateStoreItemInput!) {
    updateStoreItem(id: $id, input: $input) {
      id
      title
      price
      description
      imageUrl
      stock
      perStudentLimit
      active
      sort
    }
  }
`

export const DELETE_STORE_ITEM = gql`
  mutation DeleteStoreItem($id: ID!) {
    deleteStoreItem(id: $id)
  }
`

export const MAKE_PURCHASE = gql`
  mutation MakePurchase($input: MakePurchaseInput!) {
    makePurchase(input: $input) {
      id
      quantity
      unitPrice
      total
      createdAt
    }
  }
`
