import { gql } from "@apollo/client";

export const GET_CLASS_STATISTICS = gql`
  query GetClassStatistics($classId: ID!) {
    classStatistics(classId: $classId) {
      totalStudents
      totalJobs
      activeJobs
      totalEmployments
      pendingApplications
      totalTransactions
      totalPayRequests
      pendingPayRequests
      averageBalance
      totalCirculation
    }
  }
`;
