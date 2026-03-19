import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

export default function UtilityPageShell({
  eyebrow = 'Developer Utility',
  title,
  description,
  stats = [],
  children,
}) {
  return (
    <Box sx={styles.page}>
      <Paper elevation={0} sx={styles.hero}>
        <Box sx={styles.heroCopy}>
          <Chip label={eyebrow} size="small" sx={styles.eyebrow} />
          <Typography sx={styles.title}>{title}</Typography>
          <Typography sx={styles.description}>{description}</Typography>
        </Box>

        {stats.length ? (
          <Box sx={styles.stats}>
            {stats.map((stat) => (
              <Paper key={stat.label} elevation={0} sx={styles.statCard}>
                <Typography sx={styles.statValue}>{stat.value}</Typography>
                <Typography sx={styles.statLabel}>{stat.label}</Typography>
              </Paper>
            ))}
          </Box>
        ) : null}
      </Paper>

      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
}

const styles = {
  page: {
    width: '100%',
    minHeight: 'calc(100vh - 48px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    py: 0.5,
  },
  hero: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', lg: '1.35fr 0.8fr' },
    gap: 2,
    p: { xs: 2, md: 2.5 },
    borderRadius: 5,
    color: '#f8fafc',
    background:
      'radial-gradient(circle at top left, rgba(83, 146, 247, 0.14), transparent 26%), linear-gradient(135deg, #2b313b 0%, #262b33 52%, #22272e 100%)',
    boxShadow: '0 20px 52px rgba(0, 0, 0, 0.18)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  heroCopy: {
    maxWidth: '760px',
  },
  eyebrow: {
    height: 24,
    borderRadius: 999,
    bgcolor: 'rgba(148, 163, 184, 0.14)',
    color: '#8ab4f8',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  title: {
    mt: 1.25,
    fontSize: { xs: '1.6rem', md: '2rem' },
    lineHeight: 1.04,
    fontWeight: 800,
    letterSpacing: '-0.04em',
  },
  description: {
    mt: 1,
    maxWidth: '58ch',
    color: 'rgba(199, 210, 218, 0.9)',
    fontSize: 13,
    lineHeight: 1.65,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 1.25,
    alignSelf: 'stretch',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 0.75,
    p: 1.75,
    borderRadius: 4,
    background: 'rgba(31, 35, 41, 0.72)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  statValue: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: '#f8fafc',
  },
  statLabel: {
    color: '#9da7b3',
    fontSize: 10,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
};
