import { Routes, Route } from "react-router-dom";
import RendezVousCalendar from "./Components/Calendar/RendezVousCalendar";
import LoginDentiste from "./Components/auth/LoginDentiste.jsx";
import RegisterDentiste from "./Components/auth/RegisterDentiste.jsx";
import AddAppointmentForm from "./Components/forms/AddAppointment.jsx";
import SidebarComponent from "./layouts/Sidebar.jsx";
import ListeSecretaires from "./Components/lists/ListeSecretaires.jsx";
import Navbar from "./layouts/Navbar.jsx"; // si t7eb taffichi navbar
import { Outlet, useLocation } from "react-router-dom";
import AjouterSecretaire from "./Components/forms/AjouterSecretaire.jsx";
import ListePatients from "./Components/lists/ListePatients.jsx";
import AjouterPatient from "./Components/forms/AjouterPatient.jsx";
import Dashboard from "./Components/Dashboard/Dashboard.jsx";
import AddAppointment from "./Components/forms/AddAppointment.jsx";

function Layout() {
  const location = useLocation();

  // Masquer Navbar et Sidebar sur login
  const hideNavbar = location.pathname === "/login-dentiste";
  const hideSidebar = location.pathname === "/login-dentiste";

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      {!hideSidebar && <SidebarComponent />}

      <div style={{ flex: 1 }}>
        {/* Navbar */}
        
        {!hideNavbar && <Navbar />}

        {/* Contenu de la page */}
        <main>
          <Outlet /> {/* ⚡ outlet houwa li yaffichi les routes nested */}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Route login (bara mel layout) */}
      <Route path="/login-dentiste" element={<LoginDentiste />} />

      {/* Les routes mte3 l'app kolha fi Layout */}
      <Route element={<Layout />}>
        <Route path="/register-dentiste" element={<RegisterDentiste />} />
        <Route path="/calendar" element={<RendezVousCalendar />} />
        <Route path="/add-appointment" element={<AddAppointment />} />
        <Route path="/add-appointment/:dateStr" element={<AddAppointment />} />
        <Route path="/" element={<RendezVousCalendar />} />
        <Route path="/ListeSecretaires" element={<ListeSecretaires />} />
        <Route path="/add-secretary" element={<AjouterSecretaire />} />
        <Route path="/ListePatients" element={<ListePatients />} />
        <Route path="/add-patient" element={<AjouterPatient />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
