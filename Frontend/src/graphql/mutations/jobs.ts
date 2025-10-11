import { gql } from "@apollo/client";

export const CREATE_JOB = gql`
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      classId
      title
      description
      rolesResponsibilities
      salary {
        amount
        unit
      }
      period
      capacity {
        current
        max
      }
      active
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_JOB = gql`
  mutation UpdateJob($id: ID!, $input: UpdateJobInput!) {
    updateJob(id: $id, input: $input) {
      id
      classId
      title
      description
      rolesResponsibilities
      salary {
        amount
        unit
      }
      period
      capacity {
        current
        max
      }
      active
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_JOB = gql`
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id)
  }
`;

export const APPLY_FOR_JOB = gql`
  mutation ApplyForJob($input: ApplyForJobInput!) {
    applyForJob(input: $input) {
      id
      jobId
      job {
        id
        title
      }
      classId
      studentId
      status
      applicationText
      qualifications
      availability
      createdAt
      updatedAt
    }
  }
`;

export const APPROVE_JOB_APPLICATION = gql`
  mutation ApproveJobApplication($id: ID!) {
    approveJobApplication(id: $id) {
      id
      jobId
      classId
      studentId
      student {
        id
        name
      }
      status
      decidedAt
      updatedAt
    }
  }
`;

export const REJECT_JOB_APPLICATION = gql`
  mutation RejectJobApplication($id: ID!, $reason: String) {
    rejectJobApplication(id: $id, reason: $reason) {
      id
      jobId
      classId
      studentId
      student {
        id
        name
      }
      status
      decidedAt
      updatedAt
    }
  }
`;

export const WITHDRAW_JOB_APPLICATION = gql`
  mutation WithdrawJobApplication($id: ID!) {
    withdrawJobApplication(id: $id) {
      id
      status
      updatedAt
    }
  }
`;
