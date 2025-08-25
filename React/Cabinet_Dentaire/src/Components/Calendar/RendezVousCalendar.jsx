import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import styles from "./RendezVousCalendar.module.css";

function RendezVousCalendar({ error, loading, events, appointment, onDateClick, onEventClick }) {

  return (
    <div className={styles.calendarContainer}>
      <h2 className={styles.title}>Gestion des Rendez-vous</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        events={events}
        dateClick={onDateClick}
        eventClick={onEventClick}
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
