import mongoose from "mongoose";
import Message from "../models/messageModel.js";
import { errorHandler } from "../utils/error.js";

export const getMessagesByBookingId = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const messages = await Message.find({ bookingId })
      .populate("senderId", "name profilePicture")
      .populate("receiverId", "name profilePicture")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    return next(errorHandler(500, "Failed to fetch messages"));
  }
};

export const getInbox = async (req, res, next) => {
  try {
    const userId = req.user;

    const inbox = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$bookingId",
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "_id",
          as: "bookingDetails",
        },
      },
      {
        $unwind: "$bookingDetails",
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "bookingDetails.vehicleId",
          foreignField: "_id",
          as: "vehicleDetails",
        },
      },
      {
        $unwind: { path: "$vehicleDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          let: {
            sender: "$lastMessage.senderId",
            receiver: "$lastMessage.receiverId",
            currentUserId: new mongoose.Types.ObjectId(userId),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    "$_id",
                    {
                      $cond: {
                        if: { $eq: ["$$sender", "$$currentUserId"] },
                        then: "$$receiver",
                        else: "$$sender",
                      },
                    },
                  ],
                },
              },
            },
            {
              $project: { name: 1, username: 1, profilePicture: 1 },
            },
          ],
          as: "otherParty",
        },
      },
      {
        $unwind: { path: "$otherParty", preserveNullAndEmptyArrays: true },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      inbox,
    });
  } catch (error) {
    console.error(error);
    return next(errorHandler(500, "Failed to fetch inbox"));
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user;
    const count = await Message.countDocuments({ receiverId: userId, isRead: false });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    return next(errorHandler(500, "Failed to get unread count"));
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user;
    await Message.updateMany(
      { bookingId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    return next(errorHandler(500, "Failed to mark as read"));
  }
};
