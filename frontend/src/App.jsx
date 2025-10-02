import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

// ---------- Composants dentiste ----------
import LoginDentiste from "./Components/dentiste/auth/LoginDentiste.jsx";
import Dashboard from "./Components/dentiste/Dashboard/Dashboard.jsx";
import RendezVousCalendar from "./Components/dentiste/Calendar/RendezVousCalendar.jsx";
import AddAppointment from "./Components/dentiste/forms/AddAppointment.jsx";
import ListePatients from "./Components/dentiste/lists/ListePatients.jsx";
import AjouterPatient from "./Components/dentiste/forms/AjouterPatient.jsx";
import ListeSecretaires from "./Components/dentiste/lists/ListeSecretaires.jsx";
import AjouterSecretaire from "./Components/dentiste/forms/AjouterSecretaire.jsx";
import Navbar from "./Components/dentiste/layouts/Navbar.jsx";
import SidebarComponent from "./Components/dentiste/layouts/Sidebar.jsx";

// ---------- Composants secrétaire ----------
import LoginSecretaire from "./Components/secretaire/auth/LoginSecretaire.jsx";
import RendezVousCalendars from "./Components/secretaire/Calendar/RendezVousCalendars.jsx";
import AddAppointments from "./Components/secretaire/forms/AddAppointments.jsx";
import ListePatientss from "./Components/secretaire/lists/ListePatientss.jsx";
import AjouterPatients from "./Components/secretaire/forms/AjouterPatients.jsx";

// ---------- Composants admin ----------
import AdminLogin from "./Components/admin/auth/AdminLogin.jsx";
import AdminDashboard from "./Components/admin/Dashboard/AdminDashboard.jsx";
import ListeDentistes from "./Components/admin/lists/listeDentistes.jsx";
import AddDentistes from "./Components/admin/forms/AddDentistes.jsx";

// ---------- Auth ----------
import PrivateRoute from "./Components/context/PrivateRoute.jsx";
import SidebarsecComponent from "./Components/secretaire/layouts/Sidebarsec.jsx";
import { useAuth } from "./Components/context/AuthContext.jsx";
// ---------- Helpers auth ----------
const getToken = () => localStorage.getItem("token");
const isAuthenticated = () => !!getToken();

// ---------- Guards ----------
function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login-dentiste" replace state={{ from: location }} />;
  }
  return children ?? <Outlet />;
}

function PublicOnly({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children ?? <Outlet />;
}

// ---------- Layout Dentiste ----------
function DentisteLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      
        <main style={{ flex: 1, padding: "1rem" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ---------- Layout Secrétaire ----------
function SecretaireLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <SidebarsecComponent />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar />
        <main style={{ flex: 1, padding: "1rem" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// ---------- Layout Admin ----------
function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
     
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      
        <main style={{ flex: 1, padding: "1rem" }}>
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
      {/* Routes publiques */}
      <Route element={<PublicOnly />}>
        <Route path="login-dentiste" element={<LoginDentiste />} />
        <Route path="login-secretaire" element={<LoginSecretaire />} />
        <Route path="admin/login" element={<AdminLogin />} />
      </Route>

      {/* Routes admin protégées */}
      <Route
        path="admin"
        element={
          <PrivateRoute requireAdmin={true}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="dentistes" element={<ListeDentistes />} />
        <Route path="add-dentiste" element={<AddDentistes />} />
      </Route>

      {/* Routes dentiste protégées */}
      <Route element={<RequireAuth />}>
        <Route path="/" element={<DentisteLayout />}>
          <Route index element={<Navigate to="calendar" replace />} />
          <Route path="calendar" element={<RendezVousCalendar />} />
          <Route path="add-appointment" element={<AddAppointment />} />
          <Route path="add-appointment/:dateStr" element={<AddAppointment />} />
          <Route path="ListeSecretaires" element={<ListeSecretaires />} />
          <Route path="add-secretary" element={<AjouterSecretaire />} />
          <Route path="ListePatients" element={<ListePatients />} />
          <Route path="add-patient" element={<AjouterPatient />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>

        {/* Routes secrétaire protégées */}
        <Route path="secretaire" element={<SecretaireLayout />}>
          <Route index element={<Navigate to="calendar" replace />} />
          <Route path="secretaire/calendar" element={<RendezVousCalendars />} />
          <Route path="secretaire/add-appointments" element={<AddAppointments />} />
          <Route path="secretaire/ListePatients" element={<ListePatientss />} />
          <Route path="secretaire/add-patient" element={<AjouterPatients />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
