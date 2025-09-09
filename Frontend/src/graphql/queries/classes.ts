// src/graphql/classes.ts
import { gql } from "@apollo/client";

export const GET_CLASSES = gql`
  query GetClasses($includeArchived: Boolean = false) {
    classes(includeArchived: $includeArchived) {
      id
      name
      subject
      period
      gradeLevel
      joinCode
      defaultCurrency
      isArchived
      createdAt
      updatedAt
    }
  }
`;

export const GET_CLASS_BY_ID = gql`
  query GetClassById($id: ID!) {
    class(id: $id) {
      id
      name
      subject
      period
      gradeLevel
      joinCode
      schoolName
      district
      payPeriodDefault
      startingBalance
      teacherIds
      defaultCurrency
      isArchived
      students { id name classId balance }
      storeItems { id title price description imageUrl stock perStudentLimit active sort }
      jobs {
        id
        title
        description
        period
        salary { amount unit }
        capacity { current max }
        active
      }
      transactions { id type amount memo createdAt }
      payRequests { id amount reason justification status teacherComment createdAt }
      reasons { id label }
      createdAt
      updatedAt
    }
  }
`;

export const GET_CLASS_BY_SLUG = gql`
  query GetClassBySlug($slug: String!) {
    class(slug: $slug) {
      id
      name
      subject
      period
      gradeLevel
      joinCode
      defaultCurrency
      isArchived
    }
  }
`;
