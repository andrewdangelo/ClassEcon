import { gql } from "@apollo/client";

export const JOBS = gql`
  query Jobs($classId: ID!, $activeOnly: Boolean) {
    jobs(classId: $classId, activeOnly: $activeOnly) {
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

export const JOB = gql`
  query Job($id: ID!) {
    job(id: $id) {
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

export const JOB_APPLICATIONS = gql`
  query JobApplications(
    $jobId: ID
    $studentId: ID
    $classId: ID
    $status: JobApplicationStatus
  ) {
    jobApplications(
      jobId: $jobId
      studentId: $studentId
      classId: $classId
      status: $status
    ) {
      id
      jobId
      job {
        id
        title
        description
        salary {
          amount
          unit
        }
        period
      }
      classId
      studentId
      student {
        id
        name
        email
      }
      status
      applicationText
      qualifications
      availability
      createdAt
      decidedAt
      updatedAt
    }
  }
`;

export const JOB_APPLICATION = gql`
  query JobApplication($id: ID!) {
    jobApplication(id: $id) {
      id
      jobId
      job {
        id
        title
        description
        rolesResponsibilities
        salary {
          amount
          unit
        }
        period
      }
      classId
      studentId
      student {
        id
        name
        email
      }
      status
      applicationText
      qualifications
      availability
      createdAt
      decidedAt
      updatedAt
    }
  }
`;

export const STUDENT_EMPLOYMENTS = gql`
  query StudentEmployments(
    $studentId: ID!
    $classId: ID!
    $status: EmploymentStatus
  ) {
    studentEmployments(
      studentId: $studentId
      classId: $classId
      status: $status
    ) {
      id
      jobId
      classId
      studentId
      status
      startedAt
      endedAt
      lastPaidAt
      createdAt
      updatedAt
    }
  }
`;

export const JOB_EMPLOYMENTS = gql`
  query JobEmployments($jobId: ID!, $status: EmploymentStatus) {
    jobEmployments(jobId: $jobId, status: $status) {
      id
      jobId
      classId
      studentId
      status
      startedAt
      endedAt
      lastPaidAt
      createdAt
      updatedAt
    }
  }
`;
