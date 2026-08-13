import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import "../../styles/layout.css";

function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function closeSidebar() {
        setSidebarOpen(false);
    }

    return (
        <div className="app-layout">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
            />

            {sidebarOpen && (
                <button
                    className="sidebar-overlay"
                    type="button"
                    aria-label="Close navigation"
                    onClick={closeSidebar}
                />
            )}

            <div className="app-content">
                <header className="mobile-header">
                    <button
                        className="icon-button"
                        type="button"
                        aria-label="Open navigation"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <span className="mobile-logo">Homebase</span>
                </header>

                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;