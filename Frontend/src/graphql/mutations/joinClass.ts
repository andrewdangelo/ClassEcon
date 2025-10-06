import { gql } from "@apollo/client";

export const JOIN_CLASS = gql`
  mutation JoinClass($joinCode: String!) {
    joinClass(joinCode: $joinCode) {
      id
      name
      subject
      period
      gradeLevel
      defaultCurrency
      joinCode
    }
  }
`;
