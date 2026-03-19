import { useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import UtilityPageShell from '../components/UtilityPageShell';

function parseTimestampInput(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^\d+$/.test(trimmed)) {
    const numeric = Number(trimmed);
    return new Date(trimmed.length <= 10 ? numeric * 1000 : numeric);
  }

  return new Date(trimmed);
}

export default function TimestampConverter() {
  const [input, setInput] = useState('');
  const [nowSeed, setNowSeed] = useState(() => Date.now());

  const parsedDate = useMemo(() => parseTimestampInput(input), [input]);
  const valid = parsedDate instanceof Date && !Number.isNaN(parsedDate.getTime());

  const stats = [
    { label: 'Unix Seconds', value: valid ? Math.floor(parsedDate.getTime() / 1000) : '-' },
    { label: 'Unix Millis', value: valid ? parsedDate.getTime() : '-' },
    { label: 'Status', value: input ? (valid ? 'Parsed' : 'Invalid') : 'Idle' },
  ];

  return (
    <UtilityPageShell
      title="Timestamp Converter"
      description="Switch between Unix timestamps and readable dates for logs, APIs, and payload debugging."
      stats={stats}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
        <Button
          variant="contained"
          sx={styles.primaryButton}
          onClick={() => {
            const now = Date.now();
            setNowSeed(now);
            setInput(String(now));
          }}
        >
          Use Current Time
        </Button>
        <Button variant="text" sx={styles.textButton} onClick={() => setInput(new Date(nowSeed).toISOString())}>
          Use ISO
        </Button>
      </Stack>

      <Paper elevation={0} sx={styles.panel}>
        <Typography sx={styles.panelTitle}>Input</Typography>
        <TextField
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Enter unix seconds, unix milliseconds, or an ISO date..."
          fullWidth
          InputProps={{ sx: styles.input }}
        />
      </Paper>

      <Box sx={styles.grid}>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Readable Dates</Typography>
          <Stack spacing={1}>
            <Typography sx={styles.valueRow}>ISO: {valid ? parsedDate.toISOString() : '-'}</Typography>
            <Typography sx={styles.valueRow}>Local: {valid ? parsedDate.toLocaleString() : '-'}</Typography>
            <Typography sx={styles.valueRow}>UTC: {valid ? parsedDate.toUTCString() : '-'}</Typography>
          </Stack>
        </Paper>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Unix Values</Typography>
          <Stack spacing={1}>
            <Typography sx={styles.valueRow}>Seconds: {valid ? Math.floor(parsedDate.getTime() / 1000) : '-'}</Typography>
            <Typography sx={styles.valueRow}>Milliseconds: {valid ? parsedDate.getTime() : '-'}</Typography>
            <Typography sx={styles.valueRow}>Timezone Offset: {valid ? parsedDate.getTimezoneOffset() : '-'}</Typography>
          </Stack>
        </Paper>
      </Box>
    </UtilityPageShell>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
    gap: 2,
  },
  panel: {
    p: 2,
    borderRadius: 4,
    background: 'rgba(255, 255, 255, 0.88)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
  },
  panelTitle: {
    mb: 1.25,
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
  },
  input: {
    fontSize: 13,
    background: 'rgba(248, 250, 252, 0.9)',
    borderRadius: 3,
  },
  valueRow: {
    fontSize: 13,
    color: '#334155',
    wordBreak: 'break-word',
    fontFamily: '"SF Mono", "SFMono-Regular", Consolas, monospace',
  },
  primaryButton: { alignSelf: 'flex-start', borderRadius: 999, textTransform: 'none', fontWeight: 700 },
  textButton: { alignSelf: 'flex-start', borderRadius: 999, textTransform: 'none', fontWeight: 700 },
};
