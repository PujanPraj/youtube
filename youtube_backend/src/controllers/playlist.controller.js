import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import asyncHandler from "express-async-handler";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";

//create a playlist
export const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!(name && description)) {
    throw new Error("Name and description are required");
  }

  const createPlayList = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  const playList = await Playlist.findById(createPlayList.id).populate(
    "owner",
    "username fullName avatar"
  );

  res
    .status(201)
    .json(new ApiResponse(201, "Playlist created successfully", playList));
});

//get user play list
export const getUserPlaylists = asyncHandler(async (req, res) => {
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

  if (!(userId && isValidObjectId(userId))) {
    throw new Error("No user id or invalid");
  }

  const playList = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
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

  res
    .status(200)
    .json(new ApiResponse(200, "Playlists fetched successfully", playList));
});

//get by playlist id
export const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!(playlistId && isValidObjectId(playlistId))) {
    throw new Error("No user id or invalid");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new Error("Playlist not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Playlist fetched successfully", playlist));
});

//add video to playlist
export const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId && isValidObjectId(playlistId))) {
    throw new Error("No user id or invalid");
  }
  if (!(videoId && isValidObjectId(videoId))) {
    throw new Error("No video id or invalid");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new Error("Playlist not found");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new Error("Video not found");
  }

  console.log(playlist.owner.toString());
  console.log(req.user._id.toString());

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new Error("Your are not authorized to add a video to this playlist");
  }

  if (playlist.videos.includes(videoId)) {
    throw new Error("Video already added to playlist");
  }

  playlist.videos.push(video);
  await playlist.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, "Video added to playlist successfully", playlist)
    );
});

//delete video from playlist
export const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId && isValidObjectId(playlistId))) {
    throw new Error("No user id or invalid");
  }
  if (!(videoId && isValidObjectId(videoId))) {
    throw new Error("No video id or invalid");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new Error("Playlist not found");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new Error("Video not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new Error(
      "Yourare not authorized to delete a video from this playlist"
    );
  }

  const videoIndex = playlist.videos.indexOf(videoId);

  playlist.videos.splice(videoIndex, 1);
  await playlist.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Video removed from playlist successfully"));
});

export const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!(playlistId && isValidObjectId(playlistId))) {
    throw new Error("No user id or invalid");
  }

  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new Error("Playlist not found");
  }

  if (findPlaylist.owner.toString() !== req.user._id.toString()) {
    throw new Error("You are not authorized to delete this playlist");
  }

  const playlist = await Playlist.findByIdAndDelete(playlistId);

  res.status(200).json(new ApiResponse(200, "Playlist deleted successfully"));
});

export const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!(playlistId && isValidObjectId(playlistId))) {
    throw new Error("No user id or invalid");
  }

  const findPlaylist = await Playlist.findById(playlistId);
  if (!findPlaylist) {
    throw new Error("Playlist not found");
  }

  if (findPlaylist.owner.toString() !== req.user._id.toString()) {
    throw new Error("You are not authorized to update this playlist");
  }

  if (!(name || description)) {
    throw new Error("Name or description are required to update playlist");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    { name, description },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Playlist updated successfully", playlist));
});
