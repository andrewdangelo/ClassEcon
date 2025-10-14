import { Types } from "mongoose";
import { Notification } from "../models";
import { pubsub } from "../pubsub";

export const NOTIFICATION_EVENTS = {
  NOTIFICATION_RECEIVED: "NOTIFICATION_RECEIVED",
};

export interface CreateNotificationInput {
  userId: Types.ObjectId | string;
  type: string;
  title: string;
  message: string;
  relatedId?: Types.ObjectId | string;
  relatedType?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  const notification = await Notification.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    relatedId: input.relatedId,
    relatedType: input.relatedType,
    isRead: false,
  });

  const notificationObj = notification.toObject();

  // Publish to subscription
  pubsub.publish(NOTIFICATION_EVENTS.NOTIFICATION_RECEIVED, {
    notificationReceived: notificationObj,
  });

  return notificationObj;
}

export async function createPayRequestNotification(
  payRequest: any,
  teacherIds: (Types.ObjectId | string)[],
  type: "submitted" | "approved" | "denied" | "rebuked" | "paid"
) {
  const notifications = [];

  switch (type) {
    case "submitted":
      // Notify all teachers of the class
      for (const teacherId of teacherIds) {
        notifications.push(
          createNotification({
            userId: teacherId,
            type: "PAY_REQUEST_SUBMITTED",
            title: "New Payment Request",
            message: `A student has submitted a payment request for $${payRequest.amount}`,
            relatedId: payRequest._id || payRequest.id,
            relatedType: "PayRequest",
          })
        );
      }
      break;

    case "approved":
      // Notify the student
      notifications.push(
        createNotification({
          userId: payRequest.studentId,
          type: "PAY_REQUEST_APPROVED",
          title: "Request Approved",
          message: `Your payment request for $${payRequest.amount} has been approved`,
          relatedId: payRequest._id || payRequest.id,
          relatedType: "PayRequest",
        })
      );
      break;

    case "paid":
      // Notify the student
      notifications.push(
        createNotification({
          userId: payRequest.studentId,
          type: "PAY_REQUEST_PAID",
          title: "Payment Completed",
          message: `Your payment request for $${payRequest.amount} has been paid`,
          relatedId: payRequest._id || payRequest.id,
          relatedType: "PayRequest",
        })
      );
      break;

    case "denied":
      // Notify the student
      notifications.push(
        createNotification({
          userId: payRequest.studentId,
          type: "PAY_REQUEST_DENIED",
          title: "Request Denied",
          message: `Your payment request for $${payRequest.amount} has been denied`,
          relatedId: payRequest._id || payRequest.id,
          relatedType: "PayRequest",
        })
      );
      break;

    case "rebuked":
      // Notify the student
      notifications.push(
        createNotification({
          userId: payRequest.studentId,
          type: "PAY_REQUEST_REBUKED",
          title: "Request Needs Revision",
          message: `Your payment request for $${payRequest.amount} needs more information`,
          relatedId: payRequest._id || payRequest.id,
          relatedType: "PayRequest",
        })
      );
      break;
  }

  return Promise.all(notifications);
}

export async function createRedemptionNotification(
  redemptionRequest: any,
  purchase: any,
  storeItem: any,
  teacherIds: (Types.ObjectId | string)[],
  type: "submitted" | "approved" | "denied"
) {
  const notifications = [];

  switch (type) {
    case "submitted":
      // Notify all teachers of the class
      for (const teacherId of teacherIds) {
        notifications.push(
          createNotification({
            userId: teacherId,
            type: "REDEMPTION_SUBMITTED",
            title: "New Redemption Request",
            message: `A student wants to redeem: ${storeItem.title}`,
            relatedId: redemptionRequest._id || redemptionRequest.id,
            relatedType: "RedemptionRequest",
          })
        );
      }
      break;

    case "approved":
      // Notify the student
      notifications.push(
        createNotification({
          userId: redemptionRequest.studentId,
          type: "REDEMPTION_APPROVED",
          title: "Redemption Approved",
          message: `Your redemption request for "${storeItem.title}" has been approved`,
          relatedId: redemptionRequest._id || redemptionRequest.id,
          relatedType: "RedemptionRequest",
        })
      );
      break;

    case "denied":
      // Notify the student
      notifications.push(
        createNotification({
          userId: redemptionRequest.studentId,
          type: "REDEMPTION_DENIED",
          title: "Redemption Denied",
          message: `Your redemption request for "${storeItem.title}" has been denied`,
          relatedId: redemptionRequest._id || redemptionRequest.id,
          relatedType: "RedemptionRequest",
        })
      );
      break;
  }

  return Promise.all(notifications);
}

export async function createJobPostedNotification(job: any) {
  // Import here to avoid circular dependencies
  const { Membership } = await import("../models");
  
  // Get all students in the class
  const memberships = await Membership.find({
    classIds: job.classId,
    role: "STUDENT",
  }).lean().exec();

  const notifications = memberships.map((membership) =>
    createNotification({
      userId: membership.userId,
      type: "JOB_POSTED",
      title: "New Job Available",
      message: `A new job has been posted: ${job.title}`,
      relatedId: job._id || job.id,
      relatedType: "Job",
    })
  );

  return Promise.all(notifications);
}

export async function createJobApplicationNotification(
  application: any,
  job: any
) {
  // Import here to avoid circular dependencies
  const { Membership } = await import("../models");
  
  // Get all teachers in the class
  const memberships = await Membership.find({
    classIds: application.classId,
    role: "TEACHER",
  }).lean().exec();

  const notifications = memberships.map((membership) =>
    createNotification({
      userId: membership.userId,
      type: "JOB_APPLICATION_RECEIVED",
      title: "New Job Application",
      message: `A student has applied for: ${job.title}`,
      relatedId: application._id || application.id,
      relatedType: "JobApplication",
    })
  );

  return Promise.all(notifications);
}

export async function createJobApprovalNotification(
  application: any,
  job: any,
  approved: boolean,
  reason?: string
) {
  if (approved) {
    return createNotification({
      userId: application.studentId,
      type: "JOB_APPLICATION_APPROVED",
      title: "Application Approved!",
      message: `Congratulations! You've been hired for: ${job.title}`,
      relatedId: application._id || application.id,
      relatedType: "JobApplication",
    });
  } else {
    return createNotification({
      userId: application.studentId,
      type: "JOB_APPLICATION_REJECTED",
      title: "Application Not Selected",
      message: reason 
        ? `Your application for "${job.title}" was not selected. Reason: ${reason}`
        : `Your application for "${job.title}" was not selected.`,
      relatedId: application._id || application.id,
      relatedType: "JobApplication",
    });
  }
}

export async function createFineNotification(
  fine: any,
  studentName: string
) {
  return createNotification({
    userId: fine.studentId,
    type: "FINE_ISSUED",
    title: "Fine Issued",
    message: `You have been fined CE$ ${fine.amount} for: ${fine.reason}`,
    relatedId: fine._id || fine.id,
    relatedType: "Fine",
  });
}

export async function createFineWaivedNotification(
  fine: any,
  studentName: string
) {
  return createNotification({
    userId: fine.studentId,
    type: "FINE_WAIVED",
    title: "Fine Waived",
    message: `Your fine of CE$ ${fine.amount} has been waived. Reason: ${fine.waivedReason}`,
    relatedId: fine._id || fine.id,
    relatedType: "Fine",
  });
}

