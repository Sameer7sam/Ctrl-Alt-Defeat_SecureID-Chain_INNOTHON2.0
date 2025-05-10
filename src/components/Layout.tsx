
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import { useTheme } from "./ThemeProvider";
import { useEffect } from "react";
import { blockchainSystem } from "@/lib/blockchain";
import { motion, AnimatePresence } from "framer-motion"; 

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
    <div className={`min-h-screen ${theme === "dark" ? "bg-gradient-to-br from-[#1A202C] via-[#1A1F2C] to-[#131825]" : "bg-white text-gray-900"}`}>
      {/* 3D Elements - Floating orbs in background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl animate-float-medium"></div>
        <div className="absolute top-2/3 left-1/2 w-56 h-56 rounded-full bg-gradient-to-r from-pink-600/20 to-blue-600/20 blur-3xl animate-float-fast"></div>
      </div>

      {/* Grid lines overlay */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none z-0"></div>
      
      <div className="relative z-10">
        <Navigation />
        <AnimatePresence mode="wait">
          <motion.main 
            key="main-content"
            className="container mx-auto px-4 py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Layout;
