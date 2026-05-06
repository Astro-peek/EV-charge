import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";

const MainLayout = () => {
  return (
    <>
      <Navbar />

      {/* ✅ ADD THIS */}
      <div className="pt-20">
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
