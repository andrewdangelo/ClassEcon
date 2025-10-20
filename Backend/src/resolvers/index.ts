import { scalars } from "./scalars";
import { Query } from "./Query";
import { Mutation } from "./Mutation";
import { Subscription } from "./Subscription";
import { Class } from "./Class";
import { PayRequest } from "./PayRequest";
import { Student } from "./Student";
import { Fine } from "./Fine";
import { SubscriptionPlanResolvers } from "./SubscriptionPlan";
import { pickId } from "./helpers";
import { StoreItem, Purchase, User, RedemptionRequest, Job, JobApplication } from "../models";

export const resolvers = {
  ...scalars,
  Query: {
    ...Query,
    ...SubscriptionPlanResolvers.Query,
  },
  Mutation: {
    ...Mutation,
    ...SubscriptionPlanResolvers.Mutation,
  },
  Subscription,
  SubscriptionPlan: SubscriptionPlanResolvers.SubscriptionPlan,
  Class,
  PayRequest,
  Student,
  // generic ID pickers
  Classroom: { id: pickId },
  User: { id: pickId },
  Membership: { id: pickId },
  Account: { id: pickId },
  Transaction: { id: pickId },
  StoreItem: { id: pickId },
  Purchase: { 
    id: pickId,
    itemId: (parent: any) => {
      // If itemId exists, return it
      if (parent.itemId) return parent.itemId;
      
      // For legacy purchases without itemId, generate one based on the _id
      // This provides a consistent identifier for old purchases
      return `LEGACY-${parent._id.toString().substring(0, 12).toUpperCase()}`;
    },
    storeItem: async (parent: any) => {
      if (!parent.storeItemId) return null;
      
      try {
        // Actually fetch the StoreItem from database
        const item = await StoreItem.findById(parent.storeItemId).lean().exec();
        return item; // Returns null if not found (item was deleted)
      } catch (error) {
        console.error("Error fetching storeItem:", error);
        return null;
      }
    },
    status: (parent: any) => {
      // Handle missing status (legacy data) - default to IN_BACKPACK
      if (!parent.status) {
        return "IN_BACKPACK";
      }
      
      // Convert database format (kebab-case) to GraphQL enum format (SCREAMING_SNAKE_CASE)
      const statusMap: Record<string, string> = {
        "in-backpack": "IN_BACKPACK",
        "redeemed": "REDEEMED",
        "expired": "EXPIRED",
      };
      return statusMap[parent.status] || parent.status.toUpperCase().replace(/-/g, "_");
    },
    hasPendingRedemption: async (parent: any) => {
      try {
        // Check if there's a pending redemption request for this purchase
        const pendingRequest = await RedemptionRequest.findOne({
          purchaseId: parent._id,
          status: "pending",
        }).lean().exec();
        
        return !!pendingRequest;
      } catch (error) {
        console.error("Error checking pending redemption:", error);
        return false;
      }
    },
  },
  RedemptionRequest: {
    id: pickId,
    purchase: async (parent: any) => {
      if (!parent.purchaseId) return null;
      
      try {
        // Actually fetch the Purchase from database
        const purchase = await Purchase.findById(parent.purchaseId).lean().exec();
        return purchase; // Returns null if not found
      } catch (error) {
        console.error("Error fetching purchase for redemption request:", error);
        return null;
      }
    },
    student: async (parent: any) => {
      if (!parent.studentId) return null;
      
      try {
        // Actually fetch the User from database
        const user = await User.findById(parent.studentId).lean().exec();
        return user;
      } catch (error) {
        console.error("Error fetching student for redemption request:", error);
        return null;
      }
    },
    reviewedBy: async (parent: any) => {
      if (!parent.reviewedByUserId) return null;
      
      try {
        // Actually fetch the User from database
        const user = await User.findById(parent.reviewedByUserId).lean().exec();
        return user;
      } catch (error) {
        console.error("Error fetching reviewedBy user for redemption request:", error);
        return null;
      }
    },
    status: (parent: any) => {
      // Convert database format (lowercase) to GraphQL enum format (UPPERCASE)
      return parent.status?.toUpperCase() || parent.status;
    },
  },
  Job: { id: pickId },
  JobApplication: { 
    id: pickId,
    job: async (parent: any) => {
      if (!parent.jobId) return null;
      try {
        const job = await Job.findById(parent.jobId).lean().exec();
        return job;
      } catch (error) {
        console.error("Error fetching job for application:", error);
        return null;
      }
    },
    student: async (parent: any) => {
      if (!parent.studentId) return null;
      try {
        const user = await User.findById(parent.studentId).lean().exec();
        return user;
      } catch (error) {
        console.error("Error fetching student for application:", error);
        return null;
      }
    },
  },
  Employment: { id: pickId },
  Payslip: { id: pickId },
  ClassReason: { id: pickId },
  Notification: { id: pickId },
  PayRequestComment: { 
    id: pickId,
    user: (parent: any) => ({ _id: parent.userId }),
  },
  Fine,
};
