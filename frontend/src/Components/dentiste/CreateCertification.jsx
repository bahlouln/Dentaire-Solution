import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import { useAuth } from "../context/AuthContext";

export default function CreateCertification() {
  const { user, loading } = useAuth();
  const token = user?.token;

  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState({ name: "", age: "", address: "" });
  const [certif, setCertif] = useState({ objet: "", description: "" });
  const [msg, setMsg] = useState("");

  // Charger les patients du dentiste connecté
  useEffect(() => {
    const fetchPatients = async () => {
      

      try {
        const res = await axios.get("http://localhost:5000/api/dentistes/patients", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data) ? res.data : res.data.patients;
        setPatients(data || []);
      } catch (error) {
        console.error("Erreur lors du chargement des patients:", error);
        
      }
    };

    fetchPatients();
  }, [token]);

  // Modifier les infos du patient
  const handlePatientChange = (field, value) => {
    setPatient({ ...patient, [field]: value });
  };

  // Modifier les infos de la certification
  const handleCertifChange = (field, value) => {
    setCertif({ ...certif, [field]: value });
  };

  // Imprimer directement
  const handlePrint = () => {
    window.print();
  };

  // Générer le PDF
  const handlePDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString("fr-FR");
    const currentTime = new Date().toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' });

    // En-tête
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Cabinet du dentiste " + (user.nom || "") + " " + (user.prenom || ""), 20, 15);
    doc.setFontSize(10);
    doc.text("Tél:"+ (user.numero|| "N/A"), 20, 25);

    // Logo
    const logoImg = new Image();
    logoImg.src = "/logo.jpg";
    doc.addImage(logoImg, "JPEG", 160, 5, 40, 30);

    
    // Titre
    doc.setFillColor(230, 230, 250);
    doc.rect(50, 45, 110, 20, "F");
    doc.setFontSize(16);
    doc.text("Certificat Médical", 105, 57, { align: "center" });

    // Infos patient
    doc.setFontSize(12);
    doc.text(`Nom du patient : ${patient.name || "Non spécifié"}`, 20, 80);
   
    // Objet et description
    doc.text(`Objet : ${certif.objet || "Non spécifié"}`, 20, 120);
    doc.text("Description :", 20, 130);
    doc.setFontSize(11);
    doc.text(certif.description || "Aucune description fournie.", 20, 140, { maxWidth: 170 });

    // Date et localisation
    const cleanLocalisation = (user.localisation || "Localisation inconnue").replace(/\r?\n/g, " ").trim();
    doc.setFontSize(10);
    doc.text(`Fait à ${cleanLocalisation}, le ${currentDate} à ${currentTime}`, 20, 200);

    // Signature
    doc.setFontSize(12);
    doc.text("Dr. " + (user.nom || "") + " " + (user.prenom || ""), 105, 270, { align: "center" });
    doc.line(90, 272, 120, 272);

    doc.save(`certification_${patient.name || "patient"}.pdf`);
  };

  // Annuler
  const handleCancel = () => {
    setPatient({ name: ""});
    setCertif({ objet: "", description: "" });
  };

  if (loading) return <p className="text-center mt-6">Chargement...</p>;
  if (!user) return <p className="text-center text-red-600 mt-6">Vous devez être connecté pour créer une certification.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto mt-6 bg-white shadow-xl p-8 rounded-xl">
        <div className="border-b-2 border-blue-500 pb-4 mb-6">
          <h2 className="text-3xl font-bold text-center text-blue-700">Créer une Certification</h2>
        </div>

        {msg && (
          <div className="mb-6 p-3 rounded-md bg-yellow-50 text-yellow-800 text-sm font-medium">
            {msg}
          </div>
        )}

        {/* Section Patient */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Informations du Patient</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-600">Patient :</label>
              <select
                value={patient.name}
                onChange={(e) => handlePatientChange("name", e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choisir un patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={`${p.nom} ${p.prenom}`}>
                    {p.nom} {p.prenom}
                  </option>
                ))}
              </select>
            </div>

           
          </div>
        </div>

        {/* Section Certification */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Détails de la Certification</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-600">Objet :</label>
              <input
                type="text"
                placeholder="Ex : Certificat d’aptitude, de consultation..."
                value={certif.objet}
                onChange={(e) => handleCertifChange("objet", e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600">Description :</label>
              <textarea
                placeholder="Rédiger le contenu de la certification..."
                value={certif.description}
                onChange={(e) => handleCertifChange("description", e.target.value)}
                rows="5"
                className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handlePDF}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            💾 Enregistrer en PDF
          </button>
          <button
            onClick={handlePrint}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            🖨️ Imprimer
          </button>
          <button
            onClick={handleCancel}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            🚫 Annuler
          </button>
        </div>
      </div>
    </div>
  );
}
