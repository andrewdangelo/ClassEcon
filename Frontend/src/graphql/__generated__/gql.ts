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
    "\n  fragment UserCore on User {\n    id\n    name\n    email\n    role\n    status\n    createdAt\n    updatedAt\n  }\n": typeof types.UserCoreFragmentDoc,
    "\n  fragment ClassCore on Class {\n    id\n    classroomId\n    slug\n    name\n    subject\n    period\n    gradeLevel\n    joinCode\n    schoolName\n    district\n    payPeriodDefault\n    startingBalance\n    teacherIds\n    defaultCurrency\n    isArchived\n    createdAt\n    updatedAt\n  }\n": typeof types.ClassCoreFragmentDoc,
    "\n  fragment StudentDtoCore on Student {\n    id\n    name\n    balance\n    classId\n  }\n": typeof types.StudentDtoCoreFragmentDoc,
    "\n  fragment StoreItemCore on StoreItem {\n    id\n    classId\n    title\n    price\n    description\n    imageUrl\n    stock\n    perStudentLimit\n    active\n    sort\n    createdAt\n    updatedAt\n  }\n": typeof types.StoreItemCoreFragmentDoc,
    "\n  fragment JobCore on Job {\n    id\n    classId\n    title\n    description\n    period\n    salary { amount unit }\n    schedule { weekday dayOfMonth anchorDate }\n    capacity { current max }\n    active\n    createdAt\n    updatedAt\n  }\n": typeof types.JobCoreFragmentDoc,
    "\n  fragment TransactionCore on Transaction {\n    id\n    accountId\n    toAccountId\n    classId\n    classroomId\n    type\n    amount\n    memo\n    createdByUserId\n    idempotencyKey\n    createdAt\n    updatedAt\n  }\n": typeof types.TransactionCoreFragmentDoc,
    "\n  fragment AccountWithBalance on Account {\n    id\n    studentId\n    classId\n    classroomId\n    balance\n    createdAt\n    updatedAt\n  }\n": typeof types.AccountWithBalanceFragmentDoc,
    "\n  fragment PayRequestCore on PayRequest {\n    id\n    classId\n    studentId\n    amount\n    reason\n    justification\n    status\n    teacherComment\n    createdAt\n    updatedAt\n  }\n": typeof types.PayRequestCoreFragmentDoc,
    "\n  fragment ClassReasonCore on ClassReason {\n    id\n    label\n    classId\n    createdAt\n    updatedAt\n  }\n": typeof types.ClassReasonCoreFragmentDoc,
    "\n  mutation Login($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      accessToken\n      user { id name email role }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      user { id name email role }\n    }\n  }\n": typeof types.SignUpDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  mutation RefreshAccessToken {\n    refreshAccessToken\n  }\n": typeof types.RefreshAccessTokenDocument,
    "\n  mutation CreateClass($input: CreateClassInput!) {\n    createClass(input: $input) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      students {\n        id\n        name\n        classId\n        balance\n      }\n    }\n  }\n": typeof types.CreateClassDocument,
    "\n  mutation UpdateClass($id: ID!, $input: UpdateClassInput!) {\n    updateClass(id: $id, input: $input) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      isArchived\n      updatedAt\n    }\n  }\n": typeof types.UpdateClassDocument,
    "\n  mutation RotateJoinCode($id: ID!) {\n    rotateJoinCode(id: $id) {\n      id\n      joinCode\n    }\n  }\n": typeof types.RotateJoinCodeDocument,
    "\n  mutation DeleteClass($id: ID!, $hard: Boolean = false) {\n    deleteClass(id: $id, hard: $hard)\n  }\n": typeof types.DeleteClassDocument,
    "\n  mutation CreatePayRequest($input: CreatePayRequestInput!) {\n    createPayRequest(input: $input) {\n      id\n      status\n      amount\n      reason\n      justification\n      createdAt\n    }\n  }\n": typeof types.CreatePayRequestDocument,
    "\n  mutation ApprovePayRequest($id: ID!, $comment: String) {\n    approvePayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n": typeof types.ApprovePayRequestDocument,
    "\n  mutation SubmitPayRequest($id: ID!) {\n    submitPayRequest(id: $id) {\n      id\n      status\n    }\n  }\n": typeof types.SubmitPayRequestDocument,
    "\n  mutation RebukePayRequest($id: ID!, $comment: String!) {\n    rebukePayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n": typeof types.RebukePayRequestDocument,
    "\n  mutation DenyPayRequest($id: ID!, $comment: String) {\n    denyPayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n": typeof types.DenyPayRequestDocument,
    "\n  query Account($studentId: ID!, $classId: ID!) {\n    account(studentId: $studentId, classId: $classId) {\n      id\n      studentId\n      classId\n      balance\n    }\n  }\n": typeof types.AccountDocument,
    "\n  query TransactionsByAccount($accountId: ID!) {\n    transactionsByAccount(accountId: $accountId) {\n      id\n      type\n      amount\n      memo\n      createdAt\n    }\n  }\n": typeof types.TransactionsByAccountDocument,
    "\n  query GetClasses($includeArchived: Boolean = false) {\n    classes(includeArchived: $includeArchived) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      isArchived\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetClassesDocument,
    "\n  query GetClassById($id: ID!) {\n    class(id: $id) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      schoolName\n      district\n      payPeriodDefault\n      startingBalance\n      teacherIds\n      defaultCurrency\n      isArchived\n      students {\n        id\n        name\n        classId\n        balance\n      }\n      storeItems {\n        id\n        title\n        price\n        description\n        imageUrl\n        stock\n        perStudentLimit\n        active\n        sort\n      }\n      jobs {\n        id\n        title\n        description\n        period\n        salary {\n          amount\n          unit\n        }\n        capacity {\n          current\n          max\n        }\n        active\n      }\n      transactions {\n        id\n        type\n        amount\n        memo\n        createdAt\n      }\n      payRequests {\n        id\n        amount\n        reason\n        justification\n        status\n        teacherComment\n        createdAt\n      }\n      reasons {\n        id\n        label\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetClassByIdDocument,
    "\n  query GetClassBySlug($slug: String!) {\n    class(slug: $slug) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      isArchived\n    }\n  }\n": typeof types.GetClassBySlugDocument,
    "\n  query ClassesByUser(\n    $userId: ID!\n    $role: Role\n    $includeArchived: Boolean = false\n  ) {\n    classesByUser(\n      userId: $userId\n      role: $role\n      includeArchived: $includeArchived\n    ) {\n      id\n      name\n      subject\n      period\n      defaultCurrency\n      isArchived\n    }\n  }\n": typeof types.ClassesByUserDocument,
    "\n  query Me {\n    me {\n      id\n      name\n      email\n      role\n    }\n  }\n": typeof types.MeDocument,
    "\n  query ReasonsByClass($classId: ID!) {\n    reasonsByClass(classId: $classId) {\n      id\n      label\n    }\n  }\n": typeof types.ReasonsByClassDocument,
    "\n  mutation AddReasons($classId: ID!, $labels: [String!]!) {\n    addReasons(classId: $classId, labels: $labels) {\n      id\n      label\n    }\n  }\n": typeof types.AddReasonsDocument,
    "\n  mutation SetReasons($classId: ID!, $labels: [String!]!) {\n    setReasons(classId: $classId, labels: $labels) {\n      id\n      label\n    }\n  }\n": typeof types.SetReasonsDocument,
    "\n  query PayRequestsByStudent($classId: ID!, $studentId: ID!) {\n    payRequestsByStudent(classId: $classId, studentId: $studentId) {\n      id\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n": typeof types.PayRequestsByStudentDocument,
    "\n  query PayRequestsByClass($classId: ID!, $status: PayRequestStatus) {\n    payRequestsByClass(classId: $classId, status: $status) {\n      id\n      student {\n        id\n        name\n      }\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n": typeof types.PayRequestsByClassDocument,
    "\n  query StoreItemsByClass($classId: ID!) {\n    storeItemsByClass(classId: $classId) {\n      id\n      title\n      price\n      description\n      imageUrl\n      stock\n      perStudentLimit\n      active\n      sort\n    }\n  }\n": typeof types.StoreItemsByClassDocument,
    "\n  query StudentsByClass($classId: ID!) {\n    studentsByClass(classId: $classId) {\n      id\n      name\n      classId\n      balance\n    }\n  }\n": typeof types.StudentsByClassDocument,
    "\n  query StudentsDirectory(\n    $filter: StudentsFilter\n    $limit: Int = 50\n    $offset: Int = 0\n  ) {\n    students(filter: $filter, limit: $limit, offset: $offset) {\n      nodes {\n        id\n        name\n        email\n        role\n        status\n        createdAt\n        updatedAt\n      }\n      totalCount\n    }\n  }\n": typeof types.StudentsDirectoryDocument,
    "\n  query StudentsByTeacher {\n    studentsByTeacher {\n      id\n      name\n      balance\n      classId\n      class {\n        id\n        name\n        subject\n        period\n      }\n    }\n  }\n": typeof types.StudentsByTeacherDocument,
};
const documents: Documents = {
    "\n  fragment UserCore on User {\n    id\n    name\n    email\n    role\n    status\n    createdAt\n    updatedAt\n  }\n": types.UserCoreFragmentDoc,
    "\n  fragment ClassCore on Class {\n    id\n    classroomId\n    slug\n    name\n    subject\n    period\n    gradeLevel\n    joinCode\n    schoolName\n    district\n    payPeriodDefault\n    startingBalance\n    teacherIds\n    defaultCurrency\n    isArchived\n    createdAt\n    updatedAt\n  }\n": types.ClassCoreFragmentDoc,
    "\n  fragment StudentDtoCore on Student {\n    id\n    name\n    balance\n    classId\n  }\n": types.StudentDtoCoreFragmentDoc,
    "\n  fragment StoreItemCore on StoreItem {\n    id\n    classId\n    title\n    price\n    description\n    imageUrl\n    stock\n    perStudentLimit\n    active\n    sort\n    createdAt\n    updatedAt\n  }\n": types.StoreItemCoreFragmentDoc,
    "\n  fragment JobCore on Job {\n    id\n    classId\n    title\n    description\n    period\n    salary { amount unit }\n    schedule { weekday dayOfMonth anchorDate }\n    capacity { current max }\n    active\n    createdAt\n    updatedAt\n  }\n": types.JobCoreFragmentDoc,
    "\n  fragment TransactionCore on Transaction {\n    id\n    accountId\n    toAccountId\n    classId\n    classroomId\n    type\n    amount\n    memo\n    createdByUserId\n    idempotencyKey\n    createdAt\n    updatedAt\n  }\n": types.TransactionCoreFragmentDoc,
    "\n  fragment AccountWithBalance on Account {\n    id\n    studentId\n    classId\n    classroomId\n    balance\n    createdAt\n    updatedAt\n  }\n": types.AccountWithBalanceFragmentDoc,
    "\n  fragment PayRequestCore on PayRequest {\n    id\n    classId\n    studentId\n    amount\n    reason\n    justification\n    status\n    teacherComment\n    createdAt\n    updatedAt\n  }\n": types.PayRequestCoreFragmentDoc,
    "\n  fragment ClassReasonCore on ClassReason {\n    id\n    label\n    classId\n    createdAt\n    updatedAt\n  }\n": types.ClassReasonCoreFragmentDoc,
    "\n  mutation Login($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      accessToken\n      user { id name email role }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation SignUp($input: SignUpInput!) {\n    signUp(input: $input) {\n      accessToken\n      user { id name email role }\n    }\n  }\n": types.SignUpDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  mutation RefreshAccessToken {\n    refreshAccessToken\n  }\n": types.RefreshAccessTokenDocument,
    "\n  mutation CreateClass($input: CreateClassInput!) {\n    createClass(input: $input) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      students {\n        id\n        name\n        classId\n        balance\n      }\n    }\n  }\n": types.CreateClassDocument,
    "\n  mutation UpdateClass($id: ID!, $input: UpdateClassInput!) {\n    updateClass(id: $id, input: $input) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      isArchived\n      updatedAt\n    }\n  }\n": types.UpdateClassDocument,
    "\n  mutation RotateJoinCode($id: ID!) {\n    rotateJoinCode(id: $id) {\n      id\n      joinCode\n    }\n  }\n": types.RotateJoinCodeDocument,
    "\n  mutation DeleteClass($id: ID!, $hard: Boolean = false) {\n    deleteClass(id: $id, hard: $hard)\n  }\n": types.DeleteClassDocument,
    "\n  mutation CreatePayRequest($input: CreatePayRequestInput!) {\n    createPayRequest(input: $input) {\n      id\n      status\n      amount\n      reason\n      justification\n      createdAt\n    }\n  }\n": types.CreatePayRequestDocument,
    "\n  mutation ApprovePayRequest($id: ID!, $comment: String) {\n    approvePayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n": types.ApprovePayRequestDocument,
    "\n  mutation SubmitPayRequest($id: ID!) {\n    submitPayRequest(id: $id) {\n      id\n      status\n    }\n  }\n": types.SubmitPayRequestDocument,
    "\n  mutation RebukePayRequest($id: ID!, $comment: String!) {\n    rebukePayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n": types.RebukePayRequestDocument,
    "\n  mutation DenyPayRequest($id: ID!, $comment: String) {\n    denyPayRequest(id: $id, comment: $comment) {\n      id\n      status\n      teacherComment\n    }\n  }\n": types.DenyPayRequestDocument,
    "\n  query Account($studentId: ID!, $classId: ID!) {\n    account(studentId: $studentId, classId: $classId) {\n      id\n      studentId\n      classId\n      balance\n    }\n  }\n": types.AccountDocument,
    "\n  query TransactionsByAccount($accountId: ID!) {\n    transactionsByAccount(accountId: $accountId) {\n      id\n      type\n      amount\n      memo\n      createdAt\n    }\n  }\n": types.TransactionsByAccountDocument,
    "\n  query GetClasses($includeArchived: Boolean = false) {\n    classes(includeArchived: $includeArchived) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      isArchived\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetClassesDocument,
    "\n  query GetClassById($id: ID!) {\n    class(id: $id) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      schoolName\n      district\n      payPeriodDefault\n      startingBalance\n      teacherIds\n      defaultCurrency\n      isArchived\n      students {\n        id\n        name\n        classId\n        balance\n      }\n      storeItems {\n        id\n        title\n        price\n        description\n        imageUrl\n        stock\n        perStudentLimit\n        active\n        sort\n      }\n      jobs {\n        id\n        title\n        description\n        period\n        salary {\n          amount\n          unit\n        }\n        capacity {\n          current\n          max\n        }\n        active\n      }\n      transactions {\n        id\n        type\n        amount\n        memo\n        createdAt\n      }\n      payRequests {\n        id\n        amount\n        reason\n        justification\n        status\n        teacherComment\n        createdAt\n      }\n      reasons {\n        id\n        label\n      }\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetClassByIdDocument,
    "\n  query GetClassBySlug($slug: String!) {\n    class(slug: $slug) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      isArchived\n    }\n  }\n": types.GetClassBySlugDocument,
    "\n  query ClassesByUser(\n    $userId: ID!\n    $role: Role\n    $includeArchived: Boolean = false\n  ) {\n    classesByUser(\n      userId: $userId\n      role: $role\n      includeArchived: $includeArchived\n    ) {\n      id\n      name\n      subject\n      period\n      defaultCurrency\n      isArchived\n    }\n  }\n": types.ClassesByUserDocument,
    "\n  query Me {\n    me {\n      id\n      name\n      email\n      role\n    }\n  }\n": types.MeDocument,
    "\n  query ReasonsByClass($classId: ID!) {\n    reasonsByClass(classId: $classId) {\n      id\n      label\n    }\n  }\n": types.ReasonsByClassDocument,
    "\n  mutation AddReasons($classId: ID!, $labels: [String!]!) {\n    addReasons(classId: $classId, labels: $labels) {\n      id\n      label\n    }\n  }\n": types.AddReasonsDocument,
    "\n  mutation SetReasons($classId: ID!, $labels: [String!]!) {\n    setReasons(classId: $classId, labels: $labels) {\n      id\n      label\n    }\n  }\n": types.SetReasonsDocument,
    "\n  query PayRequestsByStudent($classId: ID!, $studentId: ID!) {\n    payRequestsByStudent(classId: $classId, studentId: $studentId) {\n      id\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n": types.PayRequestsByStudentDocument,
    "\n  query PayRequestsByClass($classId: ID!, $status: PayRequestStatus) {\n    payRequestsByClass(classId: $classId, status: $status) {\n      id\n      student {\n        id\n        name\n      }\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n": types.PayRequestsByClassDocument,
    "\n  query StoreItemsByClass($classId: ID!) {\n    storeItemsByClass(classId: $classId) {\n      id\n      title\n      price\n      description\n      imageUrl\n      stock\n      perStudentLimit\n      active\n      sort\n    }\n  }\n": types.StoreItemsByClassDocument,
    "\n  query StudentsByClass($classId: ID!) {\n    studentsByClass(classId: $classId) {\n      id\n      name\n      classId\n      balance\n    }\n  }\n": types.StudentsByClassDocument,
    "\n  query StudentsDirectory(\n    $filter: StudentsFilter\n    $limit: Int = 50\n    $offset: Int = 0\n  ) {\n    students(filter: $filter, limit: $limit, offset: $offset) {\n      nodes {\n        id\n        name\n        email\n        role\n        status\n        createdAt\n        updatedAt\n      }\n      totalCount\n    }\n  }\n": types.StudentsDirectoryDocument,
    "\n  query StudentsByTeacher {\n    studentsByTeacher {\n      id\n      name\n      balance\n      classId\n      class {\n        id\n        name\n        subject\n        period\n      }\n    }\n  }\n": types.StudentsByTeacherDocument,
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
export function graphql(source: "\n  fragment UserCore on User {\n    id\n    name\n    email\n    role\n    status\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment UserCore on User {\n    id\n    name\n    email\n    role\n    status\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ClassCore on Class {\n    id\n    classroomId\n    slug\n    name\n    subject\n    period\n    gradeLevel\n    joinCode\n    schoolName\n    district\n    payPeriodDefault\n    startingBalance\n    teacherIds\n    defaultCurrency\n    isArchived\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment ClassCore on Class {\n    id\n    classroomId\n    slug\n    name\n    subject\n    period\n    gradeLevel\n    joinCode\n    schoolName\n    district\n    payPeriodDefault\n    startingBalance\n    teacherIds\n    defaultCurrency\n    isArchived\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment StudentDtoCore on Student {\n    id\n    name\n    balance\n    classId\n  }\n"): (typeof documents)["\n  fragment StudentDtoCore on Student {\n    id\n    name\n    balance\n    classId\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment StoreItemCore on StoreItem {\n    id\n    classId\n    title\n    price\n    description\n    imageUrl\n    stock\n    perStudentLimit\n    active\n    sort\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment StoreItemCore on StoreItem {\n    id\n    classId\n    title\n    price\n    description\n    imageUrl\n    stock\n    perStudentLimit\n    active\n    sort\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment JobCore on Job {\n    id\n    classId\n    title\n    description\n    period\n    salary { amount unit }\n    schedule { weekday dayOfMonth anchorDate }\n    capacity { current max }\n    active\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment JobCore on Job {\n    id\n    classId\n    title\n    description\n    period\n    salary { amount unit }\n    schedule { weekday dayOfMonth anchorDate }\n    capacity { current max }\n    active\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment TransactionCore on Transaction {\n    id\n    accountId\n    toAccountId\n    classId\n    classroomId\n    type\n    amount\n    memo\n    createdByUserId\n    idempotencyKey\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment TransactionCore on Transaction {\n    id\n    accountId\n    toAccountId\n    classId\n    classroomId\n    type\n    amount\n    memo\n    createdByUserId\n    idempotencyKey\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment AccountWithBalance on Account {\n    id\n    studentId\n    classId\n    classroomId\n    balance\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment AccountWithBalance on Account {\n    id\n    studentId\n    classId\n    classroomId\n    balance\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment PayRequestCore on PayRequest {\n    id\n    classId\n    studentId\n    amount\n    reason\n    justification\n    status\n    teacherComment\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment PayRequestCore on PayRequest {\n    id\n    classId\n    studentId\n    amount\n    reason\n    justification\n    status\n    teacherComment\n    createdAt\n    updatedAt\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ClassReasonCore on ClassReason {\n    id\n    label\n    classId\n    createdAt\n    updatedAt\n  }\n"): (typeof documents)["\n  fragment ClassReasonCore on ClassReason {\n    id\n    label\n    classId\n    createdAt\n    updatedAt\n  }\n"];
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
export function graphql(source: "\n  mutation CreateClass($input: CreateClassInput!) {\n    createClass(input: $input) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      students {\n        id\n        name\n        classId\n        balance\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateClass($input: CreateClassInput!) {\n    createClass(input: $input) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      students {\n        id\n        name\n        classId\n        balance\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateClass($id: ID!, $input: UpdateClassInput!) {\n    updateClass(id: $id, input: $input) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      isArchived\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateClass($id: ID!, $input: UpdateClassInput!) {\n    updateClass(id: $id, input: $input) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      isArchived\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RotateJoinCode($id: ID!) {\n    rotateJoinCode(id: $id) {\n      id\n      joinCode\n    }\n  }\n"): (typeof documents)["\n  mutation RotateJoinCode($id: ID!) {\n    rotateJoinCode(id: $id) {\n      id\n      joinCode\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteClass($id: ID!, $hard: Boolean = false) {\n    deleteClass(id: $id, hard: $hard)\n  }\n"): (typeof documents)["\n  mutation DeleteClass($id: ID!, $hard: Boolean = false) {\n    deleteClass(id: $id, hard: $hard)\n  }\n"];
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
export function graphql(source: "\n  query GetClasses($includeArchived: Boolean = false) {\n    classes(includeArchived: $includeArchived) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      isArchived\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetClasses($includeArchived: Boolean = false) {\n    classes(includeArchived: $includeArchived) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      isArchived\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetClassById($id: ID!) {\n    class(id: $id) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      schoolName\n      district\n      payPeriodDefault\n      startingBalance\n      teacherIds\n      defaultCurrency\n      isArchived\n      students {\n        id\n        name\n        classId\n        balance\n      }\n      storeItems {\n        id\n        title\n        price\n        description\n        imageUrl\n        stock\n        perStudentLimit\n        active\n        sort\n      }\n      jobs {\n        id\n        title\n        description\n        period\n        salary {\n          amount\n          unit\n        }\n        capacity {\n          current\n          max\n        }\n        active\n      }\n      transactions {\n        id\n        type\n        amount\n        memo\n        createdAt\n      }\n      payRequests {\n        id\n        amount\n        reason\n        justification\n        status\n        teacherComment\n        createdAt\n      }\n      reasons {\n        id\n        label\n      }\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetClassById($id: ID!) {\n    class(id: $id) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      schoolName\n      district\n      payPeriodDefault\n      startingBalance\n      teacherIds\n      defaultCurrency\n      isArchived\n      students {\n        id\n        name\n        classId\n        balance\n      }\n      storeItems {\n        id\n        title\n        price\n        description\n        imageUrl\n        stock\n        perStudentLimit\n        active\n        sort\n      }\n      jobs {\n        id\n        title\n        description\n        period\n        salary {\n          amount\n          unit\n        }\n        capacity {\n          current\n          max\n        }\n        active\n      }\n      transactions {\n        id\n        type\n        amount\n        memo\n        createdAt\n      }\n      payRequests {\n        id\n        amount\n        reason\n        justification\n        status\n        teacherComment\n        createdAt\n      }\n      reasons {\n        id\n        label\n      }\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GetClassBySlug($slug: String!) {\n    class(slug: $slug) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      isArchived\n    }\n  }\n"): (typeof documents)["\n  query GetClassBySlug($slug: String!) {\n    class(slug: $slug) {\n      id\n      name\n      subject\n      period\n      gradeLevel\n      joinCode\n      defaultCurrency\n      isArchived\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ClassesByUser(\n    $userId: ID!\n    $role: Role\n    $includeArchived: Boolean = false\n  ) {\n    classesByUser(\n      userId: $userId\n      role: $role\n      includeArchived: $includeArchived\n    ) {\n      id\n      name\n      subject\n      period\n      defaultCurrency\n      isArchived\n    }\n  }\n"): (typeof documents)["\n  query ClassesByUser(\n    $userId: ID!\n    $role: Role\n    $includeArchived: Boolean = false\n  ) {\n    classesByUser(\n      userId: $userId\n      role: $role\n      includeArchived: $includeArchived\n    ) {\n      id\n      name\n      subject\n      period\n      defaultCurrency\n      isArchived\n    }\n  }\n"];
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
export function graphql(source: "\n  mutation AddReasons($classId: ID!, $labels: [String!]!) {\n    addReasons(classId: $classId, labels: $labels) {\n      id\n      label\n    }\n  }\n"): (typeof documents)["\n  mutation AddReasons($classId: ID!, $labels: [String!]!) {\n    addReasons(classId: $classId, labels: $labels) {\n      id\n      label\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetReasons($classId: ID!, $labels: [String!]!) {\n    setReasons(classId: $classId, labels: $labels) {\n      id\n      label\n    }\n  }\n"): (typeof documents)["\n  mutation SetReasons($classId: ID!, $labels: [String!]!) {\n    setReasons(classId: $classId, labels: $labels) {\n      id\n      label\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PayRequestsByStudent($classId: ID!, $studentId: ID!) {\n    payRequestsByStudent(classId: $classId, studentId: $studentId) {\n      id\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query PayRequestsByStudent($classId: ID!, $studentId: ID!) {\n    payRequestsByStudent(classId: $classId, studentId: $studentId) {\n      id\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PayRequestsByClass($classId: ID!, $status: PayRequestStatus) {\n    payRequestsByClass(classId: $classId, status: $status) {\n      id\n      student {\n        id\n        name\n      }\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query PayRequestsByClass($classId: ID!, $status: PayRequestStatus) {\n    payRequestsByClass(classId: $classId, status: $status) {\n      id\n      student {\n        id\n        name\n      }\n      amount\n      reason\n      justification\n      status\n      teacherComment\n      createdAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query StoreItemsByClass($classId: ID!) {\n    storeItemsByClass(classId: $classId) {\n      id\n      title\n      price\n      description\n      imageUrl\n      stock\n      perStudentLimit\n      active\n      sort\n    }\n  }\n"): (typeof documents)["\n  query StoreItemsByClass($classId: ID!) {\n    storeItemsByClass(classId: $classId) {\n      id\n      title\n      price\n      description\n      imageUrl\n      stock\n      perStudentLimit\n      active\n      sort\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query StudentsByClass($classId: ID!) {\n    studentsByClass(classId: $classId) {\n      id\n      name\n      classId\n      balance\n    }\n  }\n"): (typeof documents)["\n  query StudentsByClass($classId: ID!) {\n    studentsByClass(classId: $classId) {\n      id\n      name\n      classId\n      balance\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query StudentsDirectory(\n    $filter: StudentsFilter\n    $limit: Int = 50\n    $offset: Int = 0\n  ) {\n    students(filter: $filter, limit: $limit, offset: $offset) {\n      nodes {\n        id\n        name\n        email\n        role\n        status\n        createdAt\n        updatedAt\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query StudentsDirectory(\n    $filter: StudentsFilter\n    $limit: Int = 50\n    $offset: Int = 0\n  ) {\n    students(filter: $filter, limit: $limit, offset: $offset) {\n      nodes {\n        id\n        name\n        email\n        role\n        status\n        createdAt\n        updatedAt\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query StudentsByTeacher {\n    studentsByTeacher {\n      id\n      name\n      balance\n      classId\n      class {\n        id\n        name\n        subject\n        period\n      }\n    }\n  }\n"): (typeof documents)["\n  query StudentsByTeacher {\n    studentsByTeacher {\n      id\n      name\n      balance\n      classId\n      class {\n        id\n        name\n        subject\n        period\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;