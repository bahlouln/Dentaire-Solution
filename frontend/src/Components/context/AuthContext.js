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

    const isTokenExpired = useCallback((token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp < currentTime;
        } catch (error) {
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
        localStorage.removeItem('last-auto-sync-timestamp');
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
        setError(null);
    }, [setAuthToken]);

    useEffect(() => {
        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    console.log('Token expiré, déconnexion automatique');
                    logout();
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [logout]);

    const checkAuth = useCallback(async () => {


        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        if (isTokenExpired(token)) {
            console.log('Token expiré détecté côté client');
            localStorage.removeItem('token');
            setAuthToken(null);
            setUser(null);
            setError('Session expirée, veuillez vous reconnecter');
            setLoading(false);
            return;
        }

        setAuthToken(token);

        try {
            const response = await axios.get('/api/auth/verify');
            setUser(response.data.user);
            setError(null);
        } catch (error) {
            console.error('Erreur lors de la vérification du token:', error);
            localStorage.removeItem('token');
            setAuthToken(null);
            setUser(null);

            if (error.response?.status === 401) {
                setError('Session expirée, veuillez vous reconnecter');
            } else {
                setError('Erreur de vérification de l\'authentification');
            }
        }

        setLoading(false);
    }, [isTokenExpired, setAuthToken]);

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email, password, isAdmin = false) => {
        setLoading(true);
        setError(null);

        try {
            const endpoint = isAdmin ? '/api/auth/admin/login' : '/api/auth/login';
            const response = await axios.post(endpoint, { email, password });
            const { token, user } = response.data;

            if (isTokenExpired(token)) {
                throw new Error('Token reçu déjà expiré');
            }

            localStorage.setItem('token', token);
            setAuthToken(token);
            setUser(user);
            setError(null);

            return { success: true };
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            const errorMessage = error.response?.data?.error || 'Erreur de connexion';
            setError(errorMessage);

            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = useCallback(async () => {
        try {
            const response = await axios.post('/api/auth/refresh');
            const { token } = response.data;

            localStorage.setItem('token', token);
            setAuthToken(token);

            return { success: true };
        } catch (error) {
            console.error('Erreur lors du rafraîchissement du token:', error);
            logout();
            return { success: false };
        }
    }, [logout, setAuthToken]);

    const checkTokenValidity = useCallback(() => {
        if (!loading) {
            checkAuth();
        }
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
        refreshToken
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};