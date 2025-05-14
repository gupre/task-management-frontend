import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/routes/PrivateRoute";
import ProjectBoard from "./pages/ProjectBoard";
import AdminUserManagement from './pages/AdminUserManagement'
import DepartmentBoard from './pages/DepartmentBoard'
import TimeZonesBoard from './pages/TimeZonesBoard'
import ReportProjectList from './pages/ReportProjectList'
import ReportProjectDetail from './components/reports/ReportProjectDetail'
import { NotificationsPage } from './pages/NotificationsPage'
import AdminRoute from './components/routes/AdminRoute'

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<PrivateRoute />}>
                  <Route path="/profile" element={<Layout><Profile /></Layout>} />
                  <Route path="/projects" element={<Layout><ProjectBoard /></Layout>} />
                  <Route path="/" element={<Layout><Dashboard /></Layout>} />
                  <Route element={<AdminRoute />}>
                    <Route path="/admin/users" element={<Layout><AdminUserManagement /></Layout>} />
                    <Route path="/admin/departments" element={<Layout><DepartmentBoard /></Layout>} />
                    <Route path="/admin/time-zones" element={<Layout><TimeZonesBoard /></Layout>} />
                  </Route>
                  <Route path="/reports/project/:projectId" element={<Layout><ReportProjectList /></Layout>} />
                  <Route path="/project/:projectId/report/:reportId" element={<Layout><ReportProjectDetail /></Layout>} />
                  <Route path="/notifications" element={<Layout><NotificationsPage/></Layout>} />
              </Route>
          </Routes>
      </Router>
  );
}

export default App;
