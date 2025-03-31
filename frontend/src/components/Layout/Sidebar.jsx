import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Toolbar
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QrCodeIcon from '@mui/icons-material/QrCode';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import PersonIcon from '@mui/icons-material/Person';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';

import { isAdmin } from '../../services/auth.service';

const drawerWidth = 240;

const Sidebar = () => {
  const location = useLocation();
  const admin = isAdmin();

  const adminMenuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin-dashboard'
    },
    {
      text: 'Generate QR',
      icon: <QrCodeIcon />,
      path: '/admin/generate-qr'
    },
    {
      text: 'User Management',
      icon: <PersonIcon />,
      path: '/admin/users'
    },
    {
      text: 'Reports',
      icon: <AssessmentIcon />,
      path: '/admin/reports'
    },
    {
      text: 'Attendance Logs',
      icon: <HistoryIcon />,
      path: '/admin/attendance-logs'
    }
  ];

  const userMenuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/user-dashboard'
    },
    {
      text: 'Scan QR',
      icon: <QrCodeScannerIcon />,
      path: '/user/scan-qr'
    },
    {
      text: 'My Attendance',
      icon: <HistoryIcon />,
      path: '/user/my-attendance'
    }
  ];

  const menuItems = admin ? adminMenuItems : userMenuItems;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box',
          backgroundColor: (theme) => theme.palette.background.default,
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.lighter',
                    '&:hover': {
                      backgroundColor: 'primary.lighter',
                    },
                  },
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;