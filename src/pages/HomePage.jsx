import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import DataObjectIcon from '@mui/icons-material/DataObject';
import DifferenceIcon from '@mui/icons-material/Difference';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import HubIcon from '@mui/icons-material/Hub';
import LinkIcon from '@mui/icons-material/Link';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import StorageIcon from '@mui/icons-material/Storage';
import CodeIcon from '@mui/icons-material/Code';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { Link } from 'react-router-dom';

const utilityCards = [
  {
    title: 'Mock Manager',
    description: 'Create, edit, and manage mock endpoints in one place.',
    path: '/mocks',
    icon: <StorageIcon fontSize="small" />,
    accent: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
  },
  {
    title: 'JSON Formatter',
    description: 'Format, minify, and inspect nested JSON payloads.',
    path: '/json-formatter',
    icon: <DataObjectIcon fontSize="small" />,
    accent: 'linear-gradient(135deg, #1d4ed8 0%, #38bdf8 100%)',
  },
  {
    title: 'Cron Expression',
    description: 'Validate cron syntax and preview upcoming schedule runs.',
    path: '/cron-expression',
    icon: <ScheduleIcon fontSize="small" />,
    accent: 'linear-gradient(135deg, #6d28d9 0%, #a855f7 100%)',
  },
  {
    title: 'Regex Check',
    description: 'Test patterns, flags, and live matches against sample text.',
    path: '/regex-check',
    icon: <ManageSearchIcon fontSize="small" />,
    accent: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
  },
  {
    title: 'XML Formatter',
    description: 'Clean up XML responses and inspect nested nodes.',
    path: '/xml-formatter',
    icon: <CodeIcon fontSize="small" />,
    accent: 'linear-gradient(135deg, #115e59 0%, #14b8a6 100%)',
  },
  {
    title: 'File Difference',
    description: 'Compare text or files side by side and review changes.',
    path: '/file-difference',
    icon: <DifferenceIcon fontSize="small" />,
    accent: 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)',
  },
  {
    title: 'UUID Generator',
    description: 'Generate quick UUIDs for mocks, fixtures, and tests.',
    path: '/uuid-generator',
    icon: <FingerprintIcon fontSize="small" />,
    accent: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
  },
  {
    title: 'Tiny URL',
    description: 'Create clean short links for demos and sharing.',
    path: '/tiny-url',
    icon: <LinkIcon fontSize="small" />,
    accent: 'linear-gradient(135deg, #b91c1c 0%, #fb923c 100%)',
  },
];

