import React, { useContext, useState, useEffect } from "react";
import Navbar from "./Navbar";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import PasswordStrengthBar from 'react-password-strength-bar';
import zxcvbn from 'zxcvbn';
import API_BASE_URL from "../config";


const EditProfile = () => {
    const { auth } = useContext(AuthContext);
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        sessionStorage.setItem('lastPage', 'editProfile');
    });

    const validatePassword = (newPassword) => {
        const minStrength = 3;
        const result = zxcvbn(newPassword);

        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /[0-9]/.test(newPassword);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
        const isLongEnough = newPassword.length >= 6;

        return result.score >= minStrength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars && isLongEnough;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords don't match.");
        } else if (!validatePassword(newPassword)) {
            setError("Password must include uppercase letters, lowercase letters, special characters, and be at least 6 characters long.");
        } else {
            try{
                const token = localStorage.getItem('token');
                const response = await axios.post(`${API_BASE_URL}/api/update_password`, {
                    username: auth.username,
                    newPassword: newPassword,
                    userType: auth.userType
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
                setSuccessMessage(response.data.message);
            }catch(error){
                setError(error.response.data.error)
            }
        }       
    }

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h2 className="card-title text-center">Edit Profile</h2>
                                {error && <div className="alert alert-danger">{error}</div>}
                                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input type="text" className="form-control" id="username" value={auth.username} readOnly />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="firstname" className="form-label">First Name</label>
                                        <input type="text" className="form-control" id="firstname" value={auth.firstname} readOnly />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="lastname" className="form-label">Last Name</label>
                                        <input type="text" className="form-control" id="lastname" value={auth.lastname} readOnly />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="userType" className="form-label">User Type</label>
                                        <input type="text" className="form-control" id="userType" value={auth.userType} readOnly />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="userType" className="form-label">Token JWT</label>
                                        <input type="text" className="form-control" id="userType" value={localStorage.getItem('token')} readOnly />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="newPassword" className="form-label">New Password</label>
                                        <ul className="password-requirements">
                                            <li>At least 6 characters</li>
                                            <li>Must contain uppercase and lowercase letters</li>
                                            <li>Must include at least one number</li>
                                            <li>Must contain at least one special character (e.g. !@$%^&*)</li>
                                        </ul>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="newPassword"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                        />
                                        <PasswordStrengthBar password={newPassword} />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Save Password</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditProfile;