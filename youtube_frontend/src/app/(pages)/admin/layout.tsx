import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { AdminSidebar } from "./_components/Sidebar";
import { AdminNavbar } from "./_components/AdminNavbar";
import { Toaster } from "react-hot-toast";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          minSize={18}
          maxSize={20}
          defaultSize={18}
          className="bg-gray-50 px-5 py-2 hover:bg-gray-100 transition-colors duration-200"
        >
          <AdminSidebar />
        </ResizablePanel>
        <ResizableHandle className="bg-gray-300" />
        <ResizablePanel>
          <AdminNavbar />
          <div className="p-5">{children}</div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster position="top-right" />
    </>
  );
};

export default AdminLayout;
