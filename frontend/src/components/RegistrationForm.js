import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import PasswordStrengthBar from 'react-password-strength-bar';
import zxcvbn from 'zxcvbn';

const RegistrationForm = () =>{
    const [password, setPassword] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [userType, setUserType] = useState("student");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState("");
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [cohortList, setCohortList] = useState([]);
    const [cohort, setCohort] = useState();
    const [serialID, setSerialID] = useState();
    const [institution, setInstitution] = useState('');

    useEffect(() => {
        const fetchCohorts = async () => {
            try {
                const response = await axios.get('/api/cohorts');
                setCohortList(response.data)
            } catch (error){
                setError('Failed to load cohorts');
            }
        };
        fetchCohorts();

        const fetchUsername = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            setUserType(urlParams.get('userType'));            

            try {
                const response = await axios.get(`http://127.0.0.1:5001/api/validate_token?token=${token}`);
                if (response.data.success){
                    setUsername(response.data.username);
                } else {
                    setError('Invalid or expired token');
                }
            } catch (err){
                setError('An error occurred while validating the token');
            }
        };

        fetchUsername();
    }, []);

    const validatePassword = (password) => {
        const minStrength = 3;
        const result = zxcvbn(password);

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 6;

        return result.score >= minStrength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars && isLongEnough;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Password do not match.");
        } else if (!validatePassword(password)) {
            setError("Password must include uppercase letters, lowercase letters, special characters, and be at least 6 characters long.");
        } else {
            try{
                if (userType === "student"){
                    const response = await axios.post('/api/registration', {
                        username,
                        firstname,
                        lastname,
                        userType,
                        password,
                        cohort,
                        serialID
                    });
                    setSuccessMessage(response.data.message);
                    navigate("/login");
                } else {
                    const response = await axios.post('/api/registration', {
                        username,
                        firstname,
                        lastname,
                        userType,
                        password,
                    });
                    setSuccessMessage(response.data.message);
                    navigate("/login");
                }
                
                
            }catch(error){
                setError(error.response.data.error)
            }
        }        
    }
    return(
        <>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <img className="d-block mx-auto mb-4" src="/images/dse_unimi_logo.png" alt="logo"/>
                                <h2 className="card-title text-center">Complete registration</h2>
                                {error && <div className="alert alert-danger">{error}</div>}
                                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label">Username</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="username" 
                                            value={username} 
                                            onChange={(e) => setUsername(e.target.value)}
                                            readOnly
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="firstname" className="form-label">First Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="firstname" 
                                            value={firstname}
                                            onChange={(e) => setFirstname(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="lastname" className="form-label">Last Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="lastname" 
                                            value={lastname}
                                            onChange={(e) => setLastname(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="userType" className="form-label">User Type</label>
                                        <input
                                        type="text"
                                        className="form-control"
                                        id="userType"
                                        value={userType}
                                        onChange={(e) => setUserType(e.target.value)}
                                        readOnly
                                        />
                                    </div>
                                    {userType === 'student' && (
                                        <>
                                            <div className="mb-3">
                                                <label htmlFor="serialId" className="form-label">Serial ID</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="serialID"
                                                    value={serialID}
                                                    onChange={(e) => setSerialID(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor="cohort" className="form-label">Cohort</label>
                                                <select
                                                    className="form-control"
                                                    id="cohort"
                                                    value={cohort}
                                                    onChange={(e) => setCohort(e.target.value)}
                                                >
                                                    <option value="">Select Cohort</option>
                                                    {Array.isArray(cohortList) && cohortList.map((cohort) => (
                                                        <option key={cohort} value={cohort}>
                                                            {cohort}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </>
                                    )}
                                    {userType === 'teacher' && (
                                        <>
                                            <div className="mb-3">
                                                <label htmlFor="lastname" className="form-label">Institution*</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    id="institution" 
                                                    value={institution}
                                                    onChange={(e) => setInstitution(e.target.value)}
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="mb-3">
                                        <label htmlFor="newPassword" className="form-label">Password</label>
                                        <ul className="password-requirements">
                                            <li>At least 8 characters</li>
                                            <li>Must contain uppercase and lowercase letters</li>
                                            <li>Must include at least one number</li>
                                            <li>Must contain at least one special character (e.g. !@$%^&*)</li>
                                        </ul>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="newPassword"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <PasswordStrengthBar password={password} />
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
                                    <button type="submit" className="btn btn-primary">Submit</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </> 
    )
};
export default RegistrationForm;