"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { URL } from "@/constants/URL";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";

interface videoData {
  videoId: string;
  title: string;
  duration: number;
  views: number;
  isPublished: boolean;
}

const Videos = () => {
  const [data, setData] = useState<videoData[]>([]);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    fetchAllVideos();
  }, []);

  const fetchAllVideos = async () => {
    try {
      const response = await axios.get(`${URL}/videos`);
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (_id: string) => {
    try {
      setLoadingStates((prevLoadingStates) => ({
        ...prevLoadingStates,
        [_id]: true,
      }));
      const response = await axios.delete(`${URL}/videos/${_id}`);
      if (response.data.success) {
        toast.success(response.data.message);
        fetchAllVideos();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingStates((prevLoadingStates) => ({
        ...prevLoadingStates,
        [_id]: false,
      }));
    }
  };

  return (
    <div>
      <Table className="bg-gray-50 rounded-md ">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Owner</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>isPublished</TableHead>
            <TableHead className="text-right "></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((value: any) => (
            <TableRow key={value._id}>
              <TableCell className="font-medium flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={value.owner.avatar?.url} />
                  <AvatarFallback>
                    {value.owner.username.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {value.owner.username}
              </TableCell>
              <TableCell>{value.title}</TableCell>
              <TableCell>{value.duration}</TableCell>
              <TableCell>{value.views}</TableCell>
              <TableCell>
                {value.isPublished ? "Published" : "Not Published"}
              </TableCell>
              <TableCell className="text-right">
                <div className="space-x-3">
                  <Button className="bg-green-500">
                    <Link href={`/admin/videos/${value._id}`}>Edit</Link>
                  </Button>
                  <Button
                    onClick={() => handleDelete(value._id)}
                    variant={"destructive"}
                    disabled={loadingStates[value._id]}
                  >
                    {loadingStates[value._id] ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Videos;
