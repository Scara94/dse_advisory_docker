import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({isAuthenticated: false, userType: '', username: '', firstname: '', lastname: '', token: ''});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token){
            const checkSession = async () => {
                try {
                    const response = await axios.get(`${API_BASE_URL}/api/check_session`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (response.data.username) {

                        setAuth({ 
                            isAuthenticated: true, 
                            //userType: response.data.user_type, 
                            userType: localStorage.getItem('userType'),
                            username: response.data.username, 
                            //firstname: response.data.firstname, 
                            firstname: localStorage.getItem('firstname'),
                            //lastname: response.data.lastname,
                            lastname: localStorage.getItem('lastname')
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
        localStorage.setItem('userType', userData.user_type);
        localStorage.setItem('firstname', userData.firstname);
        localStorage.setItem('lastname', userData.lastname);
    }

    // local login
    const login = async (credentials) => {
        try{
            const response = await axios.post(`${API_BASE_URL}/api/login`, credentials/*, { withCredentials: true }*/);
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
            const response = await axios.get(`${API_BASE_URL}/api/cas_login_confirmation?username=${username}`/*, username, { withCredentials: true }*/);
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