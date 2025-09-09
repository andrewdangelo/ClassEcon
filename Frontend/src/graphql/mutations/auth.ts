import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      user { id name email role }
    }
  }
`;

export const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      accessToken
      user { id name email role }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export const REFRESH_ACCESS_TOKEN = gql`
  mutation RefreshAccessToken {
    refreshAccessToken
  }
`;
