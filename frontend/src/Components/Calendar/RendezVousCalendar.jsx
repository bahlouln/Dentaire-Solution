import  {  useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { UseRendezVous } from "../../hooks/UseRendezVous";
import Navbar from "../../layouts/Navbar.jsx";
import SidebarComponent from "../Sidebar/Sidebar";
import axios from "axios";

export default function RendezVousCalendar() {
    const navigate = useNavigate();
    const { appointment, loading, error } = UseRendezVous();
    const [events, setEvents] = useState([]);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState("");

    // — Mapping des rendez‑vous vers FullCalendar — //
    useEffect(() => {
        if (Array.isArray(appointment)) {
            const mapped = appointment.map((a) => {
                const patientNom = a?.Patient ? `${a.Patient.nom} ${a.Patient.prenom}` : "Inconnu";
                const dentisteNom = a?.Dentiste ? `${a.Dentiste.nom} ${a.Dentiste.prenom}` : "Inconnu";
                return {
                    id: String(a.id ?? a._id ?? ""),
                    title: patientNom,
                    extendedProps: { dentisteNom, patientNom },
                    start: a.dateDebut,
                    end: a.dateFin,
                };
            });
            setEvents(mapped);
        }
    }, [appointment]);

    // — Actions — //
    const handleDateClick = (info) => {
        navigate(`/add-appointment/${info.dateStr}`);
    };

    const handleEventClick = async (info) => {
        // Vérification de l'existence de l'événement et de l'ID
        if (!info?.event?.id) {
            setMsg("Erreur : Aucun rendez-vous sélectionné.");
            return;
        }

        const id = info.event.id;
        const titre = info.event.extendedProps?.patientNom || info.event.title || "Inconnu";

        // Confirmation avec un message clair
        if (!window.confirm(`Voulez-vous vraiment supprimer le rendez-vous de ${titre} ?`)) {
            return;
        }

        setBusy(true);
        setMsg("");

        try {
            // Utilisation d'une URL configurable
            const API_URL =  "http://localhost:5000";
            await axios.delete(`${API_URL}/rendezvous/${id}`);
            info.event.remove();
            setMsg("Rendez-vous supprimé avec succès.");
        } catch (error) {
            // Message d'erreur détaillé
            const errorMsg = error.response?.data?.message || "Une erreur est survenue lors de la suppression.";
            setMsg(errorMsg);
            console.error("Erreur lors de la suppression du rendez-vous:", error);
        } finally {
            setBusy(false);
        }
    };
    // — Rendu custom des événements (patient en titre + badge dentiste) — //
    const renderEventContent = (arg) => {
        const dentiste = arg?.event?.extendedProps?.dentisteNom;
        return (
            <div className="flex flex-col gap-0.5">
                <span className="truncate font-medium">{arg.event.title}</span>
                {dentiste ? (
                    <span className="inline-flex w-fit items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 text-[10px] leading-5 text-slate-700">
            Dentiste: {dentiste}
          </span>
                ) : null}
            </div>
        );
    };

    // — États — //
    if (loading) {
        return (
            <div className="flex min-h-screen bg-slate-50">
                <SidebarComponent />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Navbar />
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-36 animate-pulse rounded-2xl bg-white shadow-sm">
                                <div className="h-full rounded-2xl bg-slate-100" />
                            </div>
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
                    <Navbar />
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
            {/* Sidebar fixe */}
            <SidebarComponent />

            {/* Contenu principal */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <Navbar />

                {/* Carte calendrier */}
                <section className="mt-4 rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
                    {/* En-tête sticky */}
                    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-2xl border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-sky-50 px-5 py-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">Calendrier des rendez‑vous</h2>
                            <p className="text-xs text-slate-600">Clique sur une date pour créer un nouveau rendez‑vous. Clique sur un événement pour le supprimer.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate("/add-appointment")}
                                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                            >
                                Nouveau rendez‑vous
                            </button>
                        </div>
                    </div>

                    {/* Messages actions */}
                    {msg && (
                        <div className="mx-5 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                            <p className="text-sm">{msg}</p>
                        </div>
                    )}

                    {/* Contenu calendrier */}
                    <div className="px-3 py-5 sm:px-5">
                        {isEmpty ? (
                            <div className="mx-auto grid max-w-xl place-items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
                                <h3 className="text-base font-semibold text-slate-900">Aucun rendez‑vous</h3>
                                <p className="text-sm text-slate-600">Ajoute ton premier rendez‑vous en cliquant sur une date dans le calendrier ou via le bouton ci‑dessus.</p>
                                <button
                                    onClick={() => navigate("/add-appointment")}
                                    className="mt-1 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-200"
                                >
                                    Créer un rendez‑vous
                                </button>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-slate-200 p-2 sm:p-3">
                                <FullCalendar
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    editable
                                    selectable
                                    events={events}
                                    dateClick={handleDateClick}
                                    eventClick={handleEventClick}
                                    eventContent={renderEventContent}
                                    height="auto"
                                    aspectRatio={1.45}
                                    headerToolbar={{
                                        left: "prev,next today",
                                        center: "title",
                                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                                    }}
                                    buttonText={{ today: "Aujourd'hui" }}
                                    dayMaxEvents={3}
                                />
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Écran de blocage lors d'une action */}
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