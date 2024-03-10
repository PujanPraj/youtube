import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "express-async-handler";

//create tweet
export const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new Error("Content is required");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Tweet created successfully", tweet));
});

//get a user tweet
export const getUserTweet = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  let { page = 1, limit = 10 } = req.query;

  page = isNaN(page) ? 1 : Number(page);
  limit = isNaN(limit) ? 10 : Number(limit);

  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 10;
  }

  const tweet = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
        likes: {
          $size: "$likes",
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  if (tweet.length === 0) {
    return res.status(404).json(new ApiResponse(404, "No tweet found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet fetched successfully", tweet));
});

//get all tweets
export const getAllTweets = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = isNaN(page) ? 1 : Number(page);
  limit = isNaN(limit) ? 10 : Number(limit);
  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    limit = 10;
  }

  const tweet = await Tweet.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
        likes: {
          $size: "$likes",
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ]);

  if (tweet.length === 0) {
    return res.status(404).json(new ApiResponse(404, "No tweet found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet fetched successfully", tweet));
});

//update a tweet
export const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!(tweetId && isValidObjectId(tweetId))) {
    throw new Error("No tweet id or invalid");
  }

  const findTweet = await Tweet.findById(tweetId);
  if (!findTweet) {
    throw new Error("Tweet not found");
  }

  if (findTweet.owner.toString() !== req.user._id.toString()) {
    throw new Error("You are not authorized to update this tweet");
  }

  if (!content) {
    throw new Error("Content is required to update");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully", tweet));
});

//delete a tweet

export const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!(tweetId && isValidObjectId(tweetId))) {
    throw new Error("No tweet id or invalid");
  }

  const findTweet = await Tweet.findById(tweetId);
  if (!findTweet) {
    throw new Error("Tweet not found");
  }

  if (findTweet.owner.toString() !== req.user._id.toString()) {
    throw new Error("You are not authorized to delete this tweet");
  }

  const tweet = await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully"));
});
