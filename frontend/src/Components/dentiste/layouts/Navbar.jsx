import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FiBell, FiLogOut, FiMenu, FiX } from "react-icons/fi";

/**
 * Navbar – JS + Tailwind (ergonomique & responsive)
 * - Remplace le CSS module par Tailwind
 * - Barre sticky avec blur, bordure subtile, ombres légères
 * - Navigation active (NavLink) + menu mobile hamburger
 * - Icône de notifications (avec badge) + bouton Déconnexion
 * - Accessibilité: aria-controls, aria-expanded, sr-only
 */
export default function Navbar({ unread = 0 }) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const links = [
        { to: "/calendar", label: "Accueil" },
        { to: "/services", label: "Services" },
        { to: "/about", label: "À propos" },
        { to: "/contact", label: "Contact" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login-dentiste");
    };

    const linkClass = ({ isActive }) =>
        [
            "rounded-xl px-3 py-2 text-sm font-medium transition",
            isActive
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
        ].join(" ");

    return (
        <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/70 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        {/* Petit logo dentaire inline */}
                        <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 text-indigo-600">
                            <path fill="currentColor" d="M12 2c2.8 0 5 2.2 5 5 0 1.7-.6 3.3-1.4 4.7-.6 1.1-1.5 2.7-1.9 4.1-.3 1-.5 2.2-1.7 2.2s-1.4-1.2-1.7-2.2c-.4-1.4-1.3-3-1.9-4.1C7.6 10.3 7 8.7 7 7c0-2.8 2.2-5 5-5z" />
                        </svg>
                        <span className="text-base font-semibold text-slate-900">DentFlow</span>
                    </Link>
                </div>

                {/* Desktop links */}
                <ul className="hidden items-center gap-1 md:flex">
                    {links.map((l) => (
                        <li key={l.to}>
                            <NavLink to={l.to} className={linkClass} end>
                                {l.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Right actions */}
                <div className="hidden items-center gap-2 md:flex">
                    <button
                        type="button"
                        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                        aria-label="Notifications"
                    >
                        <FiBell className="h-5 w-5" aria-hidden />
                        {unread > 0 && (
                            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                    >
                        <FiLogOut className="h-4 w-4" aria-hidden />
                        <span>Déconnexion</span>
                    </button>
                </div>

                {/* Mobile toggle */}
                <button
                    type="button"
                    onClick={() => setOpen((s) => !s)}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 md:hidden"
                    aria-controls="mobile-menu"
                    aria-expanded={open}
                >
                    <span className="sr-only">Ouvrir le menu</span>
                    {open ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile menu */}
            <div id="mobile-menu" className={`${open ? "block" : "hidden"} border-t border-slate-200 bg-white/90 backdrop-blur md:hidden`}>
                <ul className="px-4 py-3">
                    {links.map((l) => (
                        <li key={l.to} className="py-1">
                            <NavLink
                                to={l.to}
                                className={({ isActive }) =>
                                    [
                                        "block rounded-xl px-3 py-2 text-sm font-medium transition",
                                        isActive
                                            ? "bg-slate-100 text-slate-900"
                                            : "text-slate-700 hover:bg-slate-50",
                                    ].join(" ")
                                }
                                onClick={() => setOpen(false)}
                                end
                            >
                                {l.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
                <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-4 py-3">
                    <button
                        type="button"
                        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                        aria-label="Notifications"
                    >
                        <FiBell className="h-5 w-5" aria-hidden />
                        {unread > 0 && (
                            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => { setOpen(false); handleLogout(); }}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
                    >
                        <FiLogOut className="h-4 w-4" aria-hidden />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
