import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import AddAppointmentForm from "./Components/formulaires/AddAppointment";
import LoginDentiste from "./Components/LoginMedecin/LoginDentiste";
import RegisterDentiste from "./Components/RegisterMedecin/RegisterDentiste";
import RendezVousCalendar from "./Components/Calendar/RendezVousCalendar";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/add-appointment/:date?" element={<AddAppointmentForm />} />
      <Route path="/login-dentiste" element={<LoginDentiste />} />
      <Route path="/register-dentiste" element={<RegisterDentiste />} />
      <Route path="/Calendar" element={<RendezVousCalendar />} />

    </Routes>
  </BrowserRouter>
);
