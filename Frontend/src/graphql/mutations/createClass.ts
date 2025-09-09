// src/graphql/createClass.ts
import { gql } from "@apollo/client";

export const CREATE_CLASS = gql`
  mutation CreateClass($input: CreateClassInput!) {
    createClass(input: $input) {
      id
      name
      subject
      period
      gradeLevel
      joinCode
      defaultCurrency
      students {
        id
        name
        classId
        balance
      }
    }
  }
`;

export const UPDATE_CLASS = gql`
  mutation UpdateClass($id: ID!, $input: UpdateClassInput!) {
    updateClass(id: $id, input: $input) {
      id
      name
      subject
      period
      gradeLevel
      joinCode
      defaultCurrency
      isArchived
      updatedAt
    }
  }
`;

export const ROTATE_JOIN_CODE = gql`
  mutation RotateJoinCode($id: ID!) {
    rotateJoinCode(id: $id) {
      id
      joinCode
    }
  }
`;

export const DELETE_CLASS = gql`
  mutation DeleteClass($id: ID!, $hard: Boolean = false) {
    deleteClass(id: $id, hard: $hard)
  }
`;
