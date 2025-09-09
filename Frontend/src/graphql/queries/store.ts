import { gql } from "@apollo/client";

export const STORE_ITEMS_BY_CLASS = gql`
  query StoreItemsByClass($classId: ID!) {
    storeItemsByClass(classId: $classId) {
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
`;
