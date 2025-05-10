import { Outlet, Routes, Route } from "react-router-dom";
import Navigation from "./Navigation";
import { useTheme } from "./ThemeProvider";
import { useEffect } from "react";
import { blockchainSystem } from "@/lib/blockchain";
import { motion, AnimatePresence } from "framer-motion";
import Home from "@/pages/Home";
import Identity from "@/pages/Identity";
import NFTMinting from "@/pages/NFTMinting";
import Transactions from "@/pages/Transactions";
import Wallet from "@/pages/Wallet";
import NotFound from "@/pages/NotFound";
import { PasswordRecovery } from "./wallet/PasswordRecovery";

const Layout = () => {
    const { theme } = useTheme();

    // Ensure a default identity is registered for demo purposes
    useEffect(() => {
        const initializeUser = async () => {
            if (!blockchainSystem.getCurrentUser()) {
                console.log(
                    "No current user found, registering default identity..."
                );
                await blockchainSystem.registerIdentity(
                    "default-id",
                    "default-selfie"
                );
                console.log("Default identity registered!");
            }
        };

        initializeUser();
    }, []);

    return (
        <div
            className={`min-h-screen ${
                theme === "dark"
                    ? "bg-gradient-to-br from-[#101626] via-[#161a2c] to-[#0c0f1a]"
                    : "bg-white text-gray-900"
            }`}
        >
            {/* 3D Elements - Enhanced interactive background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Main floating orbs with improved glow effects */}
                <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-gradient-to-r from-purple-600/10 to-pink-600/10 blur-3xl animate-float-slow"></div>
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl animate-float-medium"></div>
                <div className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-pink-600/10 to-blue-600/10 blur-3xl animate-float-fast"></div>

                {/* Secondary particles for depth */}
                <div className="absolute top-1/2 left-1/5 w-24 h-24 rounded-full bg-purple-500/5 blur-xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-pink-500/5 blur-xl animate-pulse"></div>

                {/* Accent highlights */}
                <div className="absolute top-24 right-1/3 w-6 h-6 rounded-full bg-purple-400/30 blur-sm"></div>
                <div className="absolute bottom-32 left-1/4 w-8 h-8 rounded-full bg-pink-400/30 blur-sm"></div>

                {/* Distant nebulas */}
                <div className="absolute -top-20 -right-20 w-[40rem] h-[40rem] rounded-full bg-gradient-to-r from-indigo-900/5 to-transparent blur-3xl"></div>
                <div className="absolute -bottom-40 -left-20 w-[30rem] h-[30rem] rounded-full bg-gradient-to-r from-purple-900/5 to-transparent blur-3xl"></div>
            </div>

            {/* Enhanced Grid lines overlay with subtle glow */}
            <div className="fixed inset-0 bg-grid-pattern opacity-[0.04] pointer-events-none z-0"></div>

            {/* Radial gradient overlay for depth */}
            <div className="fixed inset-0 bg-radial-gradient opacity-70 pointer-events-none z-0"></div>

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
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/identity" element={<Identity />} />
                            <Route path="/nft" element={<NFTMinting />} />
                            <Route
                                path="/transactions"
                                element={<Transactions />}
                            />
                            <Route path="/wallet" element={<Wallet />} />
                            <Route
                                path="/wallet/recover"
                                element={<PasswordRecovery />}
                            />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </motion.main>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Layout;
