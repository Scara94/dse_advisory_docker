// React component that handles the redirect and updates the context
import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";


const CasCallbackPage = () => {
    const navigate = useNavigate();
    const { loginCas } = useContext(AuthContext);
    
    useEffect(() => {
        const confirmCAS = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const username = urlParams.get('username');
            const success = urlParams.get('success');
            if(success === 'False'){
                sessionStorage.setItem('cas_error', 'User not activated')
                navigate('/');
            } else {
                // Make a call to the backend to retrieve the data of the authenticated CAS user
                try{
                    await loginCas(username);
                    navigate('/welcome/' + username);
                }catch(error){
                    sessionStorage.setItem('cas_error', 'Invalid credentials');
                }
            }
            
        };
        confirmCAS();        
    }, []);

    return <div>Loading...</div>;
};

export default CasCallbackPage;
