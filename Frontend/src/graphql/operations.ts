import { gql } from "@apollo/client";

export const ME = gql`
  query Me {
    me {
      id
      name
      email
      role
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      accessToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export const REFRESH = gql`
  mutation Refresh {
    refreshAccessToken
  }
`;

export const CLASSES = gql`
  query Classes {
    classes {
      id
      name
      slug
      period
      subject
      defaultCurrency
    }
  }
`;

export const CLASS_BY_ID = gql`
  query Class($id: ID!) {
    class(id: $id) {
      id
      name
      defaultCurrency
      students {
        id
        name
        classId
        balance
      }
      storeItems {
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
      jobs {
        id
        title
        description
        active
      }
      reasons {
        id
        label
      }
      transactions {
        id
        type
        amount
        memo
        createdAt
      }
    }
  }
`;

export const STUDENTS_BY_CLASS = gql`
  query StudentsByClass($classId: ID!) {
    studentsByClass(classId: $classId) {
      id
      name
      classId
      balance
    }
  }
`;

export const ACCOUNT = gql`
  query Account($studentId: ID!, $classId: ID!) {
    account(studentId: $studentId, classId: $classId) {
      id
      studentId
      classId
      balance
    }
  }
`;

export const TRANSACTIONS_BY_ACCOUNT = gql`
  query Txns($accountId: ID!) {
    transactionsByAccount(accountId: $accountId) {
      id
      type
      amount
      memo
      createdAt
    }
  }
`;

export const STORE_ITEMS_BY_CLASS = gql`
  query StoreItems($classId: ID!) {
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

export const PAY_REQUESTS_BY_CLASS = gql`
  query PayRequestsByClass($classId: ID!, $status: PayRequestStatus) {
    payRequestsByClass(classId: $classId, status: $status) {
      id
      amount
      reason
      justification
      status
      student {
        id
        name
      }
      createdAt
    }
  }
`;

export const CREATE_PAY_REQUEST = gql`
  mutation CreatePayRequest($input: CreatePayRequestInput!) {
    createPayRequest(input: $input) {
      id
      status
    }
  }
`;

export const APPROVE_PAY_REQUEST = gql`
  mutation Approve($id: ID!, $comment: String) {
    approvePayRequest(id: $id, comment: $comment) {
      id
      status
      teacherComment
    }
  }
`;

export const SUBMIT_PAY_REQUEST = gql`
  mutation Submit($id: ID!) {
    submitPayRequest(id: $id) {
      id
      status
    }
  }
`;

export const REBUKE_PAY_REQUEST = gql`
  mutation Rebuke($id: ID!, $comment: String!) {
    rebukePayRequest(id: $id, comment: $comment) {
      id
      status
      teacherComment
    }
  }
`;

export const DENY_PAY_REQUEST = gql`
  mutation Deny($id: ID!, $comment: String) {
    denyPayRequest(id: $id, comment: $comment) {
      id
      status
      teacherComment
    }
  }
`;
