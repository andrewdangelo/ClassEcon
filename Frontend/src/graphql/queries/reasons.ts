// src/graphql/reasons.ts
import { gql } from "@apollo/client";

export const REASONS_BY_CLASS = gql`
  query ReasonsByClass($classId: ID!) {
    reasonsByClass(classId: $classId) {
      id
      label
    }
  }
`;

export const ADD_REASONS = gql`
  mutation AddReasons($classId: ID!, $labels: [String!]!) {
    addReasons(classId: $classId, labels: $labels) {
      id
      label
    }
  }
`;

export const SET_REASONS = gql`
  mutation SetReasons($classId: ID!, $labels: [String!]!) {
    setReasons(classId: $classId, labels: $labels) {
      id
      label
    }
  }
`;
