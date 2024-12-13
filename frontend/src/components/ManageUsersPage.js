import React, { useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
//import { AuthContext } from '../context/AuthContext';
import Navbar from './Navbar';
import 'bootstrap/js/dist/tab';
import { MaterialReactTable } from 'material-react-table';
import { Button } from "@mui/material";


const ManageUsersPage = () => {
    //const { auth } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [userType, setUserType] = useState('student');
    const [message, setMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const [users, setUsers] = useState([]);
    const [file, setFile] = useState('');

    useEffect(() => {
        sessionStorage.setItem('lastPage','manage-users');
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/fetchUsers', {
                headers: { Authorization: `Bearer ${token}`}
            });
            setUsers(response.data.users);
        } catch (error) {
            console.error('Errore nel recuper degli utenti:', error);
        }
    }

    const showMessage = (type, message) => {
        if (type === 'error') {
            setError(message);
        } else if (type === 'success') {
            setSuccessMessage(message);
        }

        // Imposta un timeout per rimuovere il messaggio dopo 5 secondi
        setTimeout(() => {
            setError(null);
            setSuccessMessage(null);
        }, 5000);  // 5000ms = 5 secondi
    };

    const showMessageForMail = (type, message) => {
        if (type === 'error') {
            setError(message);
        } else if (type === 'success') {
            setSuccessMessage(message);
        }
    }

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/add_user', { username, userType }, {
                headers: { Authorization: `Bearer ${token}`}
            });
            //console.log(response)
            if (response.data.success) {
                //setMessage('User added correctly!');
                showMessage('success', 'User added successfully!');
                //una volta inserito l'utente, pulisco i campi del form
                setUsername('');
                setUserType('student');
            }
        } catch (error) {   
            if (error.response.status === 409){                    
                //setMessage('User already exists!');
                showMessage('error', 'User already exists!');
            } else {
                //setMessage('Error adding user!');
                showMessage('error', 'Error adding user');
            }         
            //console.error('Error adding user: ', error);
        }
    };

    const handleToggleActivation = async (username, currentStatus, userType) => {
        try{
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/toggle_activation', { username, isActive: !currentStatus, userType }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                //setEditMessage('User modified successfully!');
                showMessage('success', 'User modified successfully!')
                fetchUsers(); //refresh user list
            }
        } catch (error){
            //setEditMessage('Error editing user!');
            showMessage('error', 'Error editing user!')
            console.error('Error editing user!');
        }
    };

    const handleAddMultipleUsers = async (e) => {
        e.preventDefault();
        try{
            const formData = new FormData();
            formData.append('userType', userType);
            formData.append('file', file);
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/add_multiple_users', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success){
                showMessage('success', 'Users added successfully!');
                if (response.data.invalidEmails && response.data.invalidEmails.length > 0) {
                    const invalidEmailsMessage = `The following emails are invalid:\n${response.data.invalidEmails.join('\n')}`;
                    showMessageForMail('error', invalidEmailsMessage);
                }
                if (response.data.failedEmails && response.data.failedEmails.length > 0){
                    const failedEmailsMessage = `The following email are invalid:\n${response.data.failedEmails.join('\n')}`;
                    showMessageForMail('error', failedEmailsMessage);
                }
                
            }
        }catch (error){
            showMessage('error', 'Error adding users!');
        }
        
    };

    const columns = useMemo(() =>[
        {
            header: 'Username',
            accessorKey: 'username',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString',
        },
        {
            header: 'First Name',
            accessorKey: 'firstname',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString',
        },
        {
            header: 'Last Name',
            accessorKey: 'lastname',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString',
        },
        {
            header: 'User Type',
            accessorKey: 'user_type',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString',
        },
        {
            header: 'Action',
            accessorKey:'action',
            Cell: ({row}) => (
                <div>
                {row.original.is_active ? (
                    <Button
                        variant='contained'
                        color='error'
                        onClick={() => handleToggleActivation(row.original.username, row.original.is_active, row.original.user_type)}
                    >
                        Deactivate
                    </Button>
                ) : (
                    <Button
                        variant='contained'
                        color='success'
                        onClick={() => handleToggleActivation(row.original.username, row.original.is_active, row.original.user_type)}
                    >
                        Activate
                    </Button>
                )}
            </div>
            )
        }
    ], []);

    return (
        <>
            <Navbar />
            <div className="container-fluid mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-12">
                    <ul className="nav nav-tabs tabs-fullwidth" id="manageUsersTab" role="tablist">
                        <li className="nav-item">
                            <button className="nav-link active" id="edit-user-tab" data-bs-toggle="tab" data-bs-target="#edit-user" type="button" role="tab" aria-controls="edit-user" aria-selected="true">
                                Manage Users
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link" id="add-user-tab" data-bs-toggle="tab" data-bs-target="#add-user" type="button" role="tab" aria-controls="add-user" aria-selected="false">
                                Add User
                            </button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link" id="add-multiple-user-tab" data-bs-toggle="tab" data-bs-target="#add-multiple-user" type="button" role="tab" aria-controls="add-multiple-user" aria-selected="false">
                                Add Multiple Users
                            </button>
                        </li>                                                    
                    </ul>
                    <div className="tab-content" id="manageUsersTabContent">
                            <div className="tab-pane fade show active" id="edit-user" role="tabpanel" aria-labelledby="edit-user-tab">
                                <div className="card mt-3">
                                    <div className="card-body">
                                        <h2 className="card-title text-center">Manage Users</h2>
                                        {error && <div className="alert alert-danger">{error}</div>}
                                        {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                        <MaterialReactTable
                                            columns={columns}
                                            data={users}
                                            enableSorting
                                            enableColumnFilters
                                            enableGlobalFilter={false} 
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane fade" id="add-user" role="tabpanel" aria-labelledby="add-user-tab">
                                <div className="card mt-3">
                                    <div className="card-body">
                                        <h2 className="card-title text-center">Add New User</h2>
                                        <form onSubmit={handleAddSubmit}>
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
                                                    <option value="coordinator">Coordinator</option>
                                                </select>
                                            </div>                                         
                                            <div className="mb-3">
                                                <label className="form-label">Username</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder='email'
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            
                                            <button type="submit" className="btn btn-primary w-100">Add User</button>
                                        </form>
                                        {message && <p className="mt-3 text-center">{message}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane fade" id="add-multiple-user" role="tabpanel" aria-labelledby="add-multiple-user-tab">
                                <div className="card mt-3">
                                    <div className="card-body">
                                        <h2 className="card-title text-center">Add Multiple User</h2>
                                        {error && <div className="alert alert-danger">{error}</div>}
                                        {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                        <form onSubmit={handleAddMultipleUsers}>
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
                                                    <option value="coordinator">Coordinator</option>
                                                </select>
                                            </div>                                         
                                            <div className="mb-3">
                                                <label htmlFor="fileUpload" className="form-label">Upload CSV</label>
                                                    <input
                                                        type="file"
                                                        className="form-control"
                                                        id="fileUpload"
                                                        accept=".csv"
                                                        required
                                                        onChange={(e) => setFile(e.target.files[0])}  // Gestione del file caricato
                                                    />
                                            </div>
                                            
                                            <button type="submit" className="btn btn-primary w-100">Add Users</button>
                                        </form>
                                        {message && <p className="mt-3 text-center">{message}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default ManageUsersPage;
