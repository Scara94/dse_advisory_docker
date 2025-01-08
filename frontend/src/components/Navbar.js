import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';
import 'bootstrap/js/dist/dropdown';
import 'bootstrap/js/dist/collapse';
import LogoutIcon from '@mui/icons-material/Logout';

function Navbar() {
    const { auth, logout } = useContext(AuthContext);
    const dir = '/welcome/' + auth.username;

    return (
        <>
            <img src="/images/dse_unimi_logo.png" alt="logo"/>
            <nav className="navbar navbar-expand-lg navbar-light">
                <div className="container-fluid">
                    <Link className="navbar-brand" to={dir}>Welcome, {auth.firstname} {auth.lastname}</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            {auth.userType === 'student' && (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/EditProfile">Edit Profile</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/studentThesis">Thesis</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to={dir}>News</Link>
                                    </li>
                                </>
                            )}
                            {auth.userType === 'teacher' && (
                                <>
                                    <li className="nav-item">
                                            <Link className="nav-link" to="/EditProfile">Edit Profile</Link>
                                        </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/News">News</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to={dir}>Thesis</Link>
                                    </li>
                                </>
                                
                            )}
                            {auth.userType === 'coordinator' && (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/EditProfile">Edit Profile</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/manage-users">Users</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/News">News</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to={dir}>Thesis</Link>
                                    </li>
                                </>
                                
                            )}
                            <li className="nav-item">
                                <button className="btn btn-link nav-link" onClick={logout}>
                                    <LogoutIcon /> Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
        
    );
}

export default Navbar;