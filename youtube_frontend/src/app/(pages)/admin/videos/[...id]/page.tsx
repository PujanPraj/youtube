"use client";

import React, { useEffect, useState } from "react";
import VideoForm from "../../_components/VideoForm";
import axios from "axios";
import { URL } from "@/constants/URL";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

interface VideoData {
  description: string;
  thumbnail: File;
  title: string;
  videoFile: File;
}

interface Props {
  params: any;
}

const EditVideo: React.FC<Props> = ({ params }) => {
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchVideo();
  }, []);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${URL}/videos/${params.id}`);

      if (response.data.success) {
        setVideoData(response.data.data);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData: FormData) => {
    try {
      setLoading(true);
      const response = await axios.put(`${URL}/videos/${params.id}`, formData, {
        // headers: {
        //   Authorization: `Bearer ${Cookies.get("token")}`,
        // },
      });
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button className="mb-10">
        <Link href={"/admin/videos"}>Go Back</Link>
      </Button>
      {loading && <p>Loading...</p>}
      {videoData && (
        <VideoForm
          description={videoData.description}
          thumbnail={videoData.thumbnail}
          title={videoData.title}
          videoFile={videoData.videoFile}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
};

export default EditVideo;
