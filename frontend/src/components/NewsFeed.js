import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import AttachmentIcon from '@mui/icons-material/Attachment';

const NewsFeed  = () =>{
    const { auth } = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [newsList, setNewsList] = useState([]);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async() =>{
        const username = auth.username;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post("/api/get_news", {username}, {
                headers: { Authorization: `Bearer ${token}`},
            });
            const sortedNews = response.data.news_list.sort((a,b) => new Date(b.publication_date) - new Date(a.publication_date));
            setNewsList(sortedNews)
        } catch(error){
            setMessage(error)
        }
    } 


    return(        
        <>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ maxWidth: '800px', width: '100%' }} className="card mt-3">
                    <div className="card-body">
                        <h2 className="card-title text-center">News Feed</h2>
                        
                        {/* Filter the activated news */}
                        {(() => {
                            const activeNewsList = newsList.filter(news => !news.is_deleted);

                            return activeNewsList.length > 0 ? (
                                activeNewsList.map((news, index) => (
                                    <div key={index} className="card mb-3">
                                        <div className="card-body">
                                            <h5 className="card-title">{news.subject}</h5>
                                            <p className="card-text">{news.content}</p>
                                            
                                            {/* If there are documents, display them as a list of links */}
                                            {news.document_ids && news.document_ids.length > 0 && (
                                                <div>
                                                    <ul className="list-unstyled">
                                                        {news.document_ids
                                                            .filter(docId => docId !== null && docId !== undefined)
                                                            .map(docId => (
                                                                <li key={docId}>
                                                                    <a href={`http://127.0.0.1:5000/api/download/${docId}`} className="btn btn-link">
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
                                    </div>
                                ))
                            ) : (
                                <div className="text-center">There is no news available.</div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </>

    )
}

export default NewsFeed;