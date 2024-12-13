import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({isAuthenticated: false, userType: '', username: '', firstname: '', lastname: '', token: ''});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token){
            const checkSession = async () => {
                try {
                    const response = await axios.get('/api/check_session', { 
                        headers: { Authorization: `Bearer ${token}` }
                     });
                    if (response.data.username) {
                        setAuth({ 
                            isAuthenticated: true, 
                            userType: response.data.user_type, 
                            username: response.data.username, 
                            firstname: response.data.firstname, 
                            lastname: response.data.lastname,
                        });
                    }
                } catch (error){
                    console.error('No active session');
                }
            };
            checkSession();
        }        
    }, [])

    // Common function to update the auth state
    const updateAuthState = (userData) => {
        setAuth({
            isAuthenticated: true, 
            userType: userData.user_type, 
            username: userData.username, 
            firstname: userData.firstname, 
            lastname: userData.lastname
        });
    }

    // local login
    const login = async (credentials) => {
        try{
            const response = await axios.post('/api/login', credentials, { withCredentials: true });
            const userData = response.data.user;
            updateAuthState(userData);
            localStorage.setItem('token', response.data.access_token);
            sessionStorage.setItem('lastPage', '/welcome/:username');
        }catch (error){
            console.error('Login failed', error);
            throw error;
        }
    };

    const loginCas = async (username) => {
        try{
            const response = await axios.get(`/api/cas_login_confirmation?username=${username}`/*, username, { withCredentials: true }*/);
            const userData = response.data.user;
            updateAuthState(userData);
            localStorage.setItem('token', response.data.access_token);
            sessionStorage.setItem('lastPage', '/welcome/:username');
        }catch(error){
            console.error('Login failed', error);
            throw error;
        }
    };

    const logout = async () => {
        localStorage.removeItem('token');
        setAuth({ isAuthenticated: false, userType: '', username: '', firstname: '', lastname: '' });
        sessionStorage.clear();
        window.location.href = '/';
    };

    return(
        <AuthContext.Provider value={{ auth, login, loginCas, logout }}>
            {children}
        </AuthContext.Provider>
    );
};