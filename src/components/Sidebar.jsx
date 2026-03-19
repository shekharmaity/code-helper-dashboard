import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import AutoAwesomeMotionIcon from '@mui/icons-material/AutoAwesomeMotion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LinkIcon from '@mui/icons-material/Link';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useState } from 'react';

const navigationItems = [
  { label: 'Home', path: '/', icon: <HomeRoundedIcon /> },
  { label: 'All Mocks', path: '/mocks', icon: <ListAltIcon /> },
  { label: 'JSON Formatter', path: '/json-formatter', icon: <DataObjectIcon /> },
  { label: 'Cron Expression', path: '/cron-expression', icon: <ScheduleIcon /> },
  { label: 'Regex Check', path: '/regex-check', icon: <ManageSearchIcon /> },
  { label: 'File Difference', path: '/file-difference', icon: <FindInPageIcon /> },
  { label: 'XML Formatter', path: '/xml-formatter', icon: <CodeIcon /> },
  { label: 'UUID Generator', path: '/uuid-generator', icon: <FingerprintIcon /> },
  { label: 'Tiny URL', path: '/tiny-url', icon: <LinkIcon /> },
];

export default function Sidebar({
  mobileOpen = false,
  onMobileClose = () => {},
}) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [collapsed, setCollapsed] = useState(true);
  const compact = !isMobile && collapsed;

  const content = (
    <Box
      sx={{
        width: isMobile ? 272 : compact ? 78 : 232,
        transition: 'width 0.22s ease',
        height: '100%',
        color: '#e2e8f0',
        px: 1.25,
        py: 1.5,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRight: isMobile ? 'none' : '1px solid rgba(148, 163, 184, 0.12)',
        background:
          'linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(15, 23, 42, 0.92) 45%, rgba(17, 94, 89, 0.94) 100%)',
        boxShadow: 'inset -1px 0 0 rgba(255, 255, 255, 0.04)',
      }}
    >
      <Box
        sx={{
          minHeight: 56,
          px: compact ? 0.5 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: compact ? 'center' : 'space-between',
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
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              color: '#99f6e4',
              flexShrink: 0,
              boxShadow: '0 10px 24px rgba(15, 23, 42, 0.22)',
            }}
          >
            <AutoAwesomeMotionIcon fontSize="small" />
          </Box>

          {!compact && (
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

        {!isMobile && !compact && (
          <IconButton
            size="small"
            onClick={() => setCollapsed(true)}
            sx={{
              color: '#94a3b8',
              '&:hover': { color: '#e2e8f0', bgcolor: 'rgba(255, 255, 255, 0.06)' },
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}

        {!isMobile && compact && (
          <IconButton
            size="small"
            onClick={() => setCollapsed(false)}
            sx={{
              position: 'absolute',
              top: 18,
              right: 10,
              color: '#94a3b8',
              '&:hover': { color: '#e2e8f0', bgcolor: 'rgba(255, 255, 255, 0.06)' },
            }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        )}

        {isMobile && (
          <IconButton
            size="small"
            onClick={onMobileClose}
            sx={{
              color: '#94a3b8',
              '&:hover': { color: '#e2e8f0', bgcolor: 'rgba(255, 255, 255, 0.06)' },
            }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Tooltip title={compact ? item.label : ''} placement="right" key={item.path}>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={isMobile ? onMobileClose : undefined}
                sx={{
                  minHeight: 46,
                  px: compact ? 1 : 1.25,
                  borderRadius: 2.5,
                  justifyContent: compact ? 'center' : 'flex-start',
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  bgcolor: isActive ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                  border: isActive ? '1px solid rgba(153, 246, 228, 0.18)' : '1px solid transparent',
                  boxShadow: isActive ? '0 14px 28px rgba(2, 6, 23, 0.18)' : 'none',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: compact ? 0 : 1.25,
                    justifyContent: 'center',
                    color: isActive ? '#99f6e4' : '#94a3b8',
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {!compact && (
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

  if (isMobile) {
    return (
      <Drawer
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 272,
            bgcolor: 'transparent',
            backgroundImage: 'none',
            boxShadow: 'none',
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return content;
}
