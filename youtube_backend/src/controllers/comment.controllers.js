import mongoose, { mongo } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "express-async-handler";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

export const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  page = isNaN(page) ? 1 : Number(page);
  limit = isNaN(limit) ? 10 : Number(limit);

  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 10;
  }

  const comment = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "commentedBy",
        foreignField: "_id",
        as: "commentedBy",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              fullname: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    {
      $addFields: {
        commentedBy: {
          $first: "$commentedBy",
        },
        likes: {
          $size: "$likes",
        },
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  res.status(200).json(new ApiResponse(200, comment, "Get comments success"));
});

export const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new Error("Video not found with provided id");
  }

  const user = await User.findById(req.user._id).select(
    "username fullName avatar"
  );
  if (!user) {
    throw new Error("User not found with provided token");
  }

  if (!req.body.comment) {
    throw new Error("comment is required");
  }

  const comment = await Comment.create({
    comment: req?.body?.comment,
    video: video,
    commentedBy: user,
  });

  if (!comment) {
    throw new Error("Failed to create comment");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Comment created successfully", comment));
});

export const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const findComment = await Comment.findById(commentId);
  if (!findComment) {
    throw new Error("Comment not found");
  }

  if (findComment.commentedBy.toString() !== req.user._id.toString()) {
    throw new Error("You are not authorized to update this comment");
  }

  if (!req.body.comment) {
    throw new Error("comment is required to update");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        comment: req.body.comment,
      },
    },
    {
      new: true,
    }
  );

  if (!comment) {
    throw new Error("Failed to update comment");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Comment updated successfully", comment));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const findComment = await Comment.findById(commentId);
  if (!findComment) {
    throw new Error("Comment not found");
  }

  if (findComment.commentedBy.toString() !== req.user._id.toString()) {
    throw new Error("You are not authorized to delete this comment");
  }

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) {
    throw new Error("Failed to delete comment");
  }

  res.status(200).json(new ApiResponse(200, "Comment deleted successfully"));
});
