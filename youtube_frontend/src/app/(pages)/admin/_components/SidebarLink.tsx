import Link from "next/link";
import React from "react";

interface AdminSidebarLinkProps {
  href: string;
  text: string;
}

export const AdminSidebarLink = ({ href, text }: AdminSidebarLinkProps) => {
  return (
    <>
      <Link
        className="flex transform items-center rounded-lg px-3 py-2 text-gray-600 transition-colors duration-300 hover:bg-white hover:text-gray-700"
        href={href}
      >
        <span className="mx-2 text-sm font-medium">{text}</span>
      </Link>
    </>
  );
};
