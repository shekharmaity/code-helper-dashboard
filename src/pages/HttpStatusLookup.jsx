import { useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, Typography } from '@mui/material';
import UtilityPageShell from '../components/UtilityPageShell';

const statusMap = {
  100: ['Continue', 'The server received the initial request headers and the client should proceed.'],
  101: ['Switching Protocols', 'The server is changing protocols as requested.'],
  200: ['OK', 'The request succeeded.'],
  201: ['Created', 'A new resource was created successfully.'],
  202: ['Accepted', 'The request was accepted for processing.'],
  204: ['No Content', 'The request succeeded and there is no response body.'],
  301: ['Moved Permanently', 'The resource has a permanent new URL.'],
  302: ['Found', 'The resource is temporarily available at another URL.'],
  304: ['Not Modified', 'The cached version is still valid.'],
  400: ['Bad Request', 'The request payload or parameters are invalid.'],
  401: ['Unauthorized', 'Authentication is required or has failed.'],
  403: ['Forbidden', 'The client is authenticated but not allowed.'],
  404: ['Not Found', 'The requested resource could not be found.'],
  409: ['Conflict', 'The request conflicts with the current state of the resource.'],
  422: ['Unprocessable Entity', 'The payload is valid JSON but fails business validation.'],
  429: ['Too Many Requests', 'The client has sent too many requests in a given time.'],
  500: ['Internal Server Error', 'The server encountered an unexpected condition.'],
  502: ['Bad Gateway', 'An upstream service returned an invalid response.'],
  503: ['Service Unavailable', 'The service is temporarily unavailable.'],
  504: ['Gateway Timeout', 'An upstream service did not respond in time.'],
};

export default function HttpStatusLookup() {
  const [input, setInput] = useState('200');

  const result = useMemo(() => statusMap[Number(input)] ?? null, [input]);

  return (
    <UtilityPageShell
      title="HTTP Status Lookup"
      description="Look up common HTTP status codes and keep quick API semantics close at hand."
      stats={[
        { label: 'Code', value: input || '-' },
        { label: 'Category', value: input ? `${String(input)[0]}xx` : '-' },
        { label: 'Known', value: result ? 'Yes' : 'No' },
      ]}
    >
      <Paper elevation={0} sx={styles.panel}>
        <Typography sx={styles.panelTitle}>Status Code</Typography>
        <TextField value={input} onChange={(event) => setInput(event.target.value.replace(/[^\d]/g, '').slice(0, 3))} fullWidth InputProps={{ sx: styles.input }} />
      </Paper>

      <Box sx={styles.grid}>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Meaning</Typography>
          <Stack spacing={1}>
            <Typography sx={styles.valueTitle}>{result ? result[0] : 'Unknown status code'}</Typography>
            <Typography sx={styles.valueText}>{result ? result[1] : 'This quick lookup only includes common API-facing status codes.'}</Typography>
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
  valueTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
  },
  valueText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 1.7,
  },
};
