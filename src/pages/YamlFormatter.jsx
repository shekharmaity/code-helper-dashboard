import { useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import YAML from 'yaml';
import UtilityPageShell from '../components/UtilityPageShell';

export default function YamlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const stats = useMemo(
    () => [
      { label: 'Input Length', value: input.length },
      { label: 'Output Length', value: output.length },
      { label: 'Status', value: error ? 'Invalid' : output ? 'Formatted' : 'Idle' },
    ],
    [error, input.length, output.length],
  );

  const handleFormat = () => {
    try {
      const docs = YAML.parseAllDocuments(input);
      const formatted = docs
        .map((doc) => {
          if (doc.errors.length) {
            throw new Error(doc.errors[0].message);
          }

          return String(doc.toString({ indent: 2 })).trimEnd();
        })
        .join('\n---\n');

      setOutput(formatted);
      setError('');
    } catch (err) {
      setError(`Invalid YAML: ${err.message}`);
      setOutput('');
    }
  };

  const handleToJson = () => {
    try {
      const docs = YAML.parseAllDocuments(input);
      const json = docs
        .map((doc) => {
          if (doc.errors.length) {
            throw new Error(doc.errors[0].message);
          }

          return JSON.stringify(doc.toJSON(), null, 2);
        })
        .join('\n\n');

      setOutput(json);
      setError('');
    } catch (err) {
      setError(`Invalid YAML: ${err.message}`);
      setOutput('');
    }
  };

  return (
    <UtilityPageShell
      title="YAML Formatter"
      description="Format and validate YAML documents, or convert them into readable JSON for quick inspection."
      stats={stats}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
        <Button variant="contained" sx={styles.primaryButton} onClick={handleFormat}>
          Format YAML
        </Button>
        <Button variant="outlined" sx={styles.secondaryButton} onClick={handleToJson}>
          Convert To JSON
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
          <Typography sx={styles.panelTitle}>Input YAML</Typography>
          <TextField
            multiline
            minRows={14}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste YAML here..."
            fullWidth
            InputProps={{ sx: styles.input }}
          />
        </Paper>

        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Output</Typography>
          <TextField
            multiline
            minRows={14}
            value={output}
            fullWidth
            placeholder="Formatted YAML or converted JSON will appear here..."
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
  primaryButton: { alignSelf: 'flex-start', borderRadius: 999, textTransform: 'none', fontWeight: 700 },
  secondaryButton: { alignSelf: 'flex-start', borderRadius: 999, textTransform: 'none', fontWeight: 700 },
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
