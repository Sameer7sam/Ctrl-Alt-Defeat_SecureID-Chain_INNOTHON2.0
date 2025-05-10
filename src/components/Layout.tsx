
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import { useTheme } from "./ThemeProvider";
import { useEffect } from "react";
import { blockchainSystem } from "@/lib/blockchain";

const Layout = () => {
  const { theme } = useTheme();

  // Ensure a default identity is registered for demo purposes
  useEffect(() => {
    const initializeUser = async () => {
      if (!blockchainSystem.getCurrentUser()) {
        console.log("No current user found, registering default identity...");
        await blockchainSystem.registerIdentity("default-id", "default-selfie");
        console.log("Default identity registered!");
      }
    };
    
    initializeUser();
  }, []);

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
