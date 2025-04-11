import React from "react";
import { AppBar, Box, CssBaseline, Drawer, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button  } from "@mui/material";
import { Home, Person } from "@mui/icons-material";
import {Link, useNavigate} from "react-router-dom";
import { useLocation } from "react-router-dom";
import {useDispatch} from "react-redux";
import { logout } from "../../store/authSlice";

const drawerWidth = 240;

const menuItems = [
    { text: "Доска задач", icon: <Home />, path: "/" },
    { text: "Профиль", icon: <Person />, path: "/profile" },
    { text: "Проекты", icon: <Home />, path: "/projects" },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout()); // Выход
        navigate("/login"); // Редирект на страницу логина
    };

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            {/* Верхняя панель */}
            <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px` }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        Task Manager
                    </Typography>

                    <Box sx={{ flexGrow: 1 }} /> {/* Пушит всё справа */}

                    <Button color="inherit" onClick={handleLogout}>
                        Выйти
                    </Button>
                </Toolbar>
            </AppBar>
            {/* Боковое меню */}
            <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" } }}>
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
