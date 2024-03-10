import {
  User,
  generateAccessToken,
  generateRefreshToken,
} from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import { ApiResponse } from "../utils/ApiResponse.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//register user
export const registerUser = asyncHandler(async (req, res) => {
  const { email, avatar, coverImage } = req.body;

  const findUser = await User.findOne({ email });
  if (findUser) {
    return res.status(400).json(new ApiResponse(400, "User already exists"));
  }

  //upload avatar using cloudinary
  if (!avatar) {
    throw new Error("Avatar file is required!!!");
  }

  let uploadedAvatar;
  if (avatar) {
    const result = await cloudinary.uploader.upload(avatar, {
      folder: "avatars",
    });
    uploadedAvatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  let uploadedCoverImage;
  if (coverImage) {
    const result = await cloudinary.uploader.upload(coverImage, {
      folder: "CoverImages",
    });
    uploadedCoverImage = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  const newUser = await User.create({
    fullName: req?.body?.fullName,
    username: req?.body?.username,
    email: req?.body?.email,
    password: req?.body?.password,
    avatar: uploadedAvatar,
    coverImage: uploadedCoverImage,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", newUser));
});

//login user
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid Credentials");
  }

  try {
    if (user && (await user.isPasswordMatch(password))) {
      const accessToken = await generateAccessToken(user._id);
      const refreshToken = await generateRefreshToken(user._id);

      user.refreshToken = refreshToken;
      user.save();

      const options = {
        httpOnly: true,
        secure: true,
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(200, "User logged in successfully", {
            username: user?.username,
            fullName: user?.fullName,
            email: user?.email,
            accessToken,
          })
        );
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//logout user
export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully"));
});

// refresh access token
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new Error("unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?.id);

    if (!user) {
      throw new Error("Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new Error("Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const accessToken = await generateAccessToken(user._id);
    const newRefreshToken = await generateRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new Error(error?.message || "Invalid refresh token");
  }
});

//get user by id
export const getUserById = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    res
      .status(200)
      .json(new ApiResponse(200, "User fetched successfully", user));
  } catch (error) {
    throw new Error(error);
  }
});

//update user
export const updateUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        username: req?.body?.username,
        fullName: req?.body?.fullName,
        email: req?.body?.email,
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "User updated successfully", user));
  } catch (error) {
    throw new Error(error);
  }
});

//update password
export const updatePassword = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!(currentPassword && newPassword && confirmPassword)) {
    throw new Error(
      "current password, new password and confirm password are required"
    );
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user && (await user.isPasswordMatch(currentPassword))) {
      if (newPassword == currentPassword) {
        throw new Error("new password cannot be same as current password");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("confirm password must be same as new password");
      }

      user.password = newPassword;
      user.save({
        validateBeforeSave: false,
      });

      return res
        .status(200)
        .json(new ApiResponse(200, "Password updated successfully"));
    } else {
      throw new Error("Invalid current password");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//update avatar
export const updateAvatar = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!avatar) {
      throw new Error("avatar file is required!!!");
    }

    if (avatar && user) {
      if (user?.avatar?.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);

        const result = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
        });

        user.avatar = {
          public_id: result.public_id,
          url: result.url,
        };
      } else {
        const result = await cloudinary.uploader.upload(avatar, {
          folder: "avatars",
        });

        user.avatar = {
          public_id: result.public_id,
          url: result.url,
        };
      }
    }

    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "avatar updated successfully"));
  } catch (error) {
    throw new Error(error);
  }
});

//update cover image
export const updateCoverImg = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { coverImg } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!coverImg) {
      throw new Error("coverImg file is required!!!");
    }

    if (coverImg && user) {
      if (user?.coverImage?.public_id) {
        await cloudinary.uploader.destroy(user.coverImage.public_id);

        const result = await cloudinary.uploader.upload(coverImg, {
          folder: "coverImages",
        });

        user.coverImage = {
          public_id: result.public_id,
          url: result.url,
        };
      } else {
        const result = await cloudinary.uploader.upload(coverImg, {
          folder: "coverImages",
        });

        user.coverImage = {
          public_id: result.public_id,
          url: result.url,
        };
      }
    }

    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "cover image updated successfully"));
  } catch (error) {
    throw new Error(error);
  }
});

//delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByIdAndDelete(userId);
    return res
      .status(200)
      .json(new ApiResponse(200, "User deleted successfully"));
  } catch (error) {
    throw new Error(error);
  }
});

//get user channel profile
export const getChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new Error("Username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscriber"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        username: 1,
        isSubscribed: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new Error("Channel is empty");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User fetched successfully", channel[0]));
});

//get watch history
export const getWatchHistory = asyncHandler(async (req, res) => {
  clear;

  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
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
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Watch history fetched successfully",
        user[0].watchHistory
      )
    );
});
