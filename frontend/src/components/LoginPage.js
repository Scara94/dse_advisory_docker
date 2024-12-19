import React, { useContext, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const showMessage = (type, message) => {
        setError(message);
        setTimeout(() => {
            setError(null);
        }, 5000);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const credentials = { username, password };
        try{
            await login(credentials);
            navigate('/welcome/' + credentials.username);
        } catch(error){
            showMessage('error', "Invalid credentials");
            //showMessage('error', error);
        }
    };

    return(
        <div className="container" style={{ minHeight: '100vh' }}>
            <div className="row justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body text-center">
                        <img src="/images/dse_unimi_logo.png" alt="logo"/>
                        <h1 className="card-title text-center">Login via local account</h1>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="mb-3">
                            <input
                            type="text"
                            className="form-control"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary w-100" onClick={handleLogin}>
                            Login
                        </button>
                        
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage