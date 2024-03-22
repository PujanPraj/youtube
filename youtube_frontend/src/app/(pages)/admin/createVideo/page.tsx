"use client";

import React, { useState } from "react";
import VideoForm from "../_components/VideoForm";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import { URL } from "@/constants/URL";

const CreateVideo = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(`${URL}/videos`, formData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <VideoForm onSubmit={handleSubmit} />
      {isSubmitting && (
        <p className="flex justify-center mt-10">Submitting...</p>
      )}
    </div>
  );
};

export default CreateVideo;
