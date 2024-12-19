import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'

const HomePage = () => {

    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        const message = sessionStorage.getItem('cas_error');
        if (message){
            showMessage(message);
            sessionStorage.removeItem('cas_error');
        }
    }, []);

    const handleLocalLoginRedirect = () => {
        navigate('/login')
    };
    

    const showMessage = (message) => {
        setError(message);
        setTimeout(() => {
            setError(null);
        }, 5000);
    };

    

    const handleCasLoginRedirect = async () => {
       try{
        const response = await axios.get('http://127.0.0.1:5001/api/cas_login');
        window.location.href = response.data.cas_url;
       } catch(error){
        console.error("Error to redirect to CAS server", error)
       }
    }

    return(
        <div className="container" style={{ minHeight: '100vh' }}>
        <div className="row justify-content-center align-items-center" style={{ height: '100vh' }}>
            <div className="col-md-6">
                <div className="card mb-3">
                    <div className="card-body text-center">
                        <img src="/images/dse_unimi_logo.png" alt="logo" />
                        <h1>Class Toolbox</h1>
                        <div className="d-grid gap-2">
                            {error && <div className="alert alert-danger">{error}</div>}
                            <button className="btn btn-primary" type="button" onClick={handleCasLoginRedirect}>
                                Login via UNIMI account
                            </button>
                            <button className="btn btn-primary" type="button" onClick={handleLocalLoginRedirect}>
                                Login via local account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};

export default HomePage;