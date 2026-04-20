import Notification from "../models/notificationModel.js";
import { errorHandler } from "../utils/error.js";

export const getMyNotifications = async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 20));
    const unreadOnly = req.query.unreadOnly === "true";

    const filter = {
      recipientId: req.user,
    };

    if (unreadOnly) {
      filter.isRead = false;
    }

    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Notification.countDocuments({
        recipientId: req.user,
        isRead: false,
      }),
      Notification.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      page,
      total,
      unreadCount,
      notifications,
    });
  } catch (error) {
    return next(errorHandler(500, "Error fetching notifications"));
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.notificationId,
      recipientId: req.user,
    });

    if (!notification) {
      return next(errorHandler(404, "Notification not found"));
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    return next(errorHandler(500, "Error updating notification"));
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        recipientId: req.user,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return next(errorHandler(500, "Error updating notifications"));
  }
};
