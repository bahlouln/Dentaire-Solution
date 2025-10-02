import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    HiChartPie,
    HiInbox,
    HiShoppingBag,
    HiUser,
    HiViewBoards,
    HiMenu,
    HiX,
} from "react-icons/hi";

export default function SidebarsecComponent() {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [openMobile, setOpenMobile] = useState(false);

    const items = [

        { to: "/calendar", label: "calendrier", icon: HiInbox },
        { to: "/secretaire/ListePatients", label: "Patients", icon: HiShoppingBag },
        { to: "/Dashboard", label: "Dashboard", icon: HiChartPie },

    ];

    const navItemClass = (isActive) =>
        [
            "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
            isActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        ].join(" ");

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login-dentiste");
    };

    const SidebarInner = (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-3">
                <div className="flex items-center gap-2">
                    <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 text-indigo-600">
                        <path
                            fill="currentColor"
                            d="M12 2c2.8 0 5 2.2 5 5 0 1.7-.6 3.3-1.4 4.7-.6 1.1-1.5 2.7-1.9 4.1-.3 1-.5 2.2-1.7 2.2s-1.4-1.2-1.7-2.2c-.4-1.4-1.3-3-1.9-4.1C7.6 10.3 7 8.7 7 7c0-2.8 2.2-5 5-5z"
                        />
                    </svg>
                    {!collapsed && (
                        <span className="text-base font-semibold text-slate-900">DentFlow</span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() =>
                        window.matchMedia("(min-width: 768px)").matches
                            ? setCollapsed((s) => !s)
                            : setOpenMobile(false)
                    }
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                    aria-label="Basculer la barre latérale"
                >
                    {window.matchMedia("(min-width: 768px)").matches ? (
                        <HiViewBoards className="h-5 w-5" />
                    ) : (
                        <HiX className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 px-2 py-3">
                {items.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end
                        className={({ isActive }) => navItemClass(isActive)}
                        title={collapsed ? label : undefined}
                        onClick={() => setOpenMobile(false)}
                    >
                        <Icon className="h-5 w-5 flex-shrink-0" aria-hidden />
                        {!collapsed && <span className="truncate">{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Footer actions */}
            <div className="mt-auto border-t border-slate-200 p-2">
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
                    title={collapsed ? "Déconnexion" : undefined}
                >
                    <HiViewBoards className="h-5 w-5 rotate-180" aria-hidden />
                    {!collapsed && <span>Déconnexion</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Bouton mobile pour ouvrir */}
            <button
                type="button"
                onClick={() => setOpenMobile(true)}
                className="fixed left-3 top-3 z-40 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 md:hidden"
                aria-label="Ouvrir la barre latérale"
            >
                <HiMenu className="h-5 w-5" />
            </button>

            {/* Overlay mobile */}
            {openMobile && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
                    onClick={() => setOpenMobile(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={[
                    "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-slate-200 bg-white/80 shadow-sm backdrop-blur transition-transform duration-300",
                    collapsed ? "md:w-20" : "md:w-72",
                    openMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                    "w-72",
                ].join(" ")}
                aria-label="Sidebarsec"
            >
                {SidebarInner}
            </aside>

            {/* Espace pour le contenu */}
            <div className={collapsed ? "md:ml-20" : "md:ml-72"} />
        </>
    );
}
