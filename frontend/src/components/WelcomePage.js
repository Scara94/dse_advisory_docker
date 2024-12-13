import React, { useContext, useEffect } from "react";
import { AuthContext } from '../context/AuthContext';
import Navbar from "./Navbar";
import NewsFeed from "./NewsFeed";
import TeacherThesis from "./TeacherThesis";

const WelcomePage = () => {
    const { auth } = useContext(AuthContext);

    useEffect(() => {
        sessionStorage.setItem('lastPage', '/welcome/:username');
    })

    return (
        <>
            <Navbar />
            {auth.userType === 'student' && (
                <NewsFeed />
            )}
            {((auth.userType === 'teacher') || (auth.userType === 'coordinator')) && (
                <TeacherThesis />
            )}            
        </>        
    );
};

export default WelcomePage;