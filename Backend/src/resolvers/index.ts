import { scalars } from "./scalars";
import { Query } from "./Query";
import { Mutation } from "./Mutation";
import { Subscription } from "./Subscription";
import { Class } from "./Class";
import { PayRequest } from "./PayRequest";
import { Student } from "./Student";
import { pickId } from "./helpers";
import { StoreItem } from "../models";

export const resolvers = {
  ...scalars,
  Query,
  Mutation,
  Subscription,
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
  },
  RedemptionRequest: {
    id: pickId,
    purchase: (parent: any) => ({ _id: parent.purchaseId }),
    student: (parent: any) => ({ _id: parent.studentId }),
    reviewedBy: (parent: any) => parent.reviewedByUserId ? ({ _id: parent.reviewedByUserId }) : null,
    status: (parent: any) => {
      // Convert database format (lowercase) to GraphQL enum format (UPPERCASE)
      return parent.status?.toUpperCase() || parent.status;
    },
  },
  Job: { id: pickId },
  JobApplication: { id: pickId },
  Employment: { id: pickId },
  Payslip: { id: pickId },
  ClassReason: { id: pickId },
  Notification: { id: pickId },
  PayRequestComment: { 
    id: pickId,
    user: (parent: any) => ({ _id: parent.userId }),
  },
};
