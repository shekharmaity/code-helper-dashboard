import { useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import UtilityPageShell from '../components/UtilityPageShell';

async function digestValue(algorithm, value) {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest(algorithm, bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

const algorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({});
  const [error, setError] = useState('');

  const stats = useMemo(
    () => [
      { label: 'Algorithms', value: algorithms.length },
      { label: 'Input Length', value: input.length },
      { label: 'State', value: error ? 'Error' : Object.keys(hashes).length ? 'Generated' : 'Idle' },
    ],
    [error, hashes, input.length],
  );

  const generateHashes = async () => {
    try {
      const values = await Promise.all(algorithms.map(async (algorithm) => [algorithm, await digestValue(algorithm, input)]));
      setHashes(Object.fromEntries(values));
      setError('');
    } catch (err) {
      setError(`Unable to generate hashes: ${err.message}`);
      setHashes({});
    }
  };

  return (
    <UtilityPageShell
      title="Hash Generator"
      description="Generate cryptographic digests for payload verification, fixtures, and quick integrity checks."
      stats={stats}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
        <Button variant="contained" sx={styles.primaryButton} onClick={generateHashes}>
          Generate Hashes
        </Button>
        <Button variant="text" sx={styles.textButton} onClick={() => { setInput(''); setHashes({}); setError(''); }}>
          Clear
        </Button>
      </Stack>

      {error ? <Paper elevation={0} sx={styles.error}>{error}</Paper> : null}

      <Paper elevation={0} sx={styles.panel}>
        <Typography sx={styles.panelTitle}>Input</Typography>
        <TextField multiline minRows={5} value={input} onChange={(event) => setInput(event.target.value)} fullWidth InputProps={{ sx: styles.input }} />
      </Paper>

      <Box sx={styles.grid}>
        {algorithms.map((algorithm) => (
          <Paper key={algorithm} elevation={0} sx={styles.panel}>
            <Typography sx={styles.panelTitle}>{algorithm}</Typography>
            <TextField multiline minRows={3} value={hashes[algorithm] ?? ''} fullWidth InputProps={{ readOnly: true, sx: styles.input }} />
          </Paper>
        ))}
      </Box>
    </UtilityPageShell>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
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
    alignItems: 'flex-start',
    fontSize: 13,
    lineHeight: 1.6,
    fontFamily: '"SF Mono", "SFMono-Regular", Consolas, monospace',
    background: 'rgba(248, 250, 252, 0.9)',
    borderRadius: 3,
  },
  primaryButton: { alignSelf: 'flex-start', borderRadius: 999, textTransform: 'none', fontWeight: 700 },
  textButton: { alignSelf: 'flex-start', borderRadius: 999, textTransform: 'none', fontWeight: 700 },
  error: {
    px: 1.5,
    py: 1.25,
    borderRadius: 3,
    border: '1px solid rgba(239, 68, 68, 0.16)',
    background: 'rgba(254, 242, 242, 0.95)',
    color: '#b91c1c',
    fontSize: 13,
  },
};
