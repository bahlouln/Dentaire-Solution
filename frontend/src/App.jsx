import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import RendezVousCalendar from "./Components/Calendar/RendezVousCalendar";
import LoginDentiste from "./Components/auth/LoginDentiste.jsx";
import RegisterDentiste from "./Components/auth/RegisterDentiste.jsx";
import AddAppointment from "./Components/forms/AddAppointment.jsx";
import SidebarComponent from "./layouts/Sidebar.jsx";
import ListeSecretaires from "./Components/lists/ListeSecretaires.jsx";
import Navbar from "./layouts/Navbar.jsx";
import AjouterSecretaire from "./Components/forms/AjouterSecretaire.jsx";
import ListePatients from "./Components/lists/ListePatients.jsx";
import AjouterPatient from "./Components/forms/AjouterPatient.jsx";
import Dashboard from "./Components/Dashboard/Dashboard.jsx";

// ---------- Helpers auth ----------
const getToken = () => localStorage.getItem("token");
const isAuthenticated = () => !!getToken();

// ---------- Guards ----------
function RequireAuth({ children }) {
    const location = useLocation();
    if (!isAuthenticated()) {
        // pas de token -> va au login et garde d’où on venait
        return <Navigate to="/login-dentiste" replace state={{ from: location }} />;
    }
    return children ?? <Outlet />;
}

function PublicOnly({ children }) {
    // si déjà loggé, inutile d’aller au login
    if (isAuthenticated()) {
        return <Navigate to="/" replace />;
    }
    return children ?? <Outlet />;
}

// ---------- Layout protégé (navbar + sidebar) ----------
function Layout() {
    const location = useLocation();
    // Masquer Navbar/Sidebar sur login
    const isLogin = location.pathname === "/login-dentiste";

    return (
        <div style={{ display: "flex" }}>
            {!isLogin && <SidebarComponent />}
            <div style={{ flex: 1 }}>
                {!isLogin && <Navbar />}
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

// ---------- App ----------
export default function App() {
    return (
        <Routes>
            {/* Route Login: accessible seulement si NON connecté */}
            <Route element={<PublicOnly />}>
                <Route path="/login-dentiste" element={<LoginDentiste />} />
                {/* (optionnel) page register publique si tu veux */}
                <Route path="/register-dentiste" element={<RegisterDentiste />} />
            </Route>

            {/* Tout le reste est protégé par RequireAuth */}
            <Route element={<RequireAuth />}>
                <Route element={<Layout />}>
                    {/* index "/" -> envoie vers le calendrier (tu peux changer la cible) */}
                    <Route index element={<Navigate to="/calendar" replace />} />

                    <Route path="/calendar" element={<RendezVousCalendar />} />
                    <Route path="/add-appointment" element={<AddAppointment />} />
                    <Route path="/add-appointment/:dateStr" element={<AddAppointment />} />
                    <Route path="/ListeSecretaires" element={<ListeSecretaires />} />
                    <Route path="/add-secretary" element={<AjouterSecretaire />} />
                    <Route path="/ListePatients" element={<ListePatients />} />
                    <Route path="/add-patient" element={<AjouterPatient />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>
            </Route>

            {/* Catch-all: redirige vers "/" (déclenchera RequireAuth) */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
