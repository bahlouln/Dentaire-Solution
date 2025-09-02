import  { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RendezVousCalendar from "./Components/Calendar/RendezVousCalendar";
import { UseRendezVous } from "./hooks/UseRendezVous";
import LoginDentiste from "./Components/LoginMedecin/LoginDentiste";
import RegisterDentiste from "./Components/RegisterMedecin/RegisterDentiste";
function App() {
  

  return (
    <div>
     {/*<RendezVousCalendar
        error={error}
        loading={loading}
        events={events}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
      />*/}
      <RegisterDentiste />
     {/*<LoginDentiste />*/}
    </div>
  );
}

export default App;
