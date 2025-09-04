import { gql } from "@apollo/client"

export const CREATE_CLASS = gql`
  mutation CreateClass($input: CreateClassInput!) {
    createClass(input: $input) {
      id
      name
      term
      room
      defaultCurrency
    }
  }
`
