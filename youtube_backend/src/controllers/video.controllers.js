import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import asyncHandler from "express-async-handler";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

//publish a video
export const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!(title.trim() && description.trim())) {
    throw new Error("Title and description are required");
  }

  if (
    !req.files &&
    !Array.isArray(req.files.videoFile) &&
    !req.files.videoFile.length > 0
  ) {
    throw new Error("video file is required");
  }

  const videoFileLocalPath = req.files.videoFile[0].path;
  const uploadVideoFile = await uploadOnCloudinary(
    videoFileLocalPath,
    "videos"
  );

  if (!uploadVideoFile) {
    throw new Error("video file upload failed");
  }

  if (
    !req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    throw new Error("thumbnail is required");
  }

  const thumbnailLocalPath = req.files.thumbnail[0].path;
  const uploadThumbnail = await uploadOnCloudinary(
    thumbnailLocalPath,
    "thumbnails"
  );

  if (!uploadThumbnail) {
    throw new Error("thumbnail upload failed");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: uploadVideoFile.url,
    thumbnail: uploadThumbnail.url,
    duration: Math.round(uploadVideoFile.duration),
    owner: req.user._id,
  });

  if (!video) {
    await deleteFromCloudinary(uploadVideoFile.url);
    await deleteFromCloudinary(uploadOnCloudinary.url);
    throw new Error("Failed to upload video");
  }

  res
    .status(201)
    .json(new ApiResponse(201, "Video created successfully", video));
});

//get video by id
export const getAVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  let video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
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
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
        pipeline: [
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
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              comment: 1,
              commentedBy: 1,
            },
          },
          {
            $addFields: {
              commentedBy: {
                $first: "$commentedBy",
              },
            },
          },
        ],
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
        views: {
          $add: [1, "$views"],
        },
      },
    },
  ]);

  if (!video) {
    throw new Error("Video not found");
  }

  if (video) {
    video = video[0];
  }

  await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        views: video.views,
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Video fetched successfully", video));
});

//get all vidoes
export const getAllVideos = asyncHandler(async (req, res) => {
  let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  page = isNaN(page) ? 1 : Number(page);
  limit = isNaN(limit) ? 10 : Number(limit);

  if (page <= 0) {
    page = 1;
  }
  if (limit <= 0) {
    page = 10;
  }

  const matchStage = {};
  if (userId && isValidObjectId(userId)) {
    matchStage["$match"] = {
      owner: new mongoose.Types.ObjectId(userId),
    };
  } else if (query) {
    matchStage["$match"] = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    };
  } else {
    matchStage["$match"] = {};
  }

  if (userId && query) {
    matchStage["$match"] = {
      $and: [
        { owner: new mongoose.Types.ObjectId(userId) },
        {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ],
        },
      ],
    };
  }

  const joinOwnerStage = {
    $lookup: {
      from: "users",
      localField: "owner",
      foreignField: "_id",
      as: "owner",
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
  };

  const addCommentsStage = {
    $lookup: {
      from: "comments",
      localField: "_id",
      foreignField: "video",
      as: "comments",
      pipeline: [
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
                  fullName: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $project: {
            comment: 1,
            commentedBy: 1,
          },
        },
        {
          $addFields: {
            commentedBy: {
              $first: "$commentedBy",
            },
          },
        },
      ],
    },
  };

  const addFieldStage = {
    $addFields: {
      owner: {
        $first: "$owner",
      },
    },
  };

  const sortStage = {};
  if (sortBy && sortType) {
    sortStage["$sort"] = {
      [sortBy]: sortType === "asc" ? 1 : -1,
    };
  } else {
    sortStage["$sort"] = {
      createdAt: -1,
    };
  }

  const skipStage = { $skip: (page - 1) * limit };
  const limitStage = { $limit: limit };

  const videos = await Video.aggregate([
    matchStage,
    joinOwnerStage,
    addFieldStage,
    addCommentsStage,
    sortStage,
    skipStage,
    limitStage,
  ]);

  res.status(200).json(new ApiResponse(200, videos, "Get videos success"));
});

//updage a video
export const updateAVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new Error("Video not found");
  }

  try {
    if (title) {
      video.title = title;
    }

    if (description) {
      video.description = description;
    }

    if (req.file) {
      if (video.thumbnail) {
        await deleteFromCloudinary(video.thumbnail);
      }

      const newThumbnailLocalPath = req.file.path;
      const uploadThumbnail = await uploadOnCloudinary(
        newThumbnailLocalPath,
        "thumbnails"
      );

      if (!uploadThumbnail) {
        throw new Error("thumbnail upload failed");
      }

      video.thumbnail = uploadThumbnail.url;
    }

    const updatedVideo = await video.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "Video updated successfully", updatedVideo));
  } catch (error) {
    throw new Error("Failed to update video");
  }
});

//delete a video
export const deleteAVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new Error("Video not found");
  }

  if (video.thumbnail) {
    await deleteFromCloudinary(video.thumbnail);
  }

  if (video.videoFile) {
    await deleteFromCloudinary(video.videoFile, "video");
  }

  const deletedVideo = await Video.findByIdAndDelete(video.id);

  if (!deletedVideo) {
    throw new Error("Failed to delete video");
  }

  res.status(200).json(new ApiResponse(200, "Video deleted successfully"));
});

//toggle publish status
export const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new Error("Video not found");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Video status update success", video));
});
