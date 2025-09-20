import { Routes, Route } from "react-router-dom";
import RendezVousCalendar from "./Components/Calendar/RendezVousCalendar";
import LoginDentiste from "./Components/LoginMedecin/LoginDentiste";
import RegisterDentiste from "./Components/RegisterMedecin/RegisterDentiste";
import AddAppointmentForm from "./Components/formulaires/AddAppointment";
import SidebarComponent from "./Components/Sidebar/Sidebar";
import ListeSecretaires from "./Components/ListeSecretaires/ListeSecretaires";
import Navbar from "./Components/Navbar/Navbar"; // si t7eb taffichi navbar
import { Outlet, useLocation } from "react-router-dom";
import AjouterSecretaire from "./Components/ajoutersecretaire/ajoutersecretaire";
import ListePatients from "./Components/ListePatients/ListePatients";
import AjouterPatient from "./Components/ajouterpatient/AjouterPatient";

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
        <Route path="/add-appointment/:date?" element={<AddAppointmentForm />} />
        <Route path="/" element={<RendezVousCalendar />} />
        <Route path="/ListeSecretaires" element={<ListeSecretaires />} />
        <Route path="/add-secretary" element={<AjouterSecretaire />} />
        <Route path="/ListePatients" element={<ListePatients />} />
        <Route path="/add-patient" element={<AjouterPatient />} />

        /add-patient

        

      </Route>
    </Routes>
  );
}
