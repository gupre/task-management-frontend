import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PrivateRoute from "./components/routes/PrivateRoute";
import ProjectBoard from "./pages/ProjectBoard";

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Используем PrivateRoute для защищённых страниц */}
              <Route element={<PrivateRoute />}>
                  <Route path="/" element={<Layout><Dashboard /></Layout>} />
                  <Route path="/projects" element={<Layout><ProjectBoard /></Layout>} />
                  <Route path="/profile" element={<Layout><Profile /></Layout>} />
              </Route>
          </Routes>
      </Router>
  );
}

export default App;
