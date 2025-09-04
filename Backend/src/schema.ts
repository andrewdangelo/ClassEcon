import { gql } from "graphql-tag"
import { DateTimeTypeDefinition } from "graphql-scalars"

// Compose the DateTime scalar with the rest of the SDL.
// (We keep DateTime so we don't have to manually stringify dates)
export const typeDefs = [
  DateTimeTypeDefinition,
  gql`
    enum TransactionType { PAY FINE PURCHASE ADJUST REFUND }
    enum PayPeriod { WEEKLY MONTHLY SEMESTER }
    enum PayRequestStatus { SUBMITTED APPROVED PAID REBUKED DENIED }

    type Class {
      id: ID!
      slug: String!
      name: String!
      term: String
      room: String
      defaultCurrency: String!
      students: [Student!]!
      storeItems: [StoreItem!]!
      jobs: [Job!]!
      transactions: [Transaction!]!
      payRequests: [PayRequest!]!
      reasons: [ClassReason!]!
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type ClassReason {
      id: ID!
      label: String!
    }

    type Student {
      id: ID!
      name: String!
      balance: Int!
      classId: ID!
      class: Class!
      txns: [Transaction!]!
      requests: [PayRequest!]!
    }

    type StoreItem {
      id: ID!
      name: String!
      price: Int!
      stock: Int!
      classId: ID!
    }

    type Job {
      id: ID!
      title: String!
      payPeriod: PayPeriod!
      salary: Int!
      slots: Int!
      classId: ID!
    }

    type Transaction {
      id: ID!
      type: TransactionType!
      amount: Int!
      date: DateTime!
      desc: String!
      classId: ID!
      studentId: ID!
    }

    type PayRequest {
      id: ID!
      classId: ID!
      studentId: ID!
      amount: Int!
      reason: String!
      justification: String!
      status: PayRequestStatus!
      teacherComment: String
      createdAt: DateTime!
      updatedAt: DateTime!
      class: Class!
      student: Student!
    }

    # --------- Queries ----------
    type Query {
      classes: [Class!]!
      class(id: ID, slug: String): Class
      studentsByClass(classId: ID!): [Student!]!
      storeItemsByClass(classId: ID!): [StoreItem!]!
      payRequestsByClass(classId: ID!, status: PayRequestStatus): [PayRequest!]!
      payRequestsByStudent(classId: ID!, studentId: ID!): [PayRequest!]!
      reasonsByClass(classId: ID!): [ClassReason!]!
    }

    # --------- Mutations ----------
    input CreateClassInput {
      slug: String!
      name: String!
      term: String
      room: String
      defaultCurrency: String = "CE$"
      reasons: [String!]
      students: [StudentInput!]
      jobs: [JobInput!]
      storeItems: [StoreItemInput!]
    }

    input StudentInput { name: String! }
    input JobInput { title: String!, payPeriod: PayPeriod!, salary: Int!, slots: Int! }
    input StoreItemInput { name: String!, price: Int!, stock: Int! }

    input CreatePayRequestInput {
      classId: ID!
      studentId: ID!
      amount: Int!
      reason: String!
      justification: String!
    }

    type Mutation {
      createClass(input: CreateClassInput!): Class!
      addReasons(classId: ID!, labels: [String!]!): [ClassReason!]!
      setReasons(classId: ID!, labels: [String!]!): [ClassReason!]!
      createPayRequest(input: CreatePayRequestInput!): PayRequest!
      approvePayRequest(id: ID!, comment: String): PayRequest!
      submitPayRequest(id: ID!): PayRequest!
      rebukePayRequest(id: ID!, comment: String!): PayRequest!
      denyPayRequest(id: ID!, comment: String): PayRequest!
    }
  `
]
