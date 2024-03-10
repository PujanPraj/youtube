import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "express-async-handler";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new Error("Video not found with provided id");
  }

  let likes;
  const isAlreadyLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
  if (isAlreadyLiked) {
    await Like.deleteOne({ video: videoId, likedBy: req.user._id });
    likes = false;
  } else {
    await Like.create({ video: video, likedBy: req.user._id });
    likes = true;
  }

  const message = likes ? "video liked" : "like removed from video";

  return res.status(200).json(new ApiResponse(200, message, likes));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new Error("Comment not found with provided id");
  }

  let likes;
  const isAlreadyLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });
  if (isAlreadyLiked) {
    await Like.deleteOne({ comment: commentId, likedBy: req.user._id });
    likes = false;
  } else {
    await Like.create({ comment: comment, likedBy: req.user._id });
    likes = true;
  }

  const message = likes ? "comment liked" : "like removed from comment";

  return res.status(200).json(new ApiResponse(200, message, likes));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new Error("Tweet not found with provided id");
  }

  let likes;
  const isAlreadyLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  if (isAlreadyLiked) {
    await Like.deleteOne({ tweet: tweetId, likedBy: req.user._id });
    likes = false;
  } else {
    await Like.create({ tweet: tweet, likedBy: req.user._id });
    likes = true;
  }

  const message = likes ? "tweet liked" : "like removed from tweet";

  return res.status(200).json(new ApiResponse(200, message, likes));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const video = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: {
          $exists: true,
        },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $project: {
              videoFile: 1,
              thumbnail: 1,
              title: 1,
              description: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        video: {
          $first: "$video",
        },
      },
    },
    {
      $project: {
        video: 1,
      },
    },
    {
      $replaceRoot: {
        newRoot: "$video",
      },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videosCount: video.length, video },
        "Get liked videos success"
      )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
