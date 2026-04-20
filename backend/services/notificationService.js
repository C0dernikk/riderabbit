import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

export const createNotification = async ({
  recipientId,
  type,
  title,
  message,
  relatedEntityType = "",
  relatedEntityId = null,
  metadata = {},
}) => {
  if (!recipientId) {
    return null;
  }

  return Notification.create({
    recipientId,
    type,
    title,
    message,
    relatedEntityType,
    relatedEntityId,
    metadata,
  });
};

export const createNotifications = async (notifications = []) => {
  const validNotifications = notifications.filter((notification) => notification?.recipientId);

  if (!validNotifications.length) {
    return [];
  }

  return Notification.insertMany(validNotifications, { ordered: false });
};

export const notifyUsers = async ({
  recipientIds = [],
  type,
  title,
  message,
  relatedEntityType = "",
  relatedEntityId = null,
  metadata = {},
}) => {
  const uniqueRecipientIds = [...new Set(recipientIds.map((id) => id?.toString()).filter(Boolean))];

  return createNotifications(
    uniqueRecipientIds.map((recipientId) => ({
      recipientId,
      type,
      title,
      message,
      relatedEntityType,
      relatedEntityId,
      metadata,
    }))
  );
};

export const notifyUsersByRole = async ({
  role,
  type,
  title,
  message,
  relatedEntityType = "",
  relatedEntityId = null,
  metadata = {},
}) => {
  const users = await User.find({ role }).select("_id");

  return notifyUsers({
    recipientIds: users.map((user) => user._id),
    type,
    title,
    message,
    relatedEntityType,
    relatedEntityId,
    metadata,
  });
};
