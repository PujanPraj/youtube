import { Button } from "@/components/ui/button";
import Link from "next/link";

const Navbar = () => {
  return (
    <div>
      <h1 className="text-center text-4xl mt-5">
        Welome to{" "}
        <span className="text-red-800 font-black">Youtube Project</span>
      </h1>
      <br />
      <div className="flex gap-x-5 justify-center">
        <Button>
          <Link href="/login">Login</Link>
        </Button>
        <Button>
          <Link href="/register">Register</Link>
        </Button>
        <Button>
          <Link href="/admin/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
