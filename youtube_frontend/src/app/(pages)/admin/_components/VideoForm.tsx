"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import Form from "react-bootstrap/Form";
import { Button } from "@/components/ui/button";
import { MdDelete, MdSend } from "react-icons/md";
import * as Yup from "yup";

interface videoFormProps {
  title?: string;
  description?: string;
  videoFile?: File;
  thumbnail?: File;
  onSubmit?: (formData: FormData) => void;
}

const VideoForm = ({
  title: existingTitle,
  description: existingDescription,
  videoFile: existingVideoFile,
  thumbnail: existingThumbnail,
  onSubmit = () => {},
}: videoFormProps) => {
  const video_data = {
    title: existingTitle || "",
    description: existingDescription || "",
    videoFile: existingVideoFile || "",
    thumbnail: existingThumbnail || "",
  };

  const video_schema = Yup.object().shape({
    title: Yup.string().required("Title is Required"),
    description: Yup.string().required("Description is Required"),
  });

  const [data, setData] = useState(video_data);

  const formik = useFormik({
    initialValues: data,
    validationSchema: video_schema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("videoFile", values.videoFile);
      formData.append("thumbnail", values.thumbnail);

      onSubmit(formData);
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <Form.Group className="mb-3 flex" controlId="title">
        <div className="w-[20%]">
          <Form.Label>Title : </Form.Label>
        </div>
        <div className="w-[100%]">
          <Form.Control
            className="w-[100%] border p-2"
            type="text"
            name="title"
            onChange={formik.handleChange}
            value={formik.values.title}
            placeholder="Enter title"
          />
          {formik.errors.title && formik.touched.title ? (
            <em className=" text-red-600">{formik.errors.title}</em>
          ) : null}
        </div>
      </Form.Group>

      <Form.Group className="mb-3 flex" controlId="description">
        <div className="w-[20%]">
          <Form.Label>Description : </Form.Label>
        </div>
        <div className="w-[100%]">
          <Form.Control
            className="w-[100%]  border p-2"
            type="text"
            name="description"
            onChange={formik.handleChange}
            value={formik.values.description}
            placeholder="Enter description"
          />
          {formik.errors.description && formik.touched.description ? (
            <em className=" text-red-600">{formik.errors.description}</em>
          ) : null}
        </div>
      </Form.Group>

      <Form.Group className="mb-3 flex" controlId="thumbnail">
        <div className="w-[20%]">
          <Form.Label>Thumbnail : </Form.Label>
        </div>
        <div className="w-[100%]">
          <Form.Control
            className="w-[100%] border  p-2"
            type="file"
            accept="image/*"
            name="thumbnail"
            onChange={(event: any) => {
              formik.values.thumbnail = event.currentTarget.files[0];
            }}
            required
          />
        </div>
      </Form.Group>

      <Form.Group className="mb-3 flex" controlId="videoFile">
        <div className="w-[20%]">
          <Form.Label>Video File : </Form.Label>
        </div>
        <div className="w-[100%]">
          <Form.Control
            className="w-[100%] border  p-2"
            type="file"
            accept="video/*"
            onChange={(event: any) => {
              formik.values.videoFile = event.currentTarget.files[0];
            }}
            required
          />
        </div>
      </Form.Group>

      <div className="space-x-3 ml">
        <Button className="w-40" variant={"destructive"} type="reset">
          <MdDelete className="w-5 h-5" />
          &nbsp; Cancel
        </Button>
        <Button
          type="submit"
          className="bg-green-500 w-40"
          disabled={formik.isSubmitting}
        >
          <MdSend className="w-5 h-5" />
          &nbsp; Submit
        </Button>
      </div>
    </form>
  );
};

export default VideoForm;
