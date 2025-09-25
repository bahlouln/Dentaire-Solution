import { useEffect, useState } from "react";
import axios from "axios";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, Area
} from "recharts";
import "react-datepicker/dist/react-datepicker.css";
import { FaSync } from "react-icons/fa";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Dashboard = () => {
  const [courbeData, setCourbeData] = useState([]);
  const [annualData, setAnnualData] = useState([]);
  const [patientAnnualData, setPatientAnnualData] = useState([]);
  const [stats, setStats] = useState({ today: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // Fetch data with date range support
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Utilisateur non connecté");

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { startDate, endDate }, // Pass date range to API
      };

      // 📈 Courbe mensuelle des RDV
      const courbeRes = await axios.get(
        "http://localhost:5000/rendezvous/stats/courbe",
        config
      );
      setCourbeData(courbeRes.data);

      // 📈 Courbe annuelle des RDV
      const annualRes = await axios.get(
        "http://localhost:5000/rendezvous/stats/annual",
        config
      );
      setAnnualData(annualRes.data);

      // ⚡ Stats rapides : RDV aujourd'hui et ce mois
      const statsRes = await axios.get(
        "http://localhost:5000/rendezvous/stats/quick",
        config
      );
      setStats(statsRes.data);

      // 📈 Courbe annuelle des patients
      const patientAnnualRes = await axios.get(
        "http://localhost:5000/patients/stats/annual",
        config
      );
      setPatientAnnualData(patientAnnualRes.data);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les statistiques");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // Loading state with skeleton
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

  // Error state with retry button
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
    <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto bg-white dark:bg-gray-00">
      {/* Header with Date Range Picker */}
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-800">
          📊 Tableau de bord
        </h1>
        
      </div>

      {/* Stats Cards */}
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

      {/* Monthly RDV Chart */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Évolution mensuelle des rendez-vous
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={courbeData}>
            <CartesianGrid strokeDasharray="5 5" stroke="#e5e7eb" />
            <XAxis dataKey="mois" stroke="#6b7280" fontSize={14} />
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
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Total RDV"
            >
              <defs>
                <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="total" stroke="#10b981" fill="url(#colorGradient1)" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Annual RDV Chart */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Évolution annuelle des rendez-vous
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={annualData}>
            <CartesianGrid strokeDasharray="5 5" stroke="#e5e7eb" />
            <XAxis dataKey="annee" stroke="#6b7280" fontSize={14} />
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
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Total RDV"
            >
              <defs>
                <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="total" stroke="#f59e0b" fill="url(#colorGradient2)" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Annual Patients Chart */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Évolution annuelle des patients
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={patientAnnualData}>
            <CartesianGrid strokeDasharray="5 5" stroke="#e5e7eb" />
            <XAxis dataKey="annee" stroke="#6b7280" fontSize={14} />
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
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Total Patients"
            >
              <defs>
                <linearGradient id="colorGradient3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#colorGradient3)" />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;