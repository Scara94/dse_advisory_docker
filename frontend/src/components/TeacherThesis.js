import React, { useContext, useMemo, useEffect, useState } from "react";
import axios from "axios";
import 'bootstrap/js/dist/tab';
import { AuthContext } from "../context/AuthContext";
import { MaterialReactTable } from "material-react-table";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, List, ListItem, IconButton, Box, Checkbox, FormControlLabel, FormGroup, Grid2, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { it } from "date-fns/locale";
import API_BASE_URL from "../config";


const TeacherThesis = () => {
    const { auth }  = useContext(AuthContext);
    const [openDialog, setOpenDialog] = useState(false);
    const [ title, setTitle ] = useState('');
    const [ description, setDescription] = useState('');
    const [ keys, setKeys ] = useState('');
    const [ duration, setDuration ] = useState('');
    const [ expiration, setExpiration ] = useState('');
    const [ successMessage, setSuccessMessage ] = useState('');
    const [ error, setError ] = useState('');
    const [ pendingThesis, setPendingThesis ] = useState([]);
    const [ thesisProposalList, setThesisProposalList ] = useState([]);
    const [ editingThesisProposal, setEditingThesisProposal ] = useState('');
    const [ editedThesisProposal, setEditedThesisProposal ] = useState('');
    const [ activatedThesis, setActivatedThesis ] = useState('');
    const [ openDocumentsDialog, setOpenDocumentsDialog] = useState(false);
    const [ thesis, setThesis ] = useState('');
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchPendingThesis();
                await fetchThesisProposal();
                await fetchAllTeacherThesis();
            } catch (error) {
                showMessage("error", "Some problems occur");
            }
        };    
        fetchData();
    }, []);

    const showMessage = (type, message) => {
        if (type === 'error') {
            setError(message);
        } else if (type === 'success') {
            setSuccessMessage(message);
        }

        // Set a timeout to remove the message after 5 seconds
        setTimeout(() => {
            setError(null);
            setSuccessMessage(null);
        }, 5000);  // 5000ms = 5 seconds
    };

    //Function to load all pending theses of the professor
    const fetchPendingThesis = async () => {
        try{
            const token = localStorage.getItem('token');
            const teacher = auth.username;
            const response = await axios.post(`${API_BASE_URL}/api/fetch_pending_thesis`, { teacher }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success) {
                setPendingThesis(response.data.pending_thesis)
            }
        } catch (error){
            const errorMessage = error.response?.data?.message || "Can't fetch the pending thesis.";
            showMessage("error", errorMessage)
        }
    }

    //Function to load all thesis proposals of the professor
    const fetchThesisProposal = async() => {
        try{
            const token = localStorage.getItem('token');
            const teacher = auth.username
            const response = await axios.post(`${API_BASE_URL}/api/fetch_teacher_thesis_proposal`, {teacher}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.data.success){
                setThesisProposalList(response.data.thesis_proposal_list);
            }
        } catch(error){
            const errorMessage = error.response?.data?.message || "Can't fetch thesis proposal.";
            showMessage("error", errorMessage);
        }
    }

    //Function to load all activated theses of the professor
    const fetchAllTeacherThesis = async () => {
        try{
            const token = localStorage.getItem('token');
            const teacher = auth.username;
            const response = await axios.get(`${API_BASE_URL}/api/fetch_teacher_activated_thesis/${teacher}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setActivatedThesis(response.data.activated_thesis_list);
        } catch(error){
            const errorMessage = error.response?.data?.message || "Can't fetch activated thesis.";
            setError(errorMessage);  // Imposta solo il messaggio dell'errore
        }
    }

    // function to handle the creation of the thesis proposal
    const handleMakeThesisProposal = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('keys', keys);
        formData.append('duration', duration);
        formData.append('expiration', expiration);
        formData.append('teacher', auth.username);
        formData.append('userType', auth.userType);

        try{
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/api/add_teacher_proposal`, formData,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success){
                showMessage('success', 'Thesis proposal added correctly!');
                setTitle('');
                setDescription('');
                setKeys('');
                setDuration('');
                setExpiration('');
                fetchThesisProposal();
            }
        } catch (error){
            showMessage('error', 'Error during add a thesis proposal');
        }
    }

    // function to accept the thesis proposal
    const handleAccept = async (thesisId) => {
        try{
            const token = localStorage.getItem('token');
            const response = await axios.patch(`${API_BASE_URL}/api/accept_thesis/${thesisId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success){
                showMessage("success", "Thesis accepted correctly.");
                fetchPendingThesis();
                fetchAllTeacherThesis();
            }
        } catch(error){
            showMessage("error", "Problems during thesis acceptation.");
            fetchPendingThesis();
        }
    }

    // function to decline the thesis
    const handleDecline = async (thesisId) => {
        try{
            const token = localStorage.getItem('token');
            const response = await axios.patch(`${API_BASE_URL}/api/decline_thesis/${thesisId}`,{}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success){
                showMessage("success", "Thesis declined correctly.");
                fetchPendingThesis();
            } else {
                showMessage("error", "Some problems occur when decline the thesis.");
            }
        } catch (error){
            showMessage("error", "Some problems occur when decline the thesis.");
        }
    }

    //functions to handle the editing of the theses
    const handleEditThesisProposal = (thesisProposal) => {
        setEditingThesisProposal(thesisProposal.id);
        setEditedThesisProposal({id: thesisProposal.id, title: thesisProposal.title, description: thesisProposal.description, keys: thesisProposal.keys, duration: thesisProposal.duration, expiration: thesisProposal.expiration });
        setOpenDialog(true);
    }

    const handleCloseEditDialog = () => {
        setOpenDialog(false);
        setEditedThesisProposal('');
    }

    const handleSaveProposal = async (proposalID) => {
        try{
            const formData = new FormData();
            formData.append('title', editedThesisProposal.title);
            formData.append('description', editedThesisProposal.description);
            formData.append('keys', editedThesisProposal.keys);
            formData.append('expiration', editedThesisProposal.expiration);
            formData.append('duration', editedThesisProposal.duration);
            const token = localStorage.getItem('token');
            const response = await axios.patch(`${API_BASE_URL}/api/update_thesis_proposal/${proposalID}`, formData,{
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success){
                showMessage("success", "Thesis proposal updated successfully");
                setEditingThesisProposal(null);
                setEditedThesisProposal('');
                fetchThesisProposal();
            } else {
                showMessage("error", "Failed to update thesis proposal.");
            }
        } catch(error){
            showMessage("error", "Failed to update thesis proposal.");
        }
    }

    const handleDeleteThesisProposal = async (thesisProposalID) => {
        try{
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/api/delete_thesis_proposal/${thesisProposalID}`, { is_deleted: true }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showMessage('success', 'Proposal deleted successfully!');
            fetchThesisProposal();
        } catch(error){
            showMessage('error', 'Failed to delete proposal!');
        }
    }

    const pendingThesisColumns = useMemo(() => [
        {
            header: 'Title',
            accessorKey: 'title',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString'
        },
        {
            header: 'Student Username',
            accessorKey:'student_username',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString'
        },
        {
            header: 'Student firstname',
            accessorKey: 'firstname',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString'
        },
        {
            header: 'Student lastname',
            accessorKey: 'lastname',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString'
        },
        {
            header: 'Student ID',
            accessorKey: 'serial_id',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString'
        },
        {
            header: 'Action',
            accessorKey:'action',
            Cell: ({row}) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}> 
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleAccept(row.original.id)}
                    >
                        Accept
                    </Button>
                    
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDecline(row.original.id)}
                    >
                        Decline
                    </Button>
                </div>
            )
        }
    ], [])

    const thesisProposalColumns = useMemo(() => [
        {
            header: 'Title',
            accessorKey: 'title',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString'
        },
        {
            header: 'Expiration',
            accessorKey: 'expiration',
            Cell: ({ cell }) => cell.getValue()
                ? new Date(cell.getValue()).toLocaleDateString({ year: 'numeric', month: 'long', day: 'numeric' })
                : 'No Expiration',
            sortingFn: 'datetime',
            enableSorting: true,
            enableColumnFilter: false,
            filterFn: 'equals'
        },
        {
            header: 'Duration',
            accessorKey: 'duration',
            enableSorting: true,
            enableColumnFilter: false,
            filterFn: 'includesString'
        },
        {
            header: 'Keys',
            accessorKey: 'keys',
            //enableSorting: true
        },
        {
            header: 'Actions',
            accessorKey: 'actions',
            Cell: ({row}) => (
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditThesisProposal(row.original)}  // Funzione vuota
                        style={{ width: 'auto' }}
                        >
                        Edit
                    </Button>
                    <br />
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDeleteThesisProposal(row.original.id)}
                        style={{ width: 'auto' }}
                    >
                        Delete
                    </Button>
                </div>
            ),
            enableColumnFilter: false            
        }
    ], []);

    const handleOpenDocumentsDialog = (thesis) => {
        setThesis({"id": thesis.id, "documents": thesis.documents});
        setOpenDocumentsDialog(true);
    };

    const handleCloseDocumentsDialog = () => {
        setThesis('');
        setOpenDocumentsDialog(false);
    }

    const activatedThesisColumns = useMemo(() => [
        {
            header: 'Title',
            accessorKey: 'title',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString'
        },
        {
            header: 'Assignment Date',
            accessorKey: 'assignmentdate',
            Cell: ({ cell }) => cell.getValue()
                ? new Date(cell.getValue()).toLocaleDateString({ year: 'numeric', month: 'long', day: 'numeric' })
                : 'No Expiration',
            sortingFn: 'datetime',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'equals'
        },
        {
            header: 'Student ID',
            accessorKey: 'serial_id',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString'
        },
        {
            header: 'Student Name and Username',
            accessorKey:'student_username',
            Cell: ({ row }) => {
                const firstName = row.original.firstname;
                const lastName = row.original.lastname;
                const username = row.original.student_username;
        
                return `${firstName} ${lastName} (${username})`;
            },
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString'
        },
        {
            header: 'Attached documents',
            accessorKey: 'document_ids',
            Cell: ({row}) => (
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenDocumentsDialog(row.original)}
                    >
                        Show Documents
                    </Button>
                </div>
            ),
            enableColumnFilter: false,
            enableSorting: false,  // disable the sorting
        },       
    ], [])

    return (
        <>
            <div className="container-fluid mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-12">
                        <ul className="nav nav-tabs tabs-fullwidth" id="manageThesis" role="tablist">
                            <li className="nav-item">
                                <button 
                                    className="nav-link active"
                                    id="manage-thesis-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#manage-thesis"
                                    type="button"
                                    role="tab"
                                    aria-controls="manage-thesis"
                                    aria-selected="true"
                                >
                                    Activated Thesis
                                </button>
                            </li>

                            <li className="nav-item">
                                <button 
                                    className="nav-link"
                                    id="manage-thesis-proposal-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#manage-thesis-proposal"
                                    type="button"
                                    role="tab"
                                    aria-controls="manage-thesis-proposal"
                                    aria-selected="false"
                                >
                                    Manage Thesis Proposals
                                </button>
                            </li>

                            <li className="nav-item">
                                <button 
                                    className="nav-link"
                                    id="pending-thesis-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#pending-thesis"
                                    type="button"
                                    role="tab"
                                    aria-controls="pending-thesis"
                                    aria-selected="false"
                                >
                                    Pending Thesis
                                </button>
                            </li>

                            <li className="nav-item">
                                <button 
                                    className="nav-link"
                                    id="thesis-proposal-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#thesis-proposal"
                                    type="button"
                                    role="tab"
                                    aria-controls="thesis-proposal"
                                    aria-selected="true"
                                >
                                    New Thesis Proposal
                                </button>
                            </li>
                        </ul>
                        <div className="tab-content mt-3">
                            <div className="tab-pane fade show active" id="manage-thesis" role="tabpanel" aria-labelledby="manage-thesis-proposal-tab">
                                <div className="card mt-3">
                                    <div className="card-body">
                                        <h2 className="card-title text-center">Activated Thesis</h2>
                                        {error && <div className="alert alert-danger">{error}</div>}
                                        {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                       {activatedThesis.length > 0 ?(
                                            <>
                                                <MaterialReactTable
                                                    columns={activatedThesisColumns}
                                                    data={activatedThesis}
                                                    enableSorting
                                                    enableGlobalFilter={false}
                                                />

                                                <Dialog open={openDocumentsDialog} onClose={handleCloseDocumentsDialog} fullWidth>
                                                    <DialogTitle>Attached Documents</DialogTitle>
                                                    <Box p={2}>
                                                        {(() => {
                                                            const validDocuments = thesis.documents?.filter(doc => doc && doc.id !== null) || [];
                                                            return validDocuments.length > 0 ? (
                                                                <>
                                                                    <strong>Attached Documents</strong>
                                                                    <List>
                                                                        {validDocuments.map((doc) => (
                                                                            <ListItem key={doc.id}>
                                                                                <Grid2 container spacing={2}>
                                                                                    {/* Colonna sinistra: informazioni sul file */}
                                                                                    <Grid2 item xs={6}>
                                                                                        <a href={`${API_BASE_URL}/api/download/${doc.id}`} className="btn btn-link">
                                                                                            {doc.name || 'Unknown Document'}
                                                                                        </a>
                                                                                    </Grid2>

                                                                                    {/* Colonna destra: descrizione del file */}
                                                                                    <Grid2 item xs={6}>
                                                                                        <Typography variant="body2" color="textSecondary">
                                                                                            <br></br>
                                                                                            {doc.description || 'No description available'}
                                                                                        </Typography>
                                                                                    </Grid2>
                                                                                </Grid2>
                                                                            </ListItem>
                                                                        ))}
                                                                    </List>
                                                                </>
                                                            ) : (
                                                                <Typography variant="body2" color="textSecondary" style={{ margin: '16px 0' }}>
                                                                    No Attached Documents
                                                                </Typography>
                                                            );
                                                        })()}
                                                    </Box>
                                                    <DialogActions>
                                                        <Button onClick={() => handleCloseDocumentsDialog()} color="primary">OK</Button>
                                                    </DialogActions>
                                                </Dialog>
                                            </>
                                       ):(
                                        <p className="text-center">No activated thesis available.</p>
                                       )}
                                    </div>
                                </div>
                            </div>

                            <div className="tab-pane fade" id="manage-thesis-proposal" role="tabpanel" aria-labelledby="manage-thesis-tab">
                                <div className="card mt-3">
                                    <div className="card-body">
                                        <h2 className="card-title text-center">Manage Thesis Proposals</h2>
                                        {error && <div className="alert alert-danger">{error}</div>}
                                        {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                        {thesisProposalList.length > 0 ? (
                                            <>
                                                <MaterialReactTable 
                                                    columns={thesisProposalColumns}
                                                    data={thesisProposalList}
                                                    enableSorting
                                                    enableColumnFilters
                                                    enableGlobalFilter
                                                    initialState={{
                                                        columnVisibility: { keys: false }, // Hide the 'keys' column (if it is present by mistake)
                                                    }}
                                                />

                                                {/* Dialog for editing the thesis proposal */}
                                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                                                    <Dialog open={openDialog} onClose={handleCloseEditDialog} fullWidth>
                                                        <DialogTitle>Edit Thesis Proposal</DialogTitle>
                                                        <DialogContent>
                                                            {editedThesisProposal && (
                                                                <form>
                                                                    <br />
                                                                    <Box mb={2}>
                                                                        <TextField 
                                                                            label="Title"
                                                                            value={editedThesisProposal.title}
                                                                            onChange={(e) => setEditedThesisProposal({ ...editedThesisProposal, title: e.target.value})}
                                                                            fullWidth
                                                                        />
                                                                    </Box>

                                                                    <Box mb={2}>
                                                                        <TextField
                                                                            label="Description"
                                                                            value={editedThesisProposal.description}
                                                                            onChange={(e) => setEditedThesisProposal({ ...editedThesisProposal, description: e.target.value})}
                                                                            fullWidth
                                                                            multiline
                                                                            rows={4}
                                                                        />
                                                                    </Box>

                                                                    <Box mb={2}>
                                                                        <TextField
                                                                            label="Keywords"
                                                                            value={editedThesisProposal.keys}
                                                                            onChange={(e) => setEditedThesisProposal({ ...editedThesisProposal, keys: e.target.value})}
                                                                            fullWidth
                                                                        />
                                                                    </Box>

                                                                    <Box mb={2}>
                                                                        <DatePicker
                                                                            label="Expiration Date"
                                                                            value={editedThesisProposal.expiration ? new Date(editedThesisProposal.expiration) : null}
                                                                            onChange={(newValue) => setEditedThesisProposal({...editedThesisProposal, expiration: newValue})}
                                                                            renderInput={(params) => <TextField {...params} fullWidth />}
                                                                        />
                                                                    </Box>

                                                                    <Box mb={2}>
                                                                        <TextField
                                                                            label="Duration"
                                                                            value={editedThesisProposal.duration}
                                                                            onChange={(e) => setEditedThesisProposal({...editedThesisProposal, duration: e.target.value})}
                                                                            fullWidth
                                                                        />
                                                                    </Box>
                                                                </form>
                                                            )}
                                                        </DialogContent>
                                                        <DialogActions>
                                                            <Button onClick={() => handleCloseEditDialog()} color="secondary">Cancel</Button>
                                                            <Button onClick={() => {handleSaveProposal(editedThesisProposal.id); handleCloseEditDialog()}} color="primary">Save</Button>
                                                        </DialogActions>
                                                    </Dialog>
                                                </LocalizationProvider>
                                            </>
                                        ) : (
                                            <p className="text-center">No thesis proposal available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="tab-pane fade" id="pending-thesis" role="tabpanel" aria-labelledby="pending-thesis">
                                <div className="card mt-3">
                                    <div className="card-body">
                                        <h2 className="card-title text-center">Pending Thesis</h2>
                                        {error && <div className="alert alert-danger">{error}</div>}
                                        {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                        {pendingThesis.length > 0 ? (
                                            <MaterialReactTable 
                                            columns={pendingThesisColumns}
                                            data={pendingThesis}
                                            enableSorting
                                            enableColumnFilters
                                            enableGlobalFilter={false}
                                           />
                                        ) : (
                                            <p className="text-center">No pending thesis available.</p>
                                        )}                                       
                                    </div>
                                </div>
                            </div>

                            <div className="tab-pane fade" id="thesis-proposal" role="tabpanel" aria-labelledby="thesis-proposal-tab">
                                <div className="card mt-3">
                                    <div className="card-body">
                                        <h2 className="card-title text-center">Make a thesis proposal</h2>
                                        <form onSubmit={handleMakeThesisProposal}>
                                            <div className="mb-3">
                                                {error && <div className="alert alert-danger">{error}</div>}
                                                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                                <div className="mb-3">
                                                    <label htmlFor="title" className="form-label">Title*</label>                                                
                                                    <textarea 
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Title"
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                               
                                                <div className="mb-3">
                                                    <label htmlFor="description" className="form-label">Description*</label>
                                                    <textarea 
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Description"
                                                        value={description}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                        required
                                                    />
                                                </div>                                                

                                                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                                                    <div className="mb-3">
                                                        <label htmlFor="expiration" className="form-label">Expiration Date</label>
                                                        <br />
                                                        <DatePicker 
                                                            value={expiration}
                                                            onChange={(newValue) => setExpiration(newValue)}
                                                        />
                                                    </div>
                                                </LocalizationProvider>

                                                <div className="mb-3">
                                                    <label htmlFor="keys" className="form-label">Keywords</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Keywords"
                                                        value={keys}
                                                        onChange={(e) => setKeys(e.target.value)}
                                                    />
                                                </div>

                                                <div className="mb-3">
                                                    <label htmlFor="duration" className="form-label">Duration (in weeks)*</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Duration"
                                                        value={duration}
                                                        onChange={(e) => setDuration(e.target.value)}
                                                    />
                                                </div>

                                                <button type="submit" className="btn btn-primary w-100">Add</button>

                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default TeacherThesis;