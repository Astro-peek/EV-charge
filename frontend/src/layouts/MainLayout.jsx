import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import AIChatbot from "../components/AIChatbot/AIChatbot";

const MainLayout = () => {
  return (
    <>
      <Navbar />

      {/* ✅ ADD THIS */}
      <div className="pt-20">
        <Outlet />
      </div>
      
      <AIChatbot />
    </>
  );
};

export default MainLayout;
