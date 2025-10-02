import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const BASE_URL = "http://localhost:5000";

    const isTokenExpired = useCallback((token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch {
            return true;
        }
    }, []);

    const setAuthToken = useCallback((token) => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
        setError(null);
        console.log("Déconnexion effectuée");
    }, [setAuthToken]);

    // Intercepteur pour gérer automatiquement les 401
    useEffect(() => {
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    console.log('Token expiré ou non autorisé, déconnexion automatique');
                    logout();
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(responseInterceptor);
    }, [logout]);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        console.log("CheckAuth: token =", token);

        if (!token) {
            setLoading(false);
            return;
        }

        if (isTokenExpired(token)) {
            console.log('Token expiré détecté côté client');
            logout();
            setError('Session expirée, veuillez vous reconnecter');
            setLoading(false);
            return;
        }

        setAuthToken(token);

        try {
            const response = await axios.get(`${BASE_URL}/api/auth/verify`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // ✅ Attacher le token au user
            setUser({ ...response.data.user, token });
            setError(null);
            console.log('Vérification réussie, user reçu:', response.data.user);
        } catch (err) {
            console.error('Erreur lors de la vérification du token:', err);
            logout();
            setError(err.response?.data?.error || 'Erreur de vérification de l\'authentification');
        }

        setLoading(false);
    }, [isTokenExpired, setAuthToken, logout]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password, isAdmin = false) => {
        setLoading(true);
        setError(null);

        try {
            const endpoint = isAdmin
                ? `${BASE_URL}/api/auth/admin/login`
                : `${BASE_URL}/api/auth/login`;

            const response = await axios.post(endpoint, { email, password });
            const { token, user } = response.data;

            if (isTokenExpired(token)) {
                throw new Error('Token reçu déjà expiré');
            }

            localStorage.setItem('token', token);
            setAuthToken(token);
            // ✅ Attacher le token au user
            setUser({ ...user, token });
            setError(null);

            console.log("Login réussi, user:", user);
            return { success: true };
        } catch (err) {
            console.error('Erreur lors de la connexion:', err);
            const errorMessage = err.response?.data?.error || 'Erreur de connexion';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = useCallback(async () => {
        try {
            const response = await axios.post(`${BASE_URL}/api/auth/refresh`);
            const { token } = response.data;
            localStorage.setItem('token', token);
            setAuthToken(token);
            if (user) setUser((u) => ({ ...u, token }));
            return { success: true };
        } catch (err) {
            console.error('Erreur lors du rafraîchissement du token:', err);
            logout();
            return { success: false };
        }
    }, [logout, setAuthToken, user]);

    const checkTokenValidity = useCallback(() => {
        if (!loading) checkAuth();
    }, [checkAuth, loading]);

    const value = {
        user,
        login,
        logout,
        loading,
        error,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isDentiste: user?.role === 'dentiste',
        isSecretaire: user?.role === 'secretaire',
        checkTokenValidity,
        refreshToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
