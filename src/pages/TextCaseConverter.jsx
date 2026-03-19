import { useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import UtilityPageShell from '../components/UtilityPageShell';

function toTitleCase(value) {
  return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function toSentenceCase(value) {
  const trimmed = value.trim().toLowerCase();
  return trimmed ? `${trimmed[0].toUpperCase()}${trimmed.slice(1)}` : '';
}

function toCamelCase(value) {
  const words = value.toLowerCase().split(/[^a-zA-Z0-9]+/).filter(Boolean);
  return words.map((word, index) => (index === 0 ? word : `${word[0].toUpperCase()}${word.slice(1)}`)).join('');
}

function toKebabCase(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function toSnakeCase(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

const transforms = [
  { label: 'UPPERCASE', fn: (value) => value.toUpperCase() },
  { label: 'lowercase', fn: (value) => value.toLowerCase() },
  { label: 'Title Case', fn: toTitleCase },
  { label: 'Sentence case', fn: toSentenceCase },
  { label: 'camelCase', fn: toCamelCase },
  { label: 'kebab-case', fn: toKebabCase },
  { label: 'snake_case', fn: toSnakeCase },
];

export default function TextCaseConverter() {
  const [input, setInput] = useState('');

  const results = useMemo(
    () => transforms.map((item) => ({ ...item, value: item.fn(input) })),
    [input],
  );

  return (
    <UtilityPageShell
      title="Text Case Converter"
      description="Switch between common naming and copy styles for code, docs, and payload keys."
      stats={[
        { label: 'Characters', value: input.length },
        { label: 'Words', value: input.trim() ? input.trim().split(/\s+/).length : 0 },
        { label: 'Transforms', value: transforms.length },
      ]}
    >
      <Paper elevation={0} sx={styles.panel}>
        <Typography sx={styles.panelTitle}>Source Text</Typography>
        <TextField
          multiline
          minRows={5}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          fullWidth
          placeholder="Paste text to transform..."
          InputProps={{ sx: styles.input }}
        />
      </Paper>

      <Box sx={styles.grid}>
        {results.map((result) => (
          <Paper key={result.label} elevation={0} sx={styles.panel}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Typography sx={styles.panelTitle}>{result.label}</Typography>
              <Button size="small" sx={styles.copyButton} onClick={() => navigator.clipboard.writeText(result.value)}>
                Copy
              </Button>
            </Stack>
            <TextField multiline minRows={3} value={result.value} fullWidth InputProps={{ readOnly: true, sx: styles.input }} />
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
  copyButton: {
    minWidth: 0,
    px: 0,
    textTransform: 'none',
    fontWeight: 700,
  },
};
