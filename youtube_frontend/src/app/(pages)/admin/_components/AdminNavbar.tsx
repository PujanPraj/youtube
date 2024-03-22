"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

export const AdminNavbar = () => {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");

  //get user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/users/me", {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });

        if (response.data.success) {
          setUsername(response.data.data.username);
          setAvatar(response.data.data.avatar.url);
        } else {
          console.log("Failed to get user data:", response.data.message);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };

    fetchUserData();
  }, []);

  //handle logout
  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/logoutUser",
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );
      if (response.data.success) {
        Cookies.remove("token");
        localStorage.removeItem("token");
        toast.success(response.data.message);
        router.push("/login");
      } else {
        console.log("Login failed:", response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="flex justify-end  space-x-5 bg-gray-100 px-5 py-2">
      <Button>
        <Link href={"/"}>Profile</Link>
      </Button>

      <div className="flex items-center gap-x-5">
        <Avatar>
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-gray-700 text-white">
            {username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <h5 className="font-bold">{username.toUpperCase()}</h5>
      </div>
      <Dialog>
        <DialogTrigger className="bg-gray-800 text-white px-3 radius rounded-md">
          Logout
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-5">
              Are you sure you want to logout?
            </DialogTitle>
            <Button onClick={handleLogout}>Logout</Button>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
