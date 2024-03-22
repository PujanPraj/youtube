"use client";

import { URL } from "@/constants/URL";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";

interface Video {
  _id: string;
  videoFile: string;
  thumbnail: string;
  title: string;
  description: string;
  duration: number;
  views: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

interface Comment {
  _id: string;
  comment: string;
}

const VideoFetch = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    const fetchAllVideo = async () => {
      try {
        const response = await axios.get(`${URL}/videos`);

        if (response.data.success) {
          setVideos(response.data.data);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };

    fetchAllVideo();
  }, []);

  return (
    <>
      <div className="flex gap-x-5">
        {videos.map((video) => {
          const {
            _id,
            thumbnail,
            title,
            description,
            videoFile,
            views,
            duration,
            comments,
          } = video;
          return (
            <div key={_id} className="w-[300px] rounded-md border">
              <video controls>
                <source src={videoFile} type="video/mp4" />
              </video>

              <div className="p-4">
                <h1 className="text-lg font-semibold">{title}</h1>
                <p className="mt-3 text-sm text-gray-600">{description}</p>
                <p className="mt-3 text-sm text-gray-600">views : {views}</p>
                <p className="mt-3 text-sm text-gray-600">
                  duration : {duration}
                </p>
                <div className="mt-3">
                  <p className="text-sm">Comments:</p>
                  <ul>
                    {comments.map((comment) => (
                      <li className="text-xs" key={comment._id}>
                        - {comment.comment}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default VideoFetch;
