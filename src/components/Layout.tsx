
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import { useTheme } from "./ThemeProvider";

const Layout = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-[#1A202C] text-white" : "bg-white text-gray-900"}`}>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
