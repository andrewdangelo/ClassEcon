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
