import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Navbar from "../layouts/Navbardentiste.jsx";
import SidebarComponent from "../layouts/Sidebardentiste.jsx";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function RendezVousCalendar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Hook AuthContext
    const token = user?.token;

    const [appointment, setAppointment] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");

    // — Fetch des rendez-vous — //
    const fetchRendezVous = async () => {
        if (!token) {
            setError("Utilisateur non connecté. Veuillez vous reconnecter.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const res = await axios.get("http://localhost:5000/api/agenda/rendezvous", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAppointment(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.message);
            if (err.response?.status === 401) logout(); // déconnexion si token invalide
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRendezVous();
    }, [token]);

    // — Mapping des rendez‑vous vers FullCalendar — //
    useEffect(() => {
        if (Array.isArray(appointment)) {
            const mapped = appointment.map(a => {
                const patientNom = a?.Patient ? `${a.Patient.nom} ${a.Patient.prenom}` : "Inconnu";
                const note = a?.note || "Aucune note";

                // Assure que les dates sont en format ISO
                const startDate = new Date(a.dateDebut).toISOString();

                return {
                    id: String(a.id ?? a._id ?? ""),
                    title: patientNom,
                    extendedProps: { note, patientNom },
                    start: startDate,
                    end: startDate,
                };
            });
            setEvents(mapped);
        }
    }, [appointment]);

    // — Création de rendez-vous — //
    const handleDateClick = (info) => {
        navigate(`/add-appointment/${info.dateStr}`);
    };

    // — Suppression de rendez-vous — //
    const handleEventClick = async (info) => {
        const id = info.event.id;
        const titre = info.event.extendedProps?.patientNom || info.event.title || "Inconnu";

        if (!id || !window.confirm(`Voulez-vous vraiment supprimer le rendez-vous de ${titre} ?`)) return;

        setBusy(true);
        setMsg("");

        try {
            if (!token) {
                setMsg("❌ Vous devez vous reconnecter.");
                setBusy(false);
                return;
            }

            await axios.delete(`http://localhost:5000/api/agenda/rendezvous/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            info.event.remove();
            setMsg("Rendez-vous supprimé avec succès ✅");
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Erreur lors de la suppression.";
            setMsg(errorMsg);
            console.error("Erreur suppression :", err);
        } finally {
            setBusy(false);
        }
    };

    // — Rendu custom des événements — //
    const renderEventContent = (arg) => {
        const note = arg.event.extendedProps?.note;
        return (
            <div className="flex flex-col gap-0.5">
                <span className="truncate font-medium">{arg.event.title}</span>
                {note && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 text-[10px] leading-5 text-slate-700">
                        Note: {note}
                    </span>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <SidebarComponent />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                   

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-36 animate-pulse rounded-2xl bg-white shadow-sm" />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <SidebarComponent />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                  
                    <div className="mx-auto max-w-3xl">
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                            <p className="font-medium">Erreur</p>
                            <p className="text-sm">{String(error)}</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const isEmpty = !events || events.length === 0;

    return (
        <div className="flex min-h-screen bg-slate-50">
            <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
             
                <section className="mt-4 rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur flex-1 flex flex-col">
                    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-5 py-4">
                        <h2 className="text-lg font-semibold text-slate-900">Calendrier des rendez‑vous</h2>
                        <button
                            onClick={() => navigate("/add-appointment")}
                            className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-500"
                        >
                            Nouveau rendez‑vous
                        </button>
                    </div>

                    {msg && (
                        <div className="mx-5 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                            <p className="text-sm">{msg}</p>
                        </div>
                    )}

                    <div className="flex-1 p-4">
                        {isEmpty ? (
                            <div className="mx-auto grid max-w-xl place-items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
                                <h3 className="text-base font-semibold text-slate-900">Aucun rendez‑vous</h3>
                                <p className="text-sm text-slate-600">
                                    Ajoute ton premier rendez‑vous en cliquant sur une date dans le calendrier ou via le bouton ci‑dessus.
                                </p>
                                <button
                                    onClick={() => navigate("/add-appointment")}
                                    className="mt-1 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                >
                                    Créer un rendez‑vous
                                </button>
                            </div>
                        ) : (
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                editable
                                selectable
                                events={events}
                                dateClick={handleDateClick}
                                eventClick={handleEventClick}
                                eventContent={renderEventContent}
                                height="100%"
                                expandRows={true}
                                headerToolbar={{
                                    left: "prev,next today",
                                    center: "title",
                                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                                }}
                                buttonText={{ today: "Aujourd'hui" }}
                            />
                        )}
                    </div>
                </section>
            </main>

            {busy && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/10 backdrop-blur-[1px]">
                    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            <p className="text-sm text-slate-700">Traitement en cours…</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
