import { gql } from "@apollo/client"

export const REASONS_BY_CLASS = gql`
  query ReasonsByClass($classId: ID!) {
    reasonsByClass(classId: $classId) {
      id
      label
    }
  }
`
