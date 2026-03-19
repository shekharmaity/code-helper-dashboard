import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CodeIcon from '@mui/icons-material/Code';
import ScheduleIcon from '@mui/icons-material/Schedule';
import DataObjectIcon from '@mui/icons-material/DataObject';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import LinkIcon from '@mui/icons-material/Link';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { useState } from 'react';

const navigationItems = [
  {
    label: 'Home',
    path: '/',
    icon: <HomeRoundedIcon />,
  },
  {
    label: 'All Mocks',
    path: '/mocks',
    icon: <ListAltIcon />,
  },
  {
    label: 'JSON Formatter',
    path: '/json-formatter',
    icon: <DataObjectIcon />,
  },
  {
    label: 'Cron Expression',
    path: '/cron-expression',
    icon: <ScheduleIcon />,
  },
  {
    label: 'Regex Check',
    path: '/regex-check',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'File Difference',
    path: '/file-difference',
    icon: <FindInPageIcon />,
  },
  {
    label: 'XML Formatter',
    path: '/xml-formatter',
    icon: <CodeIcon />,
  },
  {
    label: 'UUID Generator',
    path: '/uuid-generator',
    icon: <FingerprintIcon />,
  },
  {
    label: 'Tiny URL',
    path: '/tiny-url',
    icon: <LinkIcon />,
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Box
      sx={{
        width: collapsed ? '78px' : '232px',
        transition: 'width 0.22s ease',
        height: '100vh',
        color: '#e2e8f0',
        px: 1.25,
        py: 1.5,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRight: '1px solid rgba(71, 85, 105, 0.18)',
        background: '#0f172a',
      }}
    >
      <Box
        sx={{
          minHeight: 56,
          px: collapsed ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(59, 130, 246, 0.12)',
              color: '#93c5fd',
              flexShrink: 0,
            }}
          >
            <AutoAwesomeMotionIcon fontSize="small" />
          </Box>

          {!collapsed && (
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
              }}
            >
              Mock Dashboard
            </Typography>
          )}
        </Box>

        {!collapsed && (
          <IconButton
            size="small"
            onClick={() => setCollapsed(true)}
            sx={{ color: '#94a3b8', '&:hover': { color: '#e2e8f0', bgcolor: 'transparent' } }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}

        {collapsed && (
          <IconButton
            size="small"
            onClick={() => setCollapsed(false)}
            sx={{
              position: 'absolute',
              top: 18,
              right: 10,
              color: '#94a3b8',
              '&:hover': { color: '#e2e8f0', bgcolor: 'transparent' },
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Tooltip title={collapsed ? item.label : ''} placement="right" key={item.path}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  minHeight: 46,
                  px: collapsed ? 1 : 1.25,
                  borderRadius: 2.5,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  bgcolor: isActive ? 'rgba(59, 130, 246, 0.14)' : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(59, 130, 246, 0.18)' : 'rgba(148, 163, 184, 0.08)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 0 : 1.25,
                    justifyContent: 'center',
                    color: isActive ? '#60a5fa' : '#94a3b8',
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#f8fafc' : '#cbd5e1',
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );
}
