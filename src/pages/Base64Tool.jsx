import { useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import UtilityPageShell from '../components/UtilityPageShell';

function encodeBase64(value) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(value)));
}

function decodeBase64(value) {
  const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const stats = useMemo(
    () => [
      { label: 'Input Length', value: input.length },
      { label: 'Output Length', value: output.length },
      { label: 'Mode', value: output ? 'Ready' : 'Idle' },
    ],
    [input.length, output.length],
  );

  const runAction = (fn) => {
    try {
      setOutput(fn(input));
      setError('');
    } catch (err) {
      setError(err.message);
      setOutput('');
    }
  };

  return (
    <UtilityPageShell
      title="Base64 Encode / Decode"
      description="Convert raw text to Base64 and back without leaving the workspace."
      stats={stats}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
        <Button variant="contained" sx={styles.primaryButton} onClick={() => runAction(encodeBase64)}>
          Encode
        </Button>
        <Button variant="outlined" sx={styles.secondaryButton} onClick={() => runAction(decodeBase64)}>
          Decode
        </Button>
        <Button
          variant="text"
          sx={styles.textButton}
          onClick={() => {
            setInput('');
            setOutput('');
            setError('');
          }}
        >
          Clear
        </Button>
      </Stack>

      {error ? <Paper elevation={0} sx={styles.error}>{error}</Paper> : null}

      <Box sx={styles.grid}>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Input</Typography>
          <TextField
            multiline
            minRows={12}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste plain text or a Base64 string..."
            fullWidth
            InputProps={{ sx: styles.input }}
          />
        </Paper>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Output</Typography>
          <TextField
            multiline
            minRows={12}
            value={output}
            fullWidth
            placeholder="Converted output appears here..."
            InputProps={{ readOnly: true, sx: styles.input }}
          />
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
  primaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    textTransform: 'none',
    fontWeight: 700,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    textTransform: 'none',
    fontWeight: 700,
  },
  textButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    textTransform: 'none',
    fontWeight: 700,
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