export default function HomePage() {
  return (
    <Box sx={styles.page}>
      <Paper elevation={0} sx={styles.hero}>
        <Box sx={styles.heroCopy}>
          <Box sx={styles.eyebrow}>
            <DashboardCustomizeIcon sx={{ fontSize: 16 }} />
            Workspace
          </Box>
          <Typography variant="h2" sx={styles.title}>
            Mock Dashboard
          </Typography>
          <Typography sx={styles.description}>
            A unified internal workspace for mocks, payload tooling, quick generators, and diff
            workflows. Everything is reachable from one compact utility hub.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
            <Button
              component={Link}
              to="/mocks"
              variant="contained"
              sx={styles.primaryButton}
            >
              Open Mock Manager
            </Button>
            <Button
              component={Link}
              to="/json-formatter"
              variant="outlined"
              sx={styles.secondaryButton}
            >
              Explore Utilities
            </Button>
          </Stack>
        </Box>

        <Box sx={styles.heroStats}>
          <Box sx={styles.statCard}>
            <HubIcon sx={{ color: '#93c5fd', fontSize: 20 }} />
            <Typography sx={styles.statValue}>8</Typography>
            <Typography sx={styles.statLabel}>Utility Pages</Typography>
          </Box>
          <Box sx={styles.statCard}>
            <StorageIcon sx={{ color: '#67e8f9', fontSize: 20 }} />
            <Typography sx={styles.statValue}>1</Typography>
            <Typography sx={styles.statLabel}>Mock Workspace</Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={styles.sectionHeader}>
        <Typography variant="h5" sx={styles.sectionTitle}>
          Quick Access
        </Typography>
        <Typography sx={styles.sectionSubtitle}>
          Jump straight into the tool you need without digging through menus.
        </Typography>
      </Box>

      <Box sx={styles.cardGrid}>
        {utilityCards.map((card) => (
          <Paper key={card.path} elevation={0} sx={styles.card}>
            <Box sx={{ ...styles.cardIcon, background: card.accent }}>{card.icon}</Box>
            <Typography sx={styles.cardTitle}>{card.title}</Typography>
            <Typography sx={styles.cardDescription}>{card.description}</Typography>
            <Button component={Link} to={card.path} sx={styles.cardButton}>
              Open
            </Button>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

const styles = {
  page: {
    width: '100%',
    minHeight: 'calc(100vh - 48px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    py: 1,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: '1.5fr 0.8fr' },
    gap: 3,
    padding: { xs: 3, md: 4 },
    borderRadius: 6,
    color: '#f8fafc',
    background:
      'radial-gradient(circle at top left, rgba(56, 189, 248, 0.22), transparent 28%), linear-gradient(135deg, #0f172a 0%, #1e293b 46%, #1d4ed8 100%)',
    boxShadow: '0 30px 80px rgba(15, 23, 42, 0.18)',
  },
  heroCopy: {
    maxWidth: '760px',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    px: 1.5,
    py: 0.75,
    borderRadius: 999,
    background: 'rgba(148, 163, 184, 0.14)',
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  title: {
    mt: 2,
    fontSize: { xs: '2.5rem', md: '3.6rem' },
    lineHeight: 1.02,
    fontWeight: 800,
    letterSpacing: '-0.04em',
  },
  description: {
    mt: 2,
    maxWidth: '58ch',
    color: 'rgba(226, 232, 240, 0.9)',
    fontSize: 16,
    lineHeight: 1.8,
  },
  primaryButton: {
    borderRadius: 999,
    px: 2.5,
    py: 1.2,
    textTransform: 'none',
    fontWeight: 700,
    background: '#f8fafc',
    color: '#0f172a',
    '&:hover': {
      background: '#e2e8f0',
    },
  },
  secondaryButton: {
    borderRadius: 999,
    px: 2.5,
    py: 1.2,
    textTransform: 'none',
    fontWeight: 700,
    borderColor: 'rgba(191, 219, 254, 0.4)',
    color: '#e0f2fe',
    '&:hover': {
      borderColor: '#93c5fd',
      background: 'rgba(148, 163, 184, 0.08)',
    },
  },
  heroStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 2,
    alignSelf: 'stretch',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 1,
    p: 3,
    borderRadius: 5,
    background: 'rgba(15, 23, 42, 0.28)',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    backdropFilter: 'blur(12px)',
  },
  statValue: {
    fontSize: '2.2rem',
    fontWeight: 800,
    color: '#f8fafc',
  },
  statLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  sectionHeader: {
    px: { xs: 0.5, md: 0.75 },
  },
  sectionTitle: {
    fontWeight: 800,
    color: '#0f172a',
  },
  sectionSubtitle: {
    mt: 0.75,
    color: '#64748b',
    fontSize: 15,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 2,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 220,
    p: 3,
    borderRadius: 5,
    background: 'rgba(255, 255, 255, 0.88)',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    boxShadow: '0 18px 42px rgba(15, 23, 42, 0.06)',
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 3,
    display: 'grid',
    placeItems: 'center',
    color: '#f8fafc',
    mb: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
  },
  cardDescription: {
    mt: 1,
    color: '#64748b',
    lineHeight: 1.7,
    flexGrow: 1,
  },
  cardButton: {
    mt: 2.5,
    width: 'fit-content',
    px: 0,
    textTransform: 'none',
    fontWeight: 700,
    color: '#2563eb',
  },
};
