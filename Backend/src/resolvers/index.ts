import { scalars } from "./scalars";
import { Query } from "./Query";
import { Mutation } from "./Mutation";
import { Subscription } from "./Subscription";
import { Class } from "./Class";
import { PayRequest } from "./PayRequest";
import { Student } from "./Student";
import { pickId } from "./helpers";

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
  Purchase: { id: pickId },
  Job: { id: pickId },
  JobApplication: { id: pickId },
  Employment: { id: pickId },
  Payslip: { id: pickId },
  ClassReason: { id: pickId },
  PayRequestComment: { 
    id: pickId,
    user: (parent: any) => ({ _id: parent.userId }),
  },
};
