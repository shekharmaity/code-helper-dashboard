import { useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import UtilityPageShell from '../components/UtilityPageShell';

function parseRows(value) {
  return value
    .split('\n')
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [key, ...rest] = row.split('=');
      return [key?.trim() ?? '', rest.join('=').trim()];
    });
}

export default function QueryParamBuilder() {
  const [rows, setRows] = useState('page=1\nlimit=20\nsort=createdAt');
  const [baseUrl, setBaseUrl] = useState('https://api.example.com/resources');

  const params = useMemo(() => {
    const searchParams = new URLSearchParams();
    parseRows(rows).forEach(([key, value]) => {
      if (key) {
        searchParams.append(key, value);
      }
    });
    return searchParams;
  }, [rows]);

  const builtUrl = `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;

  return (
    <UtilityPageShell
      title="Query Param Builder"
      description="Compose query strings quickly from key-value rows and preview the final request URL."
      stats={[
        { label: 'Params', value: Array.from(params.keys()).length },
        { label: 'Encoded Length', value: params.toString().length },
        { label: 'Base URL', value: baseUrl ? 'Set' : 'None' },
      ]}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
        <Button variant="text" sx={styles.textButton} onClick={() => setRows('')}>
          Clear Params
        </Button>
      </Stack>

      <Box sx={styles.grid}>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Base URL</Typography>
          <TextField value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} fullWidth InputProps={{ sx: styles.input }} />
          <Typography sx={{ ...styles.panelTitle, mt: 2 }}>Parameters</Typography>
          <TextField
            multiline
            minRows={8}
            value={rows}
            onChange={(event) => setRows(event.target.value)}
            fullWidth
            placeholder="key=value"
            InputProps={{ sx: styles.input }}
          />
        </Paper>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Encoded Output</Typography>
          <TextField multiline minRows={4} value={params.toString()} fullWidth InputProps={{ readOnly: true, sx: styles.input }} />
          <Typography sx={{ ...styles.panelTitle, mt: 2 }}>Full URL</Typography>
          <TextField multiline minRows={6} value={builtUrl} fullWidth InputProps={{ readOnly: true, sx: styles.input }} />
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
  textButton: { alignSelf: 'flex-start', borderRadius: 999, textTransform: 'none', fontWeight: 700 },
};
