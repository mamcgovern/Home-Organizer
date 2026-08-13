import {
    CalendarDays,
    CheckSquare,
    Clapperboard,
    House,
    ListChecks,
    ShoppingCart,
    Utensils,
    X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigationItems = [
    {
        label: "Home",
        path: "/",
        icon: House,
    },
    {
        label: "Tasks",
        path: "/tasks",
        icon: CheckSquare,
    },
    {
        label: "Meals",
        path: "/meals",
        icon: Utensils,
    },
    {
        label: "Groceries",
        path: "/groceries",
        icon: ShoppingCart,
    },
    {
        label: "Chores",
        path: "/chores",
        icon: ListChecks,
    },
    {
        label: "Calendar",
        path: "/calendar",
        icon: CalendarDays,
    },
    {
        label: "Watchlist",
        path: "/watchlist",
        icon: Clapperboard,
    },
];

function Sidebar({ isOpen, onClose }) {
    return (
        <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
            <div className="sidebar-header">
                <div>
                    <p className="sidebar-eyebrow">Maddie & Nick's</p>
                    <h1 className="sidebar-logo">Homebase</h1>
                </div>

                <button
                    className="sidebar-close"
                    type="button"
                    aria-label="Close navigation"
                    onClick={onClose}
                >
                    <X size={22} />
                </button>
            </div>

            <nav className="sidebar-nav" aria-label="Main navigation">
                {navigationItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === "/"}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `sidebar-link ${
                                    isActive ? "sidebar-link--active" : ""
                                }`
                            }
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="household-avatar">MN</div>

                <div>
                    <p className="household-name">Our Household</p>
                    <p className="household-members">Maddie & Nick</p>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;