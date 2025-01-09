import React, { useContext, useMemo, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import 'bootstrap/js/dist/tab';
import { AuthContext } from "../context/AuthContext";
import { MaterialReactTable } from "material-react-table";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Box, List, ListItem, IconButton, Typography, Grid2 } from "@mui/material";
import { Autocomplete } from "@mui/material";
import  DeleteOutlineOutlinedIcon  from '@mui/icons-material/DeleteOutlineOutlined';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { it } from "date-fns/locale";
import API_BASE_URL from "../config";

const StudentThesis = () => {
    const { auth } = useContext(AuthContext);
    const [ thesisProposalList, setThesisProposalList ] = useState([]);
    const [ infoThesisProposal, setInfoThesisProposal ] = useState('');
    const [ openInfoDialog, setOpenInfoDialog ] = useState(false);
    const [ error, setError ] = useState('');
    const [ title, setTitle ] = useState('');
    const [ duration, setDuration ] = useState('');
    const [ successMessage, setSuccessMessage ] = useState('');
    const [ supervisor, setSupervisor ] = useState('');
    const [ cosupervisor, setCosupervisor ] = useState('');
    const [ teachersList, setTeachersList ] = useState([]);
    const [ inputValue, setInputValue ] = useState('');
    const [ inputValue2, setInputValue2 ] = useState('');
    const [ selectedSupervisor, setSelectedSupervisor ] = useState(null);
    const [ selectedCosupervisor, setSelectedCosupervisor ] = useState(null);
    const [ thesis, setThesis ] = useState('');
    const [ editedThesis, setEditedThesis ] = useState('');
    const [ openDialog, setOpenDialog ] = useState(false);
    const [ openChangeSupCosupDialog, setOpenChangeSupCosupDialog ] = useState(false);
    const [ newSupervisor, setNewSupervisor ] = useState('');
    const [ newSelectedSupervisor, setNewSelectedSupervisor ] = useState(null);
    const [ newCosupervisor, setNewCosupervisor ] = useState('');
    const [ newSelectedCosupervisor, setNewSelectedCosupervisor ] = useState(null);
    const [ inputValue3, setInputValue3 ] = useState('');
    const [ inputValue4, setInputValue4 ] = useState('');
    const [ selectedFile, setSelectedFile ] = useState(null);
    const [ description, setDescription ] = useState('');
    const [ openConfirm, setOpenConfirm ] = useState(false);

    useEffect(() => {
        sessionStorage.setItem('lastPage', '/studentThesis');
        //Here, we should load all available theses.
        fetchAllThesisProposal();
        fetch_all_teachers();
        fetchStudentThesis();
    }, []);

    const showMessage = (type, message) => {
        if (type === 'error') {
            setError(message);
        } else if (type === 'success') {
            setSuccessMessage(message);
        }

        setTimeout(() => {
            setError(null);
            setSuccessMessage(null);
        }, 5000);
    };

    const fetch_all_teachers = async () => {
        try{
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/fetch_all_teachers`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (response.data.success){
                setTeachersList(response.data.teachers_list);
            }
        } catch (error){
            setError(error);
        }
    };

    const fetchStudentThesis = async () => {
        try{
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/fetch_student_thesis/${auth.username}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setThesis(response.data.student_thesis);
        } catch(error){
            setError(error);
        }       
    };

    // Function to load all available theses
    const fetchAllThesisProposal = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/fetch_all_thesis_proposal`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setThesisProposalList(response.data.thesis_proposal_list);
        } catch (error) {
            setError(error);
        }
    }; 

    // functions to handle the dialog for the thesis info
    const handleThesisInfo = (thesis) => {
        setInfoThesisProposal({ title: thesis.title, description: thesis.description, duration: thesis.duration, expiration: thesis.expiration, teacher_username: thesis.teacher_username, teacher_firstname: thesis.teacher_firstname, teacher_lastname: thesis.teacher_lastname });
        setOpenInfoDialog(true);
    };

    const handleCloseThesisInfo = () => {
        setInfoThesisProposal('');
        setOpenInfoDialog(false);
    };

    // Function to handle the thesis proposal by the student
    const handleStudentThesisProposal = async (e) =>{
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", title);
        formData.append("supervisor", supervisor);
        formData.append("cosupervisor", cosupervisor);
        formData.append("duration", duration);
        formData.append("student_username", auth.username);
        try{
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/api/make_student_thesis_proposal`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (response.data.success){
                showMessage("success", "Proposal sent successfully!");
            }
        } catch(error){
            showMessage("error", "Proposal had some problems!");
        }
    };

    // functions to handle the documents
    const handleDeleteDocument = async (docId) => {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${API_BASE_URL}/api/delete_doc/${docId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success){
            showMessage("success", "Document deleted correctly");
            setOpenConfirm(false);
            fetchStudentThesis();
        } else {
            showMessage('error', 'Error during delete the document');
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0]; // Solo un file alla volta
        setSelectedFile(file);
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    const handleUploadDocument = async (file, description, thesisId) => {
        try{
            const formData = new FormData();
            formData.append('file', file)
            formData.append('description', description);
            const token = localStorage.getItem('token');

            const response = await axios.post(`${API_BASE_URL}/api/upload_thesis_docs/${thesisId}`, formData, {
                headers: { Authorization: `Bearer ${token}`}
            });
            if (response.data.success){
                showMessage('success', 'Document added successfully!');
                fetchStudentThesis();
            }
        } catch(error){
            showMessage('error', 'Error during upload files!')
        }
    };

    const handleUploadClick = () => {
        if (selectedFile && description.trim()) {
            handleUploadDocument(selectedFile, description, thesis.id); // Passa i dati alla funzione
            setSelectedFile(null); // Reset file
            setDescription('');    // Reset descrizione
        } else {
            alert('Please select a file and enter a description.');
        }
    };

    // functions to handle the thesis
    const handleEditThesis = (thesis) => {
        setEditedThesis(thesis);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditedThesis('');
    };

    const handleSaveThesis = async (thesisId) => {
        try{
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('title', editedThesis.title);
            formData.append('discussiondate', editedThesis.discussiondate);
            await axios.patch(`${API_BASE_URL}/api/update_thesis/${thesisId}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showMessage('success', 'Thesis updated successfully');
            setEditedThesis('');
            fetchStudentThesis();
        } catch(error){
            showMessage('error', 'Failed to update thesis.');
        }
    };

    const handleChangeSupCosup = (thesis) => {
        setEditedThesis(thesis);
        setOpenChangeSupCosupDialog(true);
    };

    const handleCloseChangeSupCosup = () => {
        setOpenChangeSupCosupDialog(false);
        setEditedThesis('');
    };

    const handleSaveChangeSupCosup = async (thesisId) => {
        try{
            const token = localStorage.getItem('token');
            const formData = new FormData()
            formData.append('newSupervisor', newSupervisor);
            formData.append('newCosupervisor', newCosupervisor);
            await axios.patch(`${API_BASE_URL}/api/change_sup_cosup/${thesisId}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showMessage('success', 'Supervisor/Co-supervisor changed correctly!')
        } catch(error){
            showMessage('error', 'Failed change supervisor or co-supervisor!');
            setNewSupervisor('');
            setNewCosupervisor('');
            setNewSelectedSupervisor(null);
            setNewSelectedCosupervisor(null);
        }
    }

    //functions to handle the confirmation of document deletion
    const handleOpenConfirmDeleteDocumentDialog = () => {
        setOpenConfirm(true);
    }

    const handleCloseConfirmDeleteDocumentDialog = () => {
        setOpenConfirm(false);
    }

    const columns = useMemo(() => [
        {
            header: 'Title',
            accessorKey: 'title',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString'
        },
        {
            header: 'Duration (in weeks)',
            accessorKey: 'duration',
            enableSorting: true,
            enableColumnFilter: false,
            filterFn: 'includesString'
        },
        {
            header: 'Teacher',
            accessorKey: 'teacher',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString',
            Cell: ({ row }) => {
                const firstName = row.original.teacher_firstname;
                const lastName = row.original.teacher_lastname;
                const username = row.original.teacher_username;
        
                return `${firstName} ${lastName} (${username})`;
            }
        },
        {
            header: 'Keys',
            accessorKey: 'keys'
        },
        {
            header: 'Actions',
            accessorKey: 'actions',
            Cell: ({row}) => (
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleThesisInfo(row.original)}
                    >
                        Show More Info
                    </Button>
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
                        <ul className="nav nav-tabs tabs-fullwidth" id="manageThesis" role="tablist">
                            <li className="nav-item">
                                <button 
                                    className="nav-link active"
                                    id="choose-thesis-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#choose-thesis"
                                    type="button"
                                    role="tab"
                                    aria-controls="choose-thesis"
                                    aria-selected="true"
                                >
                                    Choose a Thesis
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
                                    Thesis proposal
                                </button>

                            </li>
                            {thesis &&(
                                <li className="nav-item">
                                    <button 
                                        className="nav-link"
                                        id="manage-thesis-tab"
                                        data-bs-toggle="tab"
                                        data-bs-target="#manage-thesis"
                                        type="button"
                                        role="tab"
                                        aria-controls="manage-thesis"
                                        aria-selected="true"
                                    >
                                        Manage your Thesis
                                    </button>
                                </li>
                            )}
                            
                        </ul>
                        <div className="tab-content mt-3">
                            <div className="tab-pane fade show active" id="choose-thesis" role="tabpanel" aria-labelledby="choose-thesis-tab">
                                <div className="card mt-3">
                                    <div className="card-body">
                                        <h2 className="card-title text-center">Choose a Thesis</h2>
                                        <MaterialReactTable 
                                            columns={columns}
                                            data={thesisProposalList}
                                            enableSorting
                                            enableColumnFilters
                                            enableGlobalFilter
                                            initialState={{
                                                columnVisibility: { keys: false }, // Nasconde la colonna 'keys' (se fosse presente per errore)
                                            }}
                                        />

                                        {/* infos dialog */}
                                        <Dialog open={openInfoDialog} onClose={handleThesisInfo} fullWidth>
                                            <DialogTitle>Thesis Proposal Info</DialogTitle>
                                            <DialogContent>
                                                <form>
                                                    <br />
                                                    <Box mb={2}>
                                                        <TextField 
                                                            label="Title"
                                                            value={infoThesisProposal.title}
                                                            fullWidth
                                                        />
                                                    </Box>
                                                    <Box mb={2}>
                                                        <TextField 
                                                            label="Description"
                                                            value={infoThesisProposal.description}
                                                            fullWidth
                                                            multiline
                                                            rows={4}
                                                        />
                                                    </Box>
                                                    <Box mb={2}>
                                                        <TextField 
                                                            label="Duration in weeks"
                                                            value={infoThesisProposal.duration}
                                                            fullWidth
                                                        />
                                                    </Box>
                                                    <Box mb={2}>
                                                        <TextField 
                                                            label="Teacher"
                                                            value={`${infoThesisProposal.teacher_firstname} ${infoThesisProposal.teacher_lastname} (${infoThesisProposal.teacher_username})`}
                                                            fullWidth
                                                        />
                                                    </Box>
                                                </form>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button onClick={() => handleCloseThesisInfo()} color="primary">OK</Button>
                                            </DialogActions>
                                        </Dialog>

                                    </div>
                                </div>
                            </div>

                            <div className="tab-pane fade" id="thesis-proposal" role="tabpanel" aria-labelledby="thesis-proposal-tab">
                                <div className="card mt-3">
                                    <div className="card-body">
                                        <h2 className="card-title text-center">Make a thesis proposal</h2>
                                        <form onSubmit={handleStudentThesisProposal}>
                                            <div className="mb-3">
                                                {error && <div className="alert alert-danger">{error}</div>}
                                                {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                                <div className="mb-3">
                                                    <label htmlFor="title" className="form-label">Title*</label>                                                
                                                    <input 
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Title"
                                                        value={title}
                                                        onChange={(e) => setTitle(e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="mb-3">
                                                    <label htmlFor="teacher" className="form-label">Supervisor*</label>
                                                    <Autocomplete
                                                        options={teachersList}
                                                        getOptionLabel={(option) => `${option.firstname} ${option.lastname} (${option.username})`} // Mostra nome e cognome
                                                        inputValue={inputValue} // handle the input for the search
                                                        onInputChange={(event, newInputValue) => {
                                                            setInputValue(newInputValue); // Update the input as you type
                                                        }}
                                                        onChange={(event, newValue) => {
                                                            if (newValue) {
                                                                setSupervisor(newValue.username); // Set the username in the parent component
                                                                setSelectedSupervisor(newValue); // Store the complete object of the selected supervisor
                                                                setInputValue(`${newValue.firstname} ${newValue.lastname}`); //Display the full name in the field
                                                            } else {
                                                                setSupervisor(''); // Reset if nothing is selected
                                                                setSelectedSupervisor(null);
                                                                setInputValue(''); // reset the input
                                                            }
                                                        }}
                                                        value={selectedSupervisor} // Set the selected supervisor as the value
                                                        renderInput={(params) => (
                                                            <TextField
                                                                required
                                                                {...params}
                                                                placeholder="Select a supervisor"
                                                                variant="outlined"
                                                                fullWidth
                                                            />
                                                        )}
                                                    />
                                                </div>

                                                <div className="mb-3">
                                                    <label htmlFor="teacher" className="form-label">Co-supervisor</label>
                                                    <Autocomplete
                                                        options={teachersList.filter((teacher) => teacher.username !== supervisor)} // Filter the selected supervisor
                                                        getOptionLabel={(option) => `${option.firstname} ${option.lastname} (${option.username})`} // Display first name, last name and username
                                                        inputValue={inputValue2} // Handle the input for searching the co-supervisor
                                                        onInputChange={(event, newInputValue2) => {
                                                            setInputValue2(newInputValue2); // Update the input as you type
                                                        }}
                                                        onChange={(event, newValue) => {
                                                            if (newValue) {
                                                                setCosupervisor(newValue.username); // Set the username in the parent component
                                                                setSelectedCosupervisor(newValue); // Store the complete object of the co-supervisor
                                                                setInputValue2(`${newValue.firstname} ${newValue.lastname}`); // Display the full name in the field
                                                            } else {
                                                                setCosupervisor(''); // Reset if nothing is selected
                                                                setSelectedCosupervisor(null);
                                                                setInputValue2(''); // reset the input
                                                            }
                                                        }}
                                                        value={selectedCosupervisor} //Set the selected co-supervisor as the value
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                placeholder="Select a co-supervisor"
                                                                variant="outlined"
                                                                fullWidth
                                                            />
                                                        )}
                                                    />
                                                </div>


                                                <button type="submit" className="btn btn-primary w-100">Add</button>

                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            {thesis &&(
                                <div className="tab-pane fade" id="manage-thesis" role="tabpanel" aria-labelledby="manage-thesis-tab">
                                <div className="card mt-3">
                                    <div className="card-body">
                                        <h2 className="card-title text-center">Manage your Thesis</h2>
                                        {error && <div className="alert alert-danger">{error}</div>}
                                        {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                        {/* List of information */}                                                                                    
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: '20px' }}>
                                            {/* Content of the list */}
                                            <div>
                                                <div><strong>Title:</strong> {thesis.title}</div>
                                                <div><strong>Assignment Date:</strong> {new Date(thesis.assignmentdate).toLocaleDateString()}</div>
                                                <div><strong>Discussion Date:</strong> {thesis.discussiondate ? new Date(thesis.discussiondate).toLocaleDateString() : '-'}</div>
                                                <div><strong>Supervisor:</strong> {`${thesis.supervisor_firstname} ${thesis.supervisor_lastname} (${thesis.supervisor_username})`}</div>
                                                <div><strong>Co-supervisor:</strong> {thesis.cosupervisor_username ? `${thesis.cosupervisor_firstname} ${thesis.cosupervisor_lastname} (${thesis.cosupervisor_username})` : '-'}</div>
                                            </div>

                                            <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <button 
                                                    onClick={() => handleEditThesis(thesis)} 
                                                    style={{
                                                        padding: '10px 15px',
                                                        backgroundColor: '#1976d2',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Edit Thesis
                                                </button>
                                                <button 
                                                    onClick={() => handleChangeSupCosup(thesis)} 
                                                    style={{
                                                        padding: '10px 15px',
                                                        backgroundColor: '#d32f2f',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Change Supervisor/Co-supervisor
                                                </button>
                                            </div>
                                        </div>

                                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={it}>
                                            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth>
                                                <DialogTitle>Edit Thesis</DialogTitle>
                                                <DialogContent>
                                                    {error && <div className="alert alert-danger">{error}</div>}
                                                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                                    <form>
                                                        <br />
                                                        <Box mb={2}>
                                                            <TextField 
                                                                label="Title"
                                                                value={editedThesis.title}
                                                                onChange={(e) => setEditedThesis({...editedThesis, title: e.target.value})}
                                                                fullWidth
                                                                required
                                                            />
                                                        </Box>

                                                        <Box mb={2}>
                                                            <DatePicker 
                                                                label="Assignment Date"
                                                                value={new Date(editedThesis.assignmentdate)}
                                                                readOnly
                                                            />
                                                        </Box>
                                                        <Box mb={2}>
                                                            <DatePicker
                                                                label="Discussion Date"
                                                                value={editedThesis.discussiondate ? new Date(editedThesis.discussiondate) : null}
                                                                onChange={(newValue) => setEditedThesis({...editedThesis, discussiondate: newValue})}
                                                                renderInput={(params) => <TextField {...params} fullWidth />}
                                                            />
                                                        </Box>
                                                    </form>
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button onClick={() => handleCloseDialog()} color="secondary">Cancel</Button>
                                                    <Button onClick={() => {handleSaveThesis(editedThesis.id); handleCloseDialog()}} color="primary">Save</Button>
                                                </DialogActions>
                                            </Dialog>
                                        </LocalizationProvider>

                                        <Dialog open={openChangeSupCosupDialog} onClose={handleCloseChangeSupCosup} fullWidth>
                                            <DialogContent>
                                                <DialogTitle>Change Supervisor/Co-supervisor</DialogTitle>
                                                
                                                            <Box mb={2}>
                                                                <Autocomplete
                                                                    options={teachersList.filter((teacher) => teacher.username !== editedThesis.supervisor_username)}
                                                                    getOptionLabel={(option) => `${option.firstname} ${option.lastname} (${option.username})`} 
                                                                    inputValue={inputValue3}
                                                                    onInputChange={(event, newInputValue) => {
                                                                        setInputValue3(newInputValue);
                                                                    }}
                                                                    onChange={(event, newValue) => {
                                                                        if (newValue) {
                                                                            setNewSupervisor(newValue.username); 
                                                                            setNewSelectedSupervisor(newValue); 
                                                                            setInputValue3(`${newValue.firstname} ${newValue.lastname}`); 
                                                                        } else {
                                                                            setNewSupervisor(''); 
                                                                            setNewSelectedSupervisor(null);
                                                                            setInputValue3('');
                                                                        }
                                                                    }}
                                                                    value={newSelectedSupervisor}
                                                                    renderInput={(params) => (
                                                                        <TextField
                                                                            required
                                                                            {...params}
                                                                            placeholder="Select a supervisor"
                                                                            variant="outlined"
                                                                            fullWidth
                                                                        />
                                                                    )}
                                                                    //required
                                                                />
                                                            </Box>

                                                            <Box mb={2}>
                                                                <Autocomplete
                                                                    options={teachersList.filter((teacher) => teacher.username !== newSupervisor && teacher.username !== editedThesis.cosupervisor_username)} // Filtra il supervisore selezionato
                                                                    getOptionLabel={(option) => `${option.firstname} ${option.lastname} (${option.username})`}
                                                                    inputValue={inputValue4} 
                                                                    onInputChange={(event, newInputValue2) => {
                                                                        setInputValue4(newInputValue2);
                                                                    }}
                                                                    onChange={(event, newValue) => {
                                                                        if (newValue) {
                                                                            setNewCosupervisor(newValue.username);
                                                                            setNewSelectedCosupervisor(newValue); 
                                                                            setInputValue4(`${newValue.firstname} ${newValue.lastname}`);
                                                                        } else {
                                                                            setNewCosupervisor('');
                                                                            setNewSelectedCosupervisor(null);
                                                                            setInputValue4(''); 
                                                                        }
                                                                    }}
                                                                    value={newSelectedCosupervisor}
                                                                    renderInput={(params) => (
                                                                        <TextField
                                                                            {...params}
                                                                            placeholder="Select a co-supervisor"
                                                                            variant="outlined"
                                                                            fullWidth
                                                                        />
                                                                    )}
                                                                    
                                                                />
                                                            </Box>
                                                    <DialogActions>
                                                        <Button onClick={() => handleCloseChangeSupCosup()} color="secondary">Close</Button>
                                                        <Button onClick={() => {handleSaveChangeSupCosup(editedThesis.id); handleCloseDialog()}} color="primary">Save</Button>
                                                    </DialogActions>
                                                </DialogContent>
                                        </Dialog>
                                        <Box mt={4} p={2} bgcolor="#f9f9f9" borderRadius={2} boxShadow={1}>
                                            <div>
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
                                                                                <a href={`${API_BASE_URL}/api/download/${doc.id}`}>
                                                                                    {doc.name || 'Unknown Document'}
                                                                                </a>
                                                                            </Grid2>

                                                                            {/* Colonna destra: descrizione del file */}
                                                                            <Grid2 item xs={6}>
                                                                                <Typography variant="body2" color="textSecondary">
                                                                                    {doc.description || 'No description available'}
                                                                                </Typography>
                                                                            </Grid2>

                                                                            {/* Colonna con l'icona per cancellare */}
                                                                            <Grid2 item>
                                                                                <IconButton edge="end" onClick={() => handleOpenConfirmDeleteDocumentDialog()}>
                                                                                    <DeleteOutlineOutlinedIcon />
                                                                                </IconButton>
                                                                            </Grid2>
                                                                            <Dialog open={openConfirm} onClose={handleCloseConfirmDeleteDocumentDialog}>
                                                                            <DialogTitle id="alert-dialog-title">
                                                                                    Confirm deletion
                                                                                </DialogTitle>
                                                                                <DialogContent>
                                                                                    <DialogContentText id="alert-dialog-description">
                                                                                        Are you sure to delete this document? This action cannot be undone.
                                                                                    </DialogContentText>
                                                                                </DialogContent>
                                                                                <DialogActions>
                                                                                    <Button onClick={handleCloseConfirmDeleteDocumentDialog} color="primary">
                                                                                        Esc
                                                                                    </Button>
                                                                                    <Button onClick={() => handleDeleteDocument(doc.id)} color="secondary" autoFocus>
                                                                                        Delete
                                                                                    </Button>
                                                                                </DialogActions>
                                                                            </Dialog>
                                                                        </Grid2>
                                                                    </ListItem>
                                                                ))}
                                                            </List>
                                                        </>
                                                    ) : (
                                                        <p style={{ color: '#888', margin: '16px 0' }}>No Attached Documents</p>
                                                    );
                                                })()}
                                            </div>

                                            <strong>Upload New Files</strong>
                                            <Box>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    onChange={handleFileChange}
                                                />
                                                {selectedFile && (
                                                    <Typography variant="body1" marginTop={2}>
                                                        Selected File: {selectedFile.name}
                                                    </Typography>
                                                )}
                                                <TextField
                                                    label="File Description"
                                                    value={description}
                                                    onChange={handleDescriptionChange}
                                                    fullWidth
                                                    margin="normal"
                                                />
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleUploadClick}
                                                    disabled={!selectedFile || !description.trim()}
                                                >
                                                    Upload
                                                </Button>
                                            </Box>
                                        </Box>

                                    </div>
                                </div>
                            </div>     
                            )}
                                                   
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StudentThesis;