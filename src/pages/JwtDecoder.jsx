import { useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, Typography } from '@mui/material';
import UtilityPageShell from '../components/UtilityPageShell';

function decodeJwtSegment(segment) {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export default function JwtDecoder() {
  const [token, setToken] = useState('');

  const decoded = useMemo(() => {
    if (!token.trim()) {
      return { header: '', payload: '', signature: '', error: '' };
    }

    const parts = token.trim().split('.');

    if (parts.length !== 3) {
      return { header: '', payload: '', signature: '', error: 'JWT must have 3 sections.' };
    }

    try {
      return {
        header: JSON.stringify(decodeJwtSegment(parts[0]), null, 2),
        payload: JSON.stringify(decodeJwtSegment(parts[1]), null, 2),
        signature: parts[2],
        error: '',
      };
    } catch (err) {
      return { header: '', payload: '', signature: '', error: `Unable to decode token: ${err.message}` };
    }
  }, [token]);

  const stats = [
    { label: 'Sections', value: token ? token.trim().split('.').length : 0 },
    { label: 'Has Payload', value: decoded.payload ? 'Yes' : 'No' },
    { label: 'Status', value: decoded.error ? 'Invalid' : token ? 'Decoded' : 'Idle' },
  ];

  return (
    <UtilityPageShell
      title="JWT Decoder"
      description="Inspect JWT headers and claims locally. This tool decodes tokens but does not verify signatures."
      stats={stats}
    >
      {decoded.error ? <Paper elevation={0} sx={styles.error}>{decoded.error}</Paper> : null}

      <Paper elevation={0} sx={styles.panel}>
        <Typography sx={styles.panelTitle}>Token</Typography>
        <TextField
          multiline
          minRows={5}
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Paste a JWT here..."
          fullWidth
          InputProps={{ sx: styles.input }}
        />
      </Paper>

      <Box sx={styles.grid}>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Header</Typography>
          <TextField multiline minRows={10} value={decoded.header} fullWidth InputProps={{ readOnly: true, sx: styles.input }} />
        </Paper>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Payload</Typography>
          <TextField multiline minRows={10} value={decoded.payload} fullWidth InputProps={{ readOnly: true, sx: styles.input }} />
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
    alignItems: 'flex-start',
    fontSize: 13,
    lineHeight: 1.6,
    fontFamily: '"SF Mono", "SFMono-Regular", Consolas, monospace',
    background: 'rgba(248, 250, 252, 0.9)',
    borderRadius: 3,
  },
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
