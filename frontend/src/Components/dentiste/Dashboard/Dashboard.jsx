// src/Components/dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Area
} from "recharts";
import { FaSync } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth(); // Récupère l'utilisateur et logout
  const token = user?.token; // Token sécurisé

  const [courbeData, setCourbeData] = useState([]);
  const [annualData, setAnnualData] = useState([]);
  const [patientAnnualData, setPatientAnnualData] = useState([]);
  const [stats, setStats] = useState({ today: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // —— Fonction pour récupérer les données avec token —— //
  const fetchData = async () => {
    if (!token) {
      setError("Utilisateur non connecté");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate },
      };

      const [courbeRes, annualRes, statsRes, patientAnnualRes] = await Promise.all([
        axios.get("http://localhost:5000/api/agenda/stats/courbe", config),
        axios.get("http://localhost:5000/api/agenda/stats/annual", config),
        axios.get("http://localhost:5000/api/agenda/stats/quick", config),
        axios.get("http://localhost:5000/api/agenda/stats/annual", config),
      ]);

      setCourbeData(courbeRes.data);
      setAnnualData(annualRes.data);
      setStats(statsRes.data);
      setPatientAnnualData(patientAnnualRes.data);

    } catch (err) {
      console.error(err);
      setError("Impossible de charger les statistiques");

      if (err.response?.status === 401) {
        logout(); // Déconnexion automatique si token invalide
      }
    } finally {
      setLoading(false);
    }
  };

  // —— useEffect pour fetch au chargement et si token/dateRange change —— //
  useEffect(() => {
    fetchData();
  }, [startDate, endDate, token]);

  // —— Skeleton Loader —— //
  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto bg-white dark:bg-gray-800">
        <Skeleton height={40} width={200} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton height={100} />
          <Skeleton height={100} />
        </div>
        <Skeleton height={350} />
        <Skeleton height={350} />
        <Skeleton height={350} />
      </div>
    );
  }

  // —— Erreur si utilisateur non connecté ou autre erreur —— //
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg shadow-md max-w-md text-center">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors flex items-center mx-auto"
          >
            <FaSync className="mr-2" /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
          📊 Tableau de bord
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-200 dark:bg-gray-700 p-6 rounded-2xl shadow-lg">
        <div className="bg-gray-600 dark:bg-gray-500 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
          <h2 className="text-lg font-semibold text-gray-200 dark:text-gray-300">
            RDV aujourd'hui
          </h2>
          <p className="text-4xl font-bold text-blue-400 dark:text-blue-300 mt-2">
            {stats.today}
          </p>
        </div>
        <div className="bg-gray-600 dark:bg-gray-500 p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
          <h2 className="text-lg font-semibold text-gray-200 dark:text-gray-300">
            RDV ce mois
          </h2>
          <p className="text-4xl font-bold text-green-400 dark:text-green-300 mt-2">
            {stats.thisMonth}
          </p>
        </div>
      </div>

      {/* Charts */}
      {[
        { title: "Évolution mensuelle des rendez-vous", data: courbeData, strokeColor: "#10b981", gradientId: "colorGradient1", dataKey: "mois" },
        { title: "Évolution annuelle des rendez-vous", data: annualData, strokeColor: "#f59e0b", gradientId: "colorGradient2", dataKey: "annee" },
        { title: "Évolution annuelle des patients", data: patientAnnualData, strokeColor: "#3b82f6", gradientId: "colorGradient3", dataKey: "annee" }
      ].map((chart, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            {chart.title}
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="5 5" stroke="#e5e7eb" />
              <XAxis dataKey={chart.dataKey} stroke="#6b7280" fontSize={14} />
              <YAxis stroke="#6b7280" fontSize={14} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Line
                type="monotone"
                dataKey="total"
                stroke={chart.strokeColor}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Total"
              >
                <defs>
                  <linearGradient id={chart.gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chart.strokeColor} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={chart.strokeColor} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={chart.strokeColor}
                  fill={`url(#${chart.gradientId})`}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
