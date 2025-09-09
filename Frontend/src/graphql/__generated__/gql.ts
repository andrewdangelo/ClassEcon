/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation Login($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      accessToken\n      user { id name email role }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      user { id name email role }\n    }\n  }\n": typeof types.SignUpDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  mutation RefreshAccessToken {\n    refreshAccessToken\n  }\n": typeof types.RefreshAccessTokenDocument,
    "\n  mutation CreateClass($input: CreateClassInput!) {\n    createClass(input: $input) {\n      id\n      name\n      period\n      subject\n      defaultCurrency\n    }\n  }\n": typeof types.CreateClassDocument,
    "\n  mutation CreatePayRequest($input: CreatePayRequestInput!) {\n    createPayRequest(input: $input) {\n      id\n      status\n      amount\n      reason\n      justification\n      createdAt\n    }\n  }\n": typeof types.CreatePayRequestDocument,
    "\n  mutation ApprovePayRequest($id: ID!, $comment: String) {\n    approvePayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n": typeof types.ApprovePayRequestDocument,
    "\n  mutation SubmitPayRequest($id: ID!) {\n    submitPayRequest(id: $id) {\n      id\n      status\n    }\n  }\n": typeof types.SubmitPayRequestDocument,
    "\n  mutation RebukePayRequest($id: ID!, $comment: String!) {\n    rebukePayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n": typeof types.RebukePayRequestDocument,
    "\n  mutation DenyPayRequest($id: ID!, $comment: String) {\n    denyPayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n": typeof types.DenyPayRequestDocument,
    "\n  query Account($studentId: ID!, $classId: ID!) {\n    account(studentId: $studentId, classId: $classId) {\n      id\n      studentId\n      classId\n      balance\n    }\n  }\n": typeof types.AccountDocument,
    "\n  query TransactionsByAccount($accountId: ID!) {\n    transactionsByAccount(accountId: $accountId) {\n      id\n      type\n      amount\n      memo\n      createdAt\n    }\n  }\n": typeof types.TransactionsByAccountDocument,
    "\n  query GetClasses {\n    classes {\n      id\n      name\n      period\n      subject\n      defaultCurrency\n    }\n  }\n": typeof types.GetClassesDocument,
    "\n  query GetClassById($id: ID!) {\n    class(id: $id) {\n      id\n      name\n      period\n      subject\n      defaultCurrency\n      students { id name classId balance }\n      storeItems { id title price description imageUrl stock perStudentLimit active sort }\n      jobs { id title description active }\n      transactions { id type amount memo createdAt }\n      payRequests { id amount reason justification status createdAt }\n      reasons { id label }\n    }\n  }\n": typeof types.GetClassByIdDocument,
    "\n  query Me {\n    me {\n      id\n      name\n      email\n      role\n    }\n  }\n": typeof types.MeDocument,
    "\n  query ReasonsByClass($classId: ID!) {\n    reasonsByClass(classId: $classId) {\n      id\n      label\n    }\n  }\n": typeof types.ReasonsByClassDocument,
    "\n  query PayRequestsByStudent($classId: ID!, $studentId: ID!) {\n    payRequestsByStudent(classId: $classId, studentId: $studentId) {\n      id\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n": typeof types.PayRequestsByStudentDocument,
    "\n  query PayRequestsByClass($classId: ID!, $status: PayRequestStatus) {\n    payRequestsByClass(classId: $classId, status: $status) {\n      id\n      student { id name }\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n": typeof types.PayRequestsByClassDocument,
    "\n  query StudentsByClass($classId: ID!) {\n    studentsByClass(classId: $classId) {\n      id\n      name\n      classId\n      balance\n    }\n  }\n": typeof types.StudentsByClassDocument,
};
const documents: Documents = {
    "\n  mutation Login($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      accessToken\n      user { id name email role }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      user { id name email role }\n    }\n  }\n": types.SignUpDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  mutation RefreshAccessToken {\n    refreshAccessToken\n  }\n": types.RefreshAccessTokenDocument,
    "\n  mutation CreateClass($input: CreateClassInput!) {\n    createClass(input: $input) {\n      id\n      name\n      period\n      subject\n      defaultCurrency\n    }\n  }\n": types.CreateClassDocument,
    "\n  mutation CreatePayRequest($input: CreatePayRequestInput!) {\n    createPayRequest(input: $input) {\n      id\n      status\n      amount\n      reason\n      justification\n      createdAt\n    }\n  }\n": types.CreatePayRequestDocument,
    "\n  mutation ApprovePayRequest($id: ID!, $comment: String) {\n    approvePayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n": types.ApprovePayRequestDocument,
    "\n  mutation SubmitPayRequest($id: ID!) {\n    submitPayRequest(id: $id) {\n      id\n      status\n    }\n  }\n": types.SubmitPayRequestDocument,
    "\n  mutation RebukePayRequest($id: ID!, $comment: String!) {\n    rebukePayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n": types.RebukePayRequestDocument,
    "\n  mutation DenyPayRequest($id: ID!, $comment: String) {\n    denyPayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n": types.DenyPayRequestDocument,
    "\n  query Account($studentId: ID!, $classId: ID!) {\n    account(studentId: $studentId, classId: $classId) {\n      id\n      studentId\n      classId\n      balance\n    }\n  }\n": types.AccountDocument,
    "\n  query TransactionsByAccount($accountId: ID!) {\n    transactionsByAccount(accountId: $accountId) {\n      id\n      type\n      amount\n      memo\n      createdAt\n    }\n  }\n": types.TransactionsByAccountDocument,
    "\n  query GetClasses {\n    classes {\n      id\n      name\n      period\n      subject\n      defaultCurrency\n    }\n  }\n": types.GetClassesDocument,
    "\n  query GetClassById($id: ID!) {\n    class(id: $id) {\n      id\n      name\n      period\n      subject\n      defaultCurrency\n      students { id name classId balance }\n      storeItems { id title price description imageUrl stock perStudentLimit active sort }\n      jobs { id title description active }\n      transactions { id type amount memo createdAt }\n      payRequests { id amount reason justification status createdAt }\n      reasons { id label }\n    }\n  }\n": types.GetClassByIdDocument,
    "\n  query Me {\n    me {\n      id\n      name\n      email\n      role\n    }\n  }\n": types.MeDocument,
    "\n  query ReasonsByClass($classId: ID!) {\n    reasonsByClass(classId: $classId) {\n      id\n      label\n    }\n  }\n": types.ReasonsByClassDocument,
    "\n  query PayRequestsByStudent($classId: ID!, $studentId: ID!) {\n    payRequestsByStudent(classId: $classId, studentId: $studentId) {\n      id\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n": types.PayRequestsByStudentDocument,
    "\n  query PayRequestsByClass($classId: ID!, $status: PayRequestStatus) {\n    payRequestsByClass(classId: $classId, status: $status) {\n      id\n      student { id name }\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n": types.PayRequestsByClassDocument,
    "\n  query StudentsByClass($classId: ID!) {\n    studentsByClass(classId: $classId) {\n      id\n      name\n      classId\n      balance\n    }\n  }\n": types.StudentsByClassDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      accessToken\n      user { id name email role }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      accessToken\n      user { id name email role }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      user { id name email role }\n    }\n  }\n"): (typeof documents)["\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      user { id name email role }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RefreshAccessToken {\n    refreshAccessToken\n  }\n"): (typeof documents)["\n  mutation RefreshAccessToken {\n    refreshAccessToken\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateClass($input: CreateClassInput!) {\n    createClass(input: $input) {\n      id\n      name\n      period\n      subject\n      defaultCurrency\n    }\n  }\n"): (typeof documents)["\n  mutation CreateClass($input: CreateClassInput!) {\n    createClass(input: $input) {\n      id\n      name\n      period\n      subject\n      defaultCurrency\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreatePayRequest($input: CreatePayRequestInput!) {\n    createPayRequest(input: $input) {\n      id\n      status\n      amount\n      reason\n      justification\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreatePayRequest($input: CreatePayRequestInput!) {\n    createPayRequest(input: $input) {\n      id\n      status\n      amount\n      reason\n      justification\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ApprovePayRequest($id: ID!, $comment: String) {\n    approvePayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n"): (typeof documents)["\n  mutation ApprovePayRequest($id: ID!, $comment: String) {\n    approvePayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitPayRequest($id: ID!) {\n    submitPayRequest(id: $id) {\n      id\n      status\n    }\n  }\n"): (typeof documents)["\n  mutation SubmitPayRequest($id: ID!) {\n    submitPayRequest(id: $id) {\n      id\n      status\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RebukePayRequest($id: ID!, $comment: String!) {\n    rebukePayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n"): (typeof documents)["\n  mutation RebukePayRequest($id: ID!, $comment: String!) {\n    rebukePayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DenyPayRequest($id: ID!, $comment: String) {\n    denyPayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n"): (typeof documents)["\n  mutation DenyPayRequest($id: ID!, $comment: String) {\n    denyPayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Account($studentId: ID!, $classId: ID!) {\n    account(studentId: $studentId, classId: $classId) {\n      id\n      studentId\n      classId\n      balance\n    }\n  }\n"): (typeof documents)["\n  query Account($studentId: ID!, $classId: ID!) {\n    account(studentId: $studentId, classId: $classId) {\n      id\n      studentId\n      classId\n      balance\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TransactionsByAccount($accountId: ID!) {\n    transactionsByAccount(accountId: $accountId) {\n      id\n      type\n      amount\n      memo\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query TransactionsByAccount($accountId: ID!) {\n    transactionsByAccount(accountId: $accountId) {\n      id\n      type\n      amount\n      memo\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetClasses {\n    classes {\n      id\n      name\n      period\n      subject\n      defaultCurrency\n    }\n  }\n"): (typeof documents)["\n  query GetClasses {\n    classes {\n      id\n      name\n      period\n      subject\n      defaultCurrency\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetClassById($id: ID!) {\n    class(id: $id) {\n      id\n      name\n      period\n      subject\n      defaultCurrency\n      students { id name classId balance }\n      storeItems { id title price description imageUrl stock perStudentLimit active sort }\n      jobs { id title description active }\n      transactions { id type amount memo createdAt }\n      payRequests { id amount reason justification status createdAt }\n      reasons { id label }\n    }\n  }\n"): (typeof documents)["\n  query GetClassById($id: ID!) {\n    class(id: $id) {\n      id\n      name\n      period\n      subject\n      defaultCurrency\n      students { id name classId balance }\n      storeItems { id title price description imageUrl stock perStudentLimit active sort }\n      jobs { id title description active }\n      transactions { id type amount memo createdAt }\n      payRequests { id amount reason justification status createdAt }\n      reasons { id label }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      id\n      name\n      email\n      role\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      name\n      email\n      role\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ReasonsByClass($classId: ID!) {\n    reasonsByClass(classId: $classId) {\n      id\n      label\n    }\n  }\n"): (typeof documents)["\n  query ReasonsByClass($classId: ID!) {\n    reasonsByClass(classId: $classId) {\n      id\n      label\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PayRequestsByStudent($classId: ID!, $studentId: ID!) {\n    payRequestsByStudent(classId: $classId, studentId: $studentId) {\n      id\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query PayRequestsByStudent($classId: ID!, $studentId: ID!) {\n    payRequestsByStudent(classId: $classId, studentId: $studentId) {\n      id\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PayRequestsByClass($classId: ID!, $status: PayRequestStatus) {\n    payRequestsByClass(classId: $classId, status: $status) {\n      id\n      student { id name }\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query PayRequestsByClass($classId: ID!, $status: PayRequestStatus) {\n    payRequestsByClass(classId: $classId, status: $status) {\n      id\n      student { id name }\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query StudentsByClass($classId: ID!) {\n    studentsByClass(classId: $classId) {\n      id\n      name\n      classId\n      balance\n    }\n  }\n"): (typeof documents)["\n  query StudentsByClass($classId: ID!) {\n    studentsByClass(classId: $classId) {\n      id\n      name\n      classId\n      balance\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;