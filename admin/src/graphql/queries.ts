import { gql } from '@apollo/client'

// User Queries
export const GET_ALL_USERS = gql`
  query GetAllUsers($filter: StudentsFilter, $limit: Int, $offset: Int) {
    students(filter: $filter, limit: $limit, offset: $offset) {
      nodes {
        id
        name
        email
        role
        status
        hasBetaAccess
        subscriptionTier
        subscriptionStatus
        isFoundingMember
        createdAt
      }
      totalCount
    }
  }
`

export const GET_ME = gql`
  query Me {
    me {
      id
      name
      email
      role
      status
      hasBetaAccess
      subscriptionTier
      subscriptionStatus
      isFoundingMember
      createdAt
    }
  }
`

// Class Queries
export const GET_ALL_CLASSES = gql`
  query GetAllClasses($includeArchived: Boolean) {
    classes(includeArchived: $includeArchived) {
      id
      classroomId
      name
      slug
      description
      subject
      period
      gradeLevel
      joinCode
      schoolName
      district
      defaultCurrency
      startingBalance
      status
      isArchived
      createdAt
      updatedAt
    }
  }
`

export const GET_CLASS = gql`
  query GetClass($id: ID, $slug: String) {
    class(id: $id, slug: $slug) {
      id
      classroomId
      name
      slug
      description
      subject
      period
      gradeLevel
      joinCode
      schoolName
      district
      defaultCurrency
      startingBalance
      status
      isArchived
      createdAt
      updatedAt
      students {
        id
        name
        balance
        classId
      }
      storeItems {
        id
        title
        price
        stock
        active
      }
      jobs {
        id
        title
        active
      }
    }
  }
`

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
`

export const GET_STUDENTS_BY_CLASS = gql`
  query GetStudentsByClass($classId: ID!) {
    studentsByClass(classId: $classId) {
      id
      name
      balance
      classId
    }
  }
`

// Beta Code Queries & Mutations
export const VALIDATE_BETA_CODE = gql`
  mutation ValidateBetaCode($code: String!) {
    validateBetaCode(code: $code) {
      valid
      message
      code {
        id
        code
        description
        maxUses
        currentUses
        expiresAt
        isActive
        createdAt
      }
    }
  }
`

export const CREATE_BETA_CODE = gql`
  mutation CreateBetaCode($code: String!, $description: String, $maxUses: Int, $expiresAt: DateTime) {
    createBetaCode(code: $code, description: $description, maxUses: $maxUses, expiresAt: $expiresAt) {
      id
      code
      description
      maxUses
      currentUses
      expiresAt
      isActive
      createdAt
    }
  }
`

export const DEACTIVATE_BETA_CODE = gql`
  mutation DeactivateBetaCode($id: ID!) {
    deactivateBetaCode(id: $id) {
      id
      code
      isActive
    }
  }
`

// Class Mutations
export const CREATE_CLASS = gql`
  mutation CreateClass($input: CreateClassInput!) {
    createClass(input: $input) {
      id
      name
      slug
      joinCode
      createdAt
    }
  }
`

export const UPDATE_CLASS = gql`
  mutation UpdateClass($id: ID!, $input: UpdateClassInput!) {
    updateClass(id: $id, input: $input) {
      id
      name
      slug
      description
      status
      isArchived
      updatedAt
    }
  }
`

export const DELETE_CLASS = gql`
  mutation DeleteClass($id: ID!, $hard: Boolean) {
    deleteClass(id: $id, hard: $hard)
  }
`

// Subscription Queries
export const GET_MY_SUBSCRIPTION = gql`
  query GetMySubscription {
    mySubscription {
      id
      userId
      planTier
      status
      stripeCustomerId
      stripeSubscriptionId
      currentPeriodStart
      currentPeriodEnd
      trialEndsAt
      cancelAtPeriodEnd
      cancelledAt
      limits {
        maxClasses
        maxStudentsPerClass
        maxStoreItems
        maxJobs
        customCurrency
        analytics
        exportData
        prioritySupport
      }
      createdAt
      updatedAt
    }
  }
`

export const GET_AVAILABLE_PLANS = gql`
  query GetAvailablePlans {
    availablePlans {
      tier
      name
      price
      billingPeriod
      features
      stripePriceId
      limits {
        maxClasses
        maxStudentsPerClass
        maxStoreItems
        maxJobs
        customCurrency
        analytics
        exportData
        prioritySupport
      }
    }
  }
`

// Pay Request Queries
export const GET_PAY_REQUESTS_BY_CLASS = gql`
  query GetPayRequestsByClass($classId: ID!, $status: PayRequestStatus) {
    payRequestsByClass(classId: $classId, status: $status) {
      id
      classId
      studentId
      amount
      reason
      justification
      status
      teacherComment
      createdAt
      updatedAt
      student {
        id
        name
      }
    }
  }
`

// Transaction Queries (via account)
export const GET_TRANSACTIONS_BY_ACCOUNT = gql`
  query GetTransactionsByAccount($accountId: ID!) {
    transactionsByAccount(accountId: $accountId) {
      id
      accountId
      toAccountId
      classId
      type
      amount
      memo
      createdAt
    }
  }
`

// Fine Queries
export const GET_FINES_BY_CLASS = gql`
  query GetFinesByClass($classId: ID!, $status: FineStatus) {
    finesByClass(classId: $classId, status: $status) {
      id
      studentId
      classId
      teacherId
      amount
      reason
      description
      status
      waivedReason
      waivedAt
      createdAt
      student {
        id
        name
      }
      teacher {
        id
        name
      }
    }
  }
`

// Notifications
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($limit: Int, $unreadOnly: Boolean) {
    notifications(limit: $limit, unreadOnly: $unreadOnly) {
      id
      userId
      type
      title
      message
      relatedId
      relatedType
      isRead
      createdAt
    }
    unreadNotificationCount
  }
`

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID!) {
    markNotificationAsRead(id: $id) {
      id
      isRead
    }
  }
`

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead
  }
`

// ============================================
// ADMIN-ONLY QUERIES & MUTATIONS
// ============================================

// Admin Dashboard Stats
export const GET_ADMIN_DASHBOARD_STATS = gql`
  query GetAdminDashboardStats {
    adminDashboardStats {
      totalUsers
      totalTeachers
      totalStudents
      totalParents
      totalAdmins
      activeUsers
      bannedUsers
      disabledUsers
      totalClasses
      activeClasses
      archivedClasses
      totalClassrooms
      totalBetaCodes
      activeBetaCodes
      totalBetaCodeUses
      newUsersToday
      newUsersThisWeek
      newUsersThisMonth
    }
  }
`

// Admin User Management
export const ADMIN_GET_USERS = gql`
  query AdminGetUsers(
    $search: String
    $role: Role
    $status: UserStatus
    $limit: Int
    $offset: Int
    $sortBy: String
    $sortOrder: String
  ) {
    adminUsers(
      search: $search
      role: $role
      status: $status
      limit: $limit
      offset: $offset
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      nodes {
        id
        name
        email
        role
        status
        hasBetaAccess
        subscriptionTier
        subscriptionStatus
        isFoundingMember
        createdAt
        updatedAt
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        totalPages
        currentPage
      }
    }
  }
`

export const ADMIN_GET_USER = gql`
  query AdminGetUser($id: ID!) {
    adminUser(id: $id) {
      id
      name
      email
      role
      status
      hasBetaAccess
      subscriptionTier
      subscriptionStatus
      subscriptionExpiresAt
      trialStartedAt
      trialEndsAt
      isFoundingMember
      stripeCustomerId
      stripeSubscriptionId
      createdAt
      updatedAt
    }
  }
`

export const ADMIN_BAN_USER = gql`
  mutation AdminBanUser($userId: ID!, $reason: String!) {
    adminBanUser(userId: $userId, reason: $reason) {
      id
      name
      status
    }
  }
`

export const ADMIN_UNBAN_USER = gql`
  mutation AdminUnbanUser($userId: ID!) {
    adminUnbanUser(userId: $userId) {
      id
      name
      status
    }
  }
`

export const ADMIN_UPDATE_USER = gql`
  mutation AdminUpdateUser($userId: ID!, $input: AdminUpdateUserInput!) {
    adminUpdateUser(userId: $userId, input: $input) {
      id
      name
      email
      role
      status
      hasBetaAccess
      subscriptionTier
      subscriptionStatus
      isFoundingMember
    }
  }
`

export const ADMIN_DELETE_USER = gql`
  mutation AdminDeleteUser($userId: ID!, $hard: Boolean) {
    adminDeleteUser(userId: $userId, hard: $hard)
  }
`

export const ADMIN_RESET_USER_PASSWORD = gql`
  mutation AdminResetUserPassword($userId: ID!, $newPassword: String!) {
    adminResetUserPassword(userId: $userId, newPassword: $newPassword)
  }
`

export const ADMIN_GRANT_BETA_ACCESS = gql`
  mutation AdminGrantBetaAccess($userId: ID!) {
    adminGrantBetaAccess(userId: $userId) {
      id
      hasBetaAccess
    }
  }
`

export const ADMIN_REVOKE_BETA_ACCESS = gql`
  mutation AdminRevokeBetaAccess($userId: ID!) {
    adminRevokeBetaAccess(userId: $userId) {
      id
      hasBetaAccess
    }
  }
`

export const ADMIN_IMPERSONATE_USER = gql`
  mutation AdminImpersonateUser($userId: ID!) {
    adminImpersonateUser(userId: $userId) {
      accessToken
      user {
        id
        name
        email
        role
      }
    }
  }
`

// Admin Class Management
export const ADMIN_GET_CLASSES = gql`
  query AdminGetClasses($search: String, $isArchived: Boolean, $limit: Int, $offset: Int) {
    adminClasses(search: $search, isArchived: $isArchived, limit: $limit, offset: $offset) {
      id
      classroomId
      name
      slug
      description
      subject
      period
      gradeLevel
      joinCode
      schoolName
      district
      defaultCurrency
      startingBalance
      status
      isArchived
      createdAt
      updatedAt
    }
  }
`

export const ADMIN_FORCE_DELETE_CLASS = gql`
  mutation AdminForceDeleteClass($classId: ID!) {
    adminForceDeleteClass(classId: $classId)
  }
`

export const ADMIN_RESTORE_CLASS = gql`
  mutation AdminRestoreClass($classId: ID!) {
    adminRestoreClass(classId: $classId) {
      id
      name
      isArchived
    }
  }
`

// Admin Classroom Management
export const ADMIN_GET_CLASSROOMS = gql`
  query AdminGetClassrooms($limit: Int, $offset: Int) {
    adminClassrooms(limit: $limit, offset: $offset) {
      id
      name
      ownerId
      settings {
        currency
        overdraft
        transferAcrossClasses
      }
      createdAt
      updatedAt
    }
  }
`

export const ADMIN_UPDATE_CLASSROOM = gql`
  mutation AdminUpdateClassroom($classroomId: ID!, $input: AdminUpdateClassroomInput!) {
    adminUpdateClassroom(classroomId: $classroomId, input: $input) {
      id
      name
      settings {
        currency
        overdraft
        transferAcrossClasses
      }
    }
  }
`

export const ADMIN_DELETE_CLASSROOM = gql`
  mutation AdminDeleteClassroom($classroomId: ID!, $hard: Boolean) {
    adminDeleteClassroom(classroomId: $classroomId, hard: $hard)
  }
`

export const ADMIN_TRANSFER_CLASSROOM = gql`
  mutation AdminTransferClassroom($classroomId: ID!, $newOwnerId: ID!) {
    adminTransferClassroomOwnership(classroomId: $classroomId, newOwnerId: $newOwnerId) {
      id
      ownerId
    }
  }
`

// Admin Beta Codes
export const ADMIN_GET_BETA_CODES = gql`
  query AdminGetBetaCodes($activeOnly: Boolean) {
    adminBetaCodes(activeOnly: $activeOnly) {
      id
      code
      description
      maxUses
      currentUses
      expiresAt
      isActive
      createdAt
    }
  }
`

// Admin Audit Logs
export const ADMIN_GET_AUDIT_LOGS = gql`
  query AdminGetAuditLogs(
    $adminUserId: ID
    $action: String
    $targetType: String
    $limit: Int
    $offset: Int
  ) {
    adminAuditLogs(
      adminUserId: $adminUserId
      action: $action
      targetType: $targetType
      limit: $limit
      offset: $offset
    ) {
      nodes {
        id
        adminUserId
        action
        targetType
        targetId
        details
        ipAddress
        userAgent
        createdAt
        adminUser {
          id
          name
          email
        }
      }
      totalCount
    }
  }
`

// Admin Subscription Stats
export const GET_ADMIN_SUBSCRIPTION_STATS = gql`
  query GetAdminSubscriptionStats {
    adminSubscriptionStats {
      totalSubscriptions
      activeSubscriptions
      trialSubscriptions
      expiredSubscriptions
      cancelledSubscriptions
      foundingMembers
      tierBreakdown
    }
  }
`

// Admin System Actions
export const ADMIN_PURGE_INACTIVE_USERS = gql`
  mutation AdminPurgeInactiveUsers($daysInactive: Int!) {
    adminPurgeInactiveUsers(daysInactive: $daysInactive)
  }
`

export const ADMIN_SEND_BULK_EMAIL = gql`
  mutation AdminSendBulkEmail($userIds: [ID!]!, $subject: String!, $body: String!) {
    adminSendBulkEmail(userIds: $userIds, subject: $subject, body: $body)
  }
`
