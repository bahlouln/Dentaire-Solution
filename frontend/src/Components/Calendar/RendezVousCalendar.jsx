// src/components/Calendar/RendezVousCalendar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./RendezVousCalendar.module.css";
import { UseRendezVous } from "../../hooks/UseRendezVous";
import axios from "axios";

function RendezVousCalendar() {
  const { appointment, loading, error } = UseRendezVous();
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  // Mapping des rendez-vous pour FullCalendar avec vérification Patient/Dentiste
  useEffect(() => {
    if (Array.isArray(appointment)) {
      const mappedEvents = appointment.map((a) => {
        const patientNom = a.Patient ? `${a.Patient.nom} ${a.Patient.prenom}` : "Inconnu";
        const dentisteNom = a.Dentiste ? `${a.Dentiste.nom} ${a.Dentiste.prenom}` : "Inconnu";

        return {
          id: a.id,
          title: `Patient: ${patientNom} | Dentiste: ${dentisteNom}`,
          start: a.dateDebut,
          end: a.dateFin,
        };
      });
      setEvents(mappedEvents);
    }
  }, [appointment]);

  // Ajouter un rendez-vous
  const handleDateClick = (info) => {
    navigate(`/add-appointment/${info.dateStr}`);
  };

  // Supprimer un rendez-vous
  const handleEventClick = async (info) => {
  if (window.confirm(`Supprimer le rendez-vous : ${info.event.title} ?`)) {
    try {
      await api.rendezvous.delete(info.event.id); // ✅ utilise l'api centralisée
      info.event.remove();
    } catch (err) {
      alert("Erreur lors de la suppression du rendez-vous");
    }
  }
};


  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div className={styles.calendarContainer}>
      <h2 className={styles.title}>Gestion des Rendez-vous</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="600px"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
      />
    </div>
  );
}

export default RendezVousCalendar;
