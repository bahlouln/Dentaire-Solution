import  { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RendezVousCalendar from "./Components/Calendar/RendezVousCalendar";
import { UseRendezVous } from "./hooks/UseRendezVous";

function App() {
  const { appointment, loading, error } = UseRendezVous();
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (Array.isArray(appointment)) {
      const mappedEvents = appointment.map((a) => ({
        id: a.id,
        title: `Nom: ${a.Nom || a.nom} | Prenom: ${a.Prenom || a.prenom} | Tel: ${a.Tel || a.tel}`,
        start: a.Date_Debut || a.date_debut,
        end: a.Date_Fin || a.date_fin,
      }));
      setEvents(mappedEvents);
    }
  }, [appointment]);
  

  const handleDateClick = (info) => {
    // redirection vers la route formulaire
    navigate(`/add-appointment/${info.dateStr}`);
  };

  const handleEventClick = (info) => {
    if (window.confirm(`Supprimer le rendez-vous : ${info.event.title} ?`)) {
      info.event.remove();
    }
  };

  return (
    <div>
      <RendezVousCalendar
        error={error}
        loading={loading}
        events={events}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
      />
    </div>
  );
}

export default App;
