import React from "react";
import { AppBar, Box, CssBaseline, Drawer, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, IconButton } from "@mui/material";
import {
  AdminPanelSettings,
  Assignment,
  Work,
  Person,
  Business,
  Assessment,
  Group,
  Apartment, AccessTime
} from '@mui/icons-material'
import { Link, useNavigate } from 'react-router-dom'
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";

const drawerWidth = 240;

const menuItems = [
  { text: "Проекты", icon: <Work />, path: "/projects" },
  { text: "Доска задач", icon: <Assignment />, path: "/" },
  { text: "Отчёты по проекту", icon: <Assessment />, path: "/reports/project/:projectId" },
  { text: "Управление пользователями", icon: <Group />, path: "/admin/users" },
  { text: "Управление департаментами", icon: <Apartment />, path: "/admin/departments" },
  { text: "Управление часовыми поясами", icon: <AccessTime />, path: "/admin/time-zones" },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Верхняя панель */}
      <AppBar position="fixed" sx={{ width: "100%" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          {/* Название по центру */}
          <Typography variant="h6" noWrap component="div" sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            Task Manager
          </Typography>

          {/* Блок с кнопками справа */}
          <Box sx={{ position: "absolute", right: 16, display: "flex", alignItems: "center" }}>
            {/* Значок профиля */}
            <IconButton color="inherit" component={Link} to="/profile" sx={{ marginRight: "10px" }}>
              <Person />
            </IconButton>

            {/* Кнопка выхода */}
            <Button color="inherit" onClick={handleLogout}>
              Выйти
            </Button>
          </Box>
        </Toolbar>
      </AppBar>


      {/* Боковое меню */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            marginTop: '64px',  // Добавляем отступ сверху, чтобы он не перекрывал верхнюю панель
          }
        }}>
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={Link} to={item.path} selected={location.pathname === item.path}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Основной контент */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)` }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
