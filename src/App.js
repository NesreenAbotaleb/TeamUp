import React from "react";
import "./App.css";
import Login from "./Pages/Login/Login";
import Community from "./Pages/Community/Community";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { UserProvider } from './../src/context/Usercontext';
import { CommunityProvider } from './context/CommunityContext'; // Add this import
import Main from "./Pages/Main/Main";

import Register from './Pages/Register/Register'
import Profile from './Pages/Profile/Profile'

import Verify from './Pages/Verify/Verify'

import "bootstrap-icons/font/bootstrap-icons.css";

import NotificationSettings from "./Componant/Notification/NotificationSettings";
import Privacy from "./Componant/Privacy/Privacy";
import ThemeToggle from "./Componant/ThemeToggle/ThemeToggle";
import { Layout } from "antd";
import UsersProfile from "./Pages/Profile/usersProfile";
import CommunityDetail from "./Pages/Community/CommunityDetails";
import TeamProfile from "./Pages/Profile/teamProfile";
import ForgetPassword from './Pages/ForgetPassword/ForgetPassword';

import Test from './Pages/testPage'
import ResetPassword from "./Pages/ForgetPassword/ResetPassword";
import NotificationMenu from "./Componant/Notification/NotificationMenu";
import VerifyError from "./Pages/Verify/VerifyError";
import Chat from './Pages/Chat/Chat'
import Settings from "./Componant/Settings/Settings";
import CommunityPage from "./Componant/Settings/CommunityPage";
import PostsPage from "./Componant/Settings/PostPage";
import TeamsPage from "./Componant/Settings/TeamPage";
import TeamDetails from "./Componant/Teams/TeamDetails";
// import AdminDashboard from "./Componant/Admin/AdminDashboard";
import ReportPage from "./Componant/Posts/ReportPage";
import Reports from './Pages/Reports/Report'
import Admin from "./Pages/Admin/Admin";

const { Content } = Layout;

function App() {
  return (
    <>
      <Layout>
        <Content>
          <UserProvider>
            <CommunityProvider> {/* Add CommunityProvider here */}
              <BrowserRouter>
                <Routes>
                  <Route index element={<Main />} />

                  <Route path="/login" element={<Login />} />
                  <Route path="/community" element={<Community />} />


                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/verify" element={<Verify />} />
                  <Route path="/verifyError" element={<VerifyError />} />
                  <Route path="/community/:code" element={<CommunityDetail />} />
                  <Route path="/community/:code/:id" element={<UsersProfile />} />

                  <Route path="/settings" element={<Settings />}>

                    <Route path="notificationSettings" element={<NotificationSettings />} />
                    <Route path="privacy" element={<Privacy />} />
                    <Route path="communities" element={<CommunityPage />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="team" element={<TeamsPage />} />
                    <Route path="post" element={<PostsPage />} />

                  </Route>

                  <Route path="/teams/:teamId" element={<TeamDetails />} />

                  <Route path="/notificationMenu" element={<NotificationMenu />} />

                  <Route path="/community/:code/report" element={<ReportPage />} />

                  {/* <Route path="/admin" element={<AdminDashboard />} /> */}


                  <Route path="/community/:code/team/:team_Code/chat" element={<Chat />} />

                  <Route path="/themeToggle" element={<ThemeToggle />} />
                  <Route path="/community/:code/team/:team_Code" element={<TeamProfile />} />

                  <Route path="/forgotPassword" element={<ForgetPassword />} />
                  <Route path="/test" element={<Test />} />
                  <Route path="/reset-password" element={<ResetPassword />} />



                  <Route path="/community/:code/report/:postId" element={<ReportPage />} />
                  <Route path="/community/:code/reports" element={<Reports />} />
                  {/* <Route 
                path="/report" 
                element={<ReportPage />} 
            /> */}


                  <Route path="/Admin" element={<Admin />} />

                </Routes>
              </BrowserRouter>
            </CommunityProvider> {/* Close CommunityProvider here */}
          </UserProvider>
        </Content>
      </Layout>
    </>
  );
}

export default App;