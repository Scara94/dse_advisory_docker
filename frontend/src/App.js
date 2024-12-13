import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import WelcomePage from "./components/WelcomePage";
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar'
import News from "./components/News";
import EditProfile from "./components/EditProfile";
import ManageUsersPage from "./components/ManageUsersPage";
import RegistrationForm from "./components/RegistrationForm";
import NewsFeed from "./components/NewsFeed";
import CASRegistrationForm from "./components/CASRegistrationForm";
import CasCallbackPage from "./components/CasCallbackPage";
import StudentThesis from "./components/StudentThesis";
import TeacherThesis from "./components/TeacherThesis";


function App() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const lastPage = sessionStorage.getItem('lastPage');
    if (auth.isAuthenticated && lastPage){
      navigate(lastPage);
    }
  }, [auth, navigate])
  return(
    <>
      {AuthContext.isAuthenticated && <Navbar />}
      <div className="container mt-3">
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/welcome/:username" element={auth.isAuthenticated ? <WelcomePage /> : <Navigate to="/" />} />
          <Route path="/news" element={auth.isAuthenticated ? <News /> : <Navigate to="/" />} />
          <Route path="/editProfile" element={auth.isAuthenticated ? <EditProfile /> : <Navigate to="/" />} />
          <Route path="/manage-users" element={auth.isAuthenticated ? <ManageUsersPage /> : <Navigate to="/" />} />
          <Route path="/newsFeed" element={auth.isAuthenticated ? <NewsFeed /> : <Navigate to="/" />} />
          <Route path="/cas_registration" element={<CASRegistrationForm />} />
          <Route path="/cas_callback" element={<CasCallbackPage />} />
          <Route path="/studentThesis" element={auth.isAuthenticated ? <StudentThesis /> : <Navigate to="/" />} />
          <Route path="/teacherThesis" element={auth.isAuthenticated ? <TeacherThesis /> : <Navigate to="/" /> } />
        </Routes>
      </div>
    </>
    
  )
}

export default App;