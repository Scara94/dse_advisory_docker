import React, { useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import 'bootstrap/js/dist/tab';
import { AuthContext } from "../context/AuthContext";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AttachmentIcon from '@mui/icons-material/Attachment';
import { MaterialReactTable } from 'material-react-table';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, List, ListItem, IconButton, Box } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import API_BASE_URL from "../config";

const News = () => {
    const { auth } = useContext(AuthContext);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [cohort, setCohort] = useState([]);
    const [cohortList, setCohortList] = useState([]);
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [newsList, setNewsList] = useState([]);
    const [editingNewsId, setEditingNewsId] = useState(null); // to handle the id of the edited document 
    const [editedNews, setEditedNews] = useState({ subject: '', content: '' }); // to memorize the changes
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [expirationDate, setExpirationDate] = useState(null);
    const [files, setFiles] = useState([]);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [ openConfirm, setOpenConfirm ] = useState(false);

    useEffect(() => {
        sessionStorage.setItem('lastPage', '/news');
        const fetchCohorts = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/cohorts`);
                setCohortList(response.data);
            } catch (error) {
                setError('Failed to load cohorts');
            }
        };
        fetchCohorts();
        fetchAllNews();

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

    const handleAddNews = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        formData.append('subject', subject);
        formData.append('content', content);
        formData.append('expirationDate', expirationDate);
        formData.append('cohort', cohort);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/api/add_news`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                showMessage('success', 'News added correctly!');
                fetchAllNews();
                setCohort([]);
                setSubject('');
                setContent('');
                setExpirationDate(null);
                setFiles([]);
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                showMessage('error', 'Error adding news!')
            }
            console.error('Error adding news: ', error);
        }
    }

    const fetchAllNews = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/get_all_news`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const sortedNews = response.data.news_list.sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date));
            setNewsList(sortedNews);
        } catch (error) {
            setError(error);
        }
    }

    const handleDeleteNews = async (newsId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/api/delete_news/${newsId}`, { is_deleted: true }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showMessage('success', 'News deleted successfully!');
            fetchAllNews();
        } catch (error) {
            showMessage('error', 'Failed to delete news!');
            console.error('Error deleting news: ', error);
        }
    }

    const handleActivateNews = async (newsId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/api/activate_news/${newsId}`, { is_deleted: false }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showMessage('success', 'News activated successfully!');
        } catch (error) {
            showMessage('error, Failed to activate news');
            console.error('Error activating news: ', error);
        }
    };

    // Function to open the editing form
    const handleEditNews = (news) => {
        setEditingNewsId(news.id);
        //By default, set the current values for editedNews, which will only be modified if there is an actual change
        setEditedNews({ id: news.id, subject: news.subject, content: news.content, publication_date: news.publication_date, expiration_date: news.expiration_date, target_cohorts: news.target_cohorts , document_ids: news.document_ids, document_names: news.document_names });
        setOpenEditDialog(true);
    };

    //function to cles the editing form
    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditedNews(''); // Resetta i dati
      };

    // function to save the changes
    const handleSaveNews = async (newsId) => {
        try{
            const formData = new FormData();
            formData.append('subject', editedNews.subject);
            formData.append('content', editedNews.content);
            formData.append('expirationDate', editedNews.expiration_date);
            formData.append('target_cohorts', editedNews.target_cohorts);
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/api/update_news/${newsId}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showMessage('success', 'News updated successfully');
            setEditingNewsId(null);
            setEditedNews('');
            fetchAllNews();
        } catch(error){
            showMessage('error', 'Failed to update news.');
        }
    };

    // function to handle a document during the editing
    const handleDeleteDocument = async (docId) => {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${API_BASE_URL}/api/delete_doc/${docId}`,{}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success){
            showMessage('success', 'Document deleted correctly!')
            setEditedNews((prevNews) => ({
                ...prevNews,
                document_ids: prevNews.document_ids.filter(id => id !== docId)
              }));
              setOpenConfirm(false);
            fetchAllNews();
        } else {
            showMessage('error', 'Error during delete the document!') 
        }
    };
    
    const handleUploadDocument = async (event, newsId) => {
        event.preventDefault();
        try {
            const formData = new FormData();
            for (let i = 0; i < event.target.files.length; i++) {
                formData.append('files', event.target.files[i]);
            }
            const token = localStorage.getItem('token');
            
            const response = await axios.post(`${API_BASE_URL}/api/upload_docs/${newsId}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (response.data.success) {
                const { doc_id } = response.data; // uploaded document ID
                const newDocumentNames = Array.from(event.target.files).map(file => ({
                    id: doc_id,
                    name: file.name // name of the uploaded file
                }));
                
                setEditedNews((prevNews) => ({
                    ...prevNews,
                    document_ids: [...prevNews.document_ids, doc_id], // update of the ID
                    document_names: [...prevNews.document_names, ...newDocumentNames] // update of the names
                }));
    
                showMessage('success', 'Doc updated correctly!');
                fetchAllNews();
            } else {
                showMessage('error', 'Error during upload files!');
            }
    
        } catch (error) {
            showMessage('error', 'Error during upload files!');
        }
    };
    
    //functions to handle the confirmation of document deletion
    const handleOpenConfirmDeleteDocumentDialog = () => {
        setOpenConfirm(true);
    }

    const handleCloseConfirmDeleteDocumentDialog = () => {
        setOpenConfirm(false);
    }


    const columns = useMemo(() => [
        {
            header: 'Subject',
            accessorKey: 'subject',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString',
        },
        {
            header: 'Content',
            accessorKey: 'content',
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: 'includesString',
        },
        {
            header: 'Publication Date',
            accessorKey: 'publication_date',
            Cell: ({ cell }) => new Date(cell.getValue()).toLocaleString(),
            sortingFn: 'datetime',
            enableSorting: true,
            enableColumnFilter: false,
            filterFn: 'equals',
        },
        {
            header: 'Expiration Date',
            accessorKey: 'expiration_date',
            Cell: ({ cell }) => cell.getValue() 
                ? new Date(cell.getValue()).toLocaleDateString('en-EN', { year: 'numeric', month: 'long', day: 'numeric' }) 
                : 'No Expiration',
            sortingFn: 'datetime',
            enableSorting: true,
            enableColumnFilter: false,
            filterFn: 'equals',
        },
        {
            header: 'Target Cohorts',
            accessorKey: 'target_cohorts',
            Cell: ({ cell }) => cell.getValue().length > 0 ? cell.getValue().join(', ') : 'No Target Cohorts',
            enableSorting: false,
            enableColumnFilter: true,
            filterFn: 'includesString',
        },
        {
            header: 'Attached documents',
            accessorKey: 'document_ids',
            Cell: ({ cell }) => (
                cell.getValue() && cell.getValue().filter(docId => docId !== null && docId !== undefined).length > 0 ? (
                <ul className="list-unstyled">
                    {cell.getValue().filter(docId => docId !== null && docId !== undefined).map(docId => (
                    <li key={docId}>
                        <a href={`${API_BASE_URL}/api/download/${docId}`} className="btn btn-link">
                        <AttachmentIcon /> Download Document
                        </a>
                    </li>
                    ))}
                </ul>
                ) : 'No attached documents'
            ),
            enableColumnFilter: false,
            enableSorting: false,
        },
        {
            header: 'Actions',
            accessorKey: 'actions',
            Cell: ({ row }) => (
              <div>
                {/* Edit Button */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleEditNews(row.original)}
                >
                  Edit
                </Button>
          
                {/* Check if the news is active or not to decide which button to display */}
                {row.original.is_deleted ? (
                  // If the news is inactive, display the 'Activate' button
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleActivateNews(row.original.id)}
                  >
                    Activate
                  </Button>
                ) : (
                  // If the news is active, display the 'Delete' button
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteNews(row.original.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            ),
            enableColumnFilter: false
        }
    ], []);

    return (
        <>
            <Navbar />
            <div className="container-fluid mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-12">
                        <ul className="nav nav-tabs tabs-fullwidth" id="manageNewsTab" role="tablist">
                        {auth.userType === "coordinator" ? (
                            <>
                                <li className="nav-item">
                                    <button
                                        className="nav-link active"
                                        id="manage-news-tab"
                                        data-bs-toggle="tab"
                                        data-bs-target="#manage-news"
                                        type="button"
                                        role="tab"
                                        aria-controls="manage-news"
                                        aria-selected="true"
                                    >
                                        Manage News
                                    </button>
                                </li>
                                
                                <li className="nav-item">
                                    <button
                                        className="nav-link"
                                        id="add-news-tab"
                                        data-bs-toggle="tab"
                                        data-bs-target="#add-news"
                                        type="button"
                                        role="tab"
                                        aria-controls="add-news"
                                        aria-selected="false"
                                    >
                                        Add News
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className="nav-link"
                                        id="news-feed-tab"
                                        data-bs-toggle="tab"
                                        data-bs-target="#news-feed"
                                        type="button"
                                        role="tab"
                                        aria-controls="news-feed"
                                        aria-selected="false"
                                    >
                                        News Feed
                                    </button>
                                </li>                                
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <button
                                        className="nav-link"
                                        id="news-feed-tab"
                                        data-bs-toggle="tab"
                                        data-bs-target="#news-feed"
                                        type="button"
                                        role="tab"
                                        aria-controls="news-feed"
                                        aria-selected="true"
                                    >
                                        News Feed
                                    </button>
                                </li>
                            </>
                        )}                            
                        </ul>

                        <div className="tab-content mt-3">
                            {auth.userType === "coordinator" ? (
                                <>
                                    {/* manage news tab */}
                                    <div className="tab-pane fade show active" id="manage-news" role="tabpanel" aria-labelledby="manage-news-tab">
                                        <div className="card mt-3">
                                            <div className="card-body">
                                                <h2 className="card-title text-center">Manage News</h2>
                                                {error && <div className="alert alert-danger">{error}</div>}
                                                {successMessage && <div className="alert alert-success">{successMessage}</div>}

                                                {/* Searchable table */}
                                                <MaterialReactTable
                                                    columns={columns}
                                                    data={newsList}
                                                    enableSorting
                                                    enableColumnFilters
                                                    enableGlobalFilter={false}
                                                />
                                                {/* Edit Dialog */}
                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                                                        <DialogTitle>Edit News</DialogTitle>
                                                        <DialogContent>
                                                            {error && <div className="alert alert-danger">{error}</div>}
                                                            {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                                            {editedNews && (
                                                            <form>
                                                                <br />
                                                                <Box mb={2}>
                                                                    <TextField
                                                                        label="Subject"
                                                                        value={editedNews.subject}
                                                                        onChange={(e) => setEditedNews({ ...editedNews, subject: e.target.value })}
                                                                        fullWidth
                                                                    />
                                                                </Box>
                                                                <Box mb={2}>
                                                                    <TextField
                                                                        label="Content"
                                                                        value={editedNews.content}
                                                                        onChange={(e) => setEditedNews({ ...editedNews, content: e.target.value })}
                                                                        fullWidth
                                                                        multiline
                                                                        rows={4}
                                                                    />
                                                                </Box>                                              
                                                                <Box mb={2}>
                                                                    <DatePicker
                                                                        label="Expiration Date"
                                                                        value={editedNews.expiration_date ? new Date(editedNews.expiration_date) : null}  // Imposta la data iniziale se esiste
                                                                        onChange={(newValue) => setEditedNews({ ...editedNews, expiration_date: newValue })}  // Gestisci la modifica della data
                                                                        renderInput={(params) => <TextField {...params} fullWidth />}
                                                                    />
                                                                </Box>

                                                                {/* Target Cohorts Checkbox*/}
                                                                <Box mb={2}>
                                                                    <label>Target Cohorts</label>
                                                                    {/* Button to show/hide the checkboxes */}
                                                                    <div>                                                                       
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-primary"
                                                                            onClick={() => setShowCheckboxes(!showCheckboxes)}
                                                                        >
                                                                            {showCheckboxes ? 'Hide Cohorts' : 'Show Cohorts'}
                                                                        </button>
                                                                    </div>
                                                                    {showCheckboxes && (
                                                                        <div>
                                                                        {/* Checkbox for Select All */}
                                                                        <div className="form-check mb-2">
                                                                            <input
                                                                            type="checkbox"
                                                                            className="form-check-input"
                                                                            id="selectAll"
                                                                            checked={cohortList.length > 0 && cohort.length === cohortList.length}  // Se tutte le coorti sono selezionate
                                                                            onChange={(e) => {
                                                                                if (e.target.checked) {
                                                                                // If selected, add all the cohorts
                                                                                setCohort(cohortList);  
                                                                                setEditedNews({ ...editedNews, target_cohorts: cohortList });  // Aggiorna anche editedNews di conseguenza
                                                                                } else {
                                                                                // If deselected, remove all the cohorts
                                                                                setCohort([]);  
                                                                                setEditedNews({ ...editedNews, target_cohorts: [] });  // Aggiorna editedNews
                                                                                }
                                                                            }}
                                                                            />
                                                                            <label className="form-check-label" htmlFor="selectAll">
                                                                            Select All Cohorts
                                                                            </label>
                                                                        </div>
    
                                                                        {/* Checkbox for every single cohort */}
                                                                        {Array.isArray(cohortList) && cohortList.map((cohortItem) => (
                                                                            <div key={cohortItem} className="form-check">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="form-check-input"
                                                                                id={cohortItem}
                                                                                value={cohortItem}
                                                                                checked={cohort.includes(cohortItem)}  // check if the cohort is selected
                                                                                onChange={(e) => {
                                                                                const selectedCohorts = [...cohort];  // copy the array of the selected cohorts
    
                                                                                if (e.target.checked) {
                                                                                    // add the selected cohort
                                                                                    if (!selectedCohorts.includes(cohortItem)) {
                                                                                    selectedCohorts.push(cohortItem);
                                                                                    }
                                                                                } else {
                                                                                    // delete the selected cohort
                                                                                    const index = selectedCohorts.indexOf(cohortItem);
                                                                                    if (index > -1) {
                                                                                    selectedCohorts.splice(index, 1);
                                                                                    }
                                                                                }
    
                                                                                // update the status
                                                                                setCohort(selectedCohorts);
                                                                                setEditedNews({ ...editedNews, target_cohorts: selectedCohorts });  // Aggiorna anche editedNews
                                                                                }}
                                                                            />
                                                                            <label className="form-check-label" htmlFor={cohortItem}>
                                                                                {cohortItem}
                                                                            </label>
                                                                            </div>
                                                                        ))}
                                                                        </div>
                                                                    )}
                                                                </Box>                                                     

                                                                {/* Attachment document management */}
                                                                <List>
                                                                    {editedNews.document_ids && editedNews.document_ids.filter(docId => docId !== null).length > 0 ? (
                                                                        editedNews.document_ids.filter(docId => docId !== null).map(docId => {
                                                                            // Find the corresponding document using the ID
                                                                            const document = editedNews.document_names.find(doc => doc.id === docId);
                                                                            return (
                                                                                <ListItem key={docId}>
                                                                                    {/* Display the document name above the link */}
                                                                                    <span>{document ? document.name : 'Unknown Document'}</span>       
                                                                                    <IconButton edge="end" /*onClick={() => handleDeleteDocument(docId)}*/ onClick={() => handleOpenConfirmDeleteDocumentDialog()}>
                                                                                        <DeleteOutlineOutlinedIcon />
                                                                                    </IconButton>
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
                                                                                                <Button onClick={() => handleDeleteDocument(docId)} color="secondary" autoFocus>
                                                                                                    Delete
                                                                                                </Button>
                                                                                            </DialogActions>
                                                                                        </Dialog>
                                                                                </ListItem>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <p>No attached documents</p>
                                                                    )}
                                                                </List>



                                                                <Box mt={2}>
                                                                    <input
                                                                        type="file"
                                                                        className="form-control"
                                                                        onChange={(event) => handleUploadDocument(event, editedNews.id)}
                                                                    />
                                                                </Box>
                                                            
                                                            </form>
                                                            )}
                                                        </DialogContent>
                                                        <DialogActions>
                                                            <Button onClick={() => handleCloseEditDialog()} color="secondary">Cancel</Button>
                                                            <Button onClick={() => {handleSaveNews(editedNews.id); handleCloseEditDialog()}} color="primary">Save</Button>
                                                        </DialogActions>
                                                    </Dialog>
                                                </LocalizationProvider>
                                            </div>
                                        </div>
                                    </div>

                                    {/* add news tab */}            
                                    <div className="tab-pane fade" id="add-news" role="tabpanel" aria-labelledby="add-news-tab">
                                    <div className="card">
                                        <div className="card-body">
                                            <h2 className="card-title text-center">Add News</h2>
                                            {error && <div className="alert alert-danger">{error}</div>}
                                            {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                            <form onSubmit={handleAddNews}>
                                                <div className="mb-3">
                                                    <label htmlFor="cohort" className="form-label">Select one or more cohort</label>
                                                    <div>
                                    
                                                        {/* Button to show/hide the checkboxes */}
                                                        
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary"
                                                            onClick={() => setShowCheckboxes(!showCheckboxes)}
                                                        >
                                                            {showCheckboxes ? 'Hide Cohorts' : 'Show Cohorts'}
                                                        </button>
                                                    </div>                                            

                                                    {/* Collapsible checkbox section */}
                                                    
                                                    {showCheckboxes && (
                                                        <div>
                                                            {/* Checkbox to select all cohorts */}
                                                            <div className="form-check mb-2">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id="selectAll"
                                                                    checked={cohort.length === cohortList.length}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setCohort(cohortList);
                                                                        } else {
                                                                            setCohort([]);
                                                                        }
                                                                    }}
                                                                />
                                                                <label className="form-check-label" htmlFor="selectAll">
                                                                    Select All Cohorts
                                                                </label>
                                                            </div>

                                                            {/* Checkbox to select individual cohorts */}
                                                            {Array.isArray(cohortList) && cohortList.map((cohortItem) => (
                                                                <div key={cohortItem} className="form-check">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input"
                                                                        id={cohortItem}
                                                                        value={cohortItem}
                                                                        checked={cohort.includes(cohortItem)}
                                                                        onChange={(e) => {
                                                                            const selectedCohorts = [...cohort];
                                                                            if (e.target.checked) {
                                                                                selectedCohorts.push(cohortItem);
                                                                            } else {
                                                                                const index = selectedCohorts.indexOf(cohortItem);
                                                                                if (index > -1) {
                                                                                    selectedCohorts.splice(index, 1);
                                                                                }
                                                                            }
                                                                            setCohort(selectedCohorts);
                                                                        }}
                                                                    />
                                                                    <label className="form-check-label" htmlFor={cohortItem}>
                                                                        {cohortItem}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mb-3">
                                                    <label htmlFor="subject" className="form-label">Subject*</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Subject"
                                                        value={subject}
                                                        onChange={(e) => setSubject(e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="mb-3">
                                                    <label htmlFor="content" className="form-label">Content*</label>
                                                    <textarea
                                                        className="form-control"
                                                        id="content"
                                                        placeholder="Write the content of your news"
                                                        rows="3"
                                                        value={content}
                                                        onChange={(e) => setContent(e.target.value)}
                                                        required
                                                    ></textarea>
                                                </div>

                                                {/* Select, if necessary, the expiration date */}
                                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                    <div className="mb-3">
                                                        <label htmlFor="expirationDate" className="form-label">Expiration Date</label>
                                                        <br />
                                                        <DatePicker
                                                            value={expirationDate}  // Set the initial date if it exists.
                                                            onChange={(newValue) => setExpirationDate(newValue)} // Handle the modification of the date
                                                        />
                                                    </div>
                                                </LocalizationProvider>
                                                <button type="submit" className="btn btn-primary w-100">Add News</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                {/* news feed tab */}
                                <div className="tab-pane fade" id="news-feed" role="tabpanel" aria-labelledby="news-feed-tab">
                                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                                            <div style={{ maxWidth: '800px', width: '100%' }} className="card mt-3">
                                                <h2 className="card-title text-center">News Feed</h2>
                                                {/* Show the news feed */}
                                                <div className="container mt-4">
                                                    {newsList.length > 0 ? (
                                                        newsList.map((news, index) => (
                                                            <div key={index} className="card mb-3">
                                                                {!news.is_deleted && (
                                                                    <div className="card-body">
                                                                        <h5 className="card-title">{news.subject}</h5>
                                                                        <p className="card-text">{news.content}</p>
                                                                        {/* If there are documents, display them as a list of links */}
                                                                        {news.document_ids && news.document_ids.length > 0 && (
                                                                            <div>
                                                                                <ul className="list-unstyled">
                                                                                {news.document_ids
                                                                                .filter(docId => docId !== null && docId !== undefined)  // Filtro per rimuovere null o undefined
                                                                                .map(docId => (
                                                                                    <li key={docId}>
                                                                                        <a href={`${API_BASE_URL}/api/download/${docId}`} className="btn btn-link">
                                                                                            <AttachmentIcon />
                                                                                            Download Document
                                                                                        </a>
                                                                                    </li>
                                                                                ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                        <p className="card-text">
                                                                            <small className="text-muted">
                                                                                Published on: {new Date(news.publication_date).toLocaleString('en-EN', {
                                                                                    year: 'numeric',
                                                                                    month: 'long',
                                                                                    day: 'numeric',
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                    second: '2-digit',
                                                                                })}
                                                                            </small>
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center">There is no news available.</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            </>
                            ) : (
                                <>
                                <div className="tab-pane fade show active" id="news-feed" role="tabpanel" aria-labelledby="news-feed-tab">
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div style={{ maxWidth: '800px', width: '100%' }} className="card mt-3">
                                            <h2 className="card-title text-center">News Feed</h2>
                                            {/* Show the news feed */}
                                            <div className="container mt-4">
                                                {newsList.length > 0 ? (
                                                    newsList.map((news, index) => (
                                                        <div key={index} className="card mb-3">
                                                            {!news.is_deleted && (
                                                                <div className="card-body">
                                                                    <h5 className="card-title">{news.subject}</h5>
                                                                    <p className="card-text">{news.content}</p>
                                                                    {news.document_ids && news.document_ids.length > 0 && (
                                                                        <div>
                                                                            <ul className="list-unstyled">
                                                                            {news.document_ids
                                                                            .filter(docId => docId !== null && docId !== undefined)  // filter to remove undefined or null ids
                                                                            .map(docId => (
                                                                                <li key={docId}>
                                                                                    <a href={`${API_BASE_URL}/api/download/${docId}`} className="btn btn-link">
                                                                                        <AttachmentIcon />
                                                                                        Download Document
                                                                                    </a>
                                                                                </li>
                                                                            ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                    <p className="card-text">
                                                                        <small className="text-muted">
                                                                            Published on: {new Date(news.publication_date).toLocaleString('en-EN', {
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric',
                                                                                hour: '2-digit',
                                                                                minute: '2-digit',
                                                                                second: '2-digit',
                                                                            })}
                                                                        </small>
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center">There is no news available.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </>
                            )}
                            
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default News;