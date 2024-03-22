import Link from "next/link";
import { AdminSidebarLink } from "./SidebarLink";

export const AdminSidebar = () => {
  return (
    <aside className="hidden sticky top-0 lg:flex flex-col overflow-y-auto overflow-x-hidden">
      {/* logo start */}
      <Link href="#">
        <h1 className="font-bold text-2xl">LOGO</h1>
      </Link>
      {/* //logo end */}
      <div className="mt-5 flex flex-1 flex-col justify-between">
        <nav className="-mx-3 space-y-4 ">
          {/* ...............DASHBOARD START..................  */}
          <div className="space-y-4">
            <div className="links space-y-2">
              <AdminSidebarLink href="/admin/dashboard" text="Dashboard" />
              <AdminSidebarLink href="/admin/createVideo" text="CreateVideo" />
              <AdminSidebarLink href="/admin/videos" text="Videos" />
              <AdminSidebarLink href="/admin/transaction" text="Transaction" />
            </div>
          </div>
          {/* ...............DASHBOARD END..................  */}
        </nav>
      </div>
    </aside>
  );
};
