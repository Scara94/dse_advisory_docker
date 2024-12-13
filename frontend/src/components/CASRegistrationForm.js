import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const CASRegistrationForm = () =>{
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [userType, setUserType] = useState("student");
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
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            if (userType == "student"){
                const response = await axios.post('/api/cas_registration', {
                    username,
                    firstname,
                    lastname,
                    userType,
                    cohort,
                    serialID
                });
                setSuccessMessage(response.data.message);
                navigate("/");
            } else {
                const response = await axios.post('/api/cas_registration', {
                    username,
                    firstname,
                    lastname,
                    userType
                });
                setSuccessMessage(response.data.message);
                navigate("/");
            }
            
            
        }catch(error){
            setError(error.response.data.error)
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
                                        />
                                    </div>
                                    <div className="mb-3">
                                    <label className="form-label">User Type</label>
                                                <select
                                                    className="form-select"
                                                    value={userType}
                                                    onChange={(e) => setUserType(e.target.value)}
                                                    required
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="teacher">Teacher</option>
                                                </select>
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
                                                <label htmlFor="lastname" className="form-label">Institution</label>
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
export default CASRegistrationForm;