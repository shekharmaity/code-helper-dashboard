import { useMemo, useState } from 'react';
import { Box, Paper, TextField, Typography } from '@mui/material';
import UtilityPageShell from '../components/UtilityPageShell';

function walkDifferences(left, right, path = '$') {
  const diffs = [];

  if (typeof left !== typeof right) {
    diffs.push({ path, left, right, reason: 'Type mismatch' });
    return diffs;
  }

  if (left === null || right === null || typeof left !== 'object') {
    if (left !== right) {
      diffs.push({ path, left, right, reason: 'Value changed' });
    }
    return diffs;
  }

  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

  keys.forEach((key) => {
    if (!(key in left)) {
      diffs.push({ path: `${path}.${key}`, left: undefined, right: right[key], reason: 'Added' });
      return;
    }

    if (!(key in right)) {
      diffs.push({ path: `${path}.${key}`, left: left[key], right: undefined, reason: 'Removed' });
      return;
    }

    diffs.push(...walkDifferences(left[key], right[key], `${path}.${key}`));
  });

  return diffs;
}

export default function JsonDiff() {
  const [left, setLeft] = useState('{\n  "id": 1,\n  "name": "alpha"\n}');
  const [right, setRight] = useState('{\n  "id": 1,\n  "name": "beta"\n}');

  const result = useMemo(() => {
    try {
      const parsedLeft = JSON.parse(left || '{}');
      const parsedRight = JSON.parse(right || '{}');
      return { diffs: walkDifferences(parsedLeft, parsedRight), error: '' };
    } catch (err) {
      return { diffs: [], error: `Invalid JSON: ${err.message}` };
    }
  }, [left, right]);

  return (
    <UtilityPageShell
      title="JSON Diff"
      description="Compare parsed JSON structures by path instead of relying only on line-based text diff."
      stats={[
        { label: 'Differences', value: result.diffs.length },
        { label: 'Left Size', value: left.length },
        { label: 'Right Size', value: right.length },
      ]}
    >
      {result.error ? <Paper elevation={0} sx={styles.error}>{result.error}</Paper> : null}

      <Box sx={styles.grid}>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Left JSON</Typography>
          <TextField multiline minRows={12} value={left} onChange={(event) => setLeft(event.target.value)} fullWidth InputProps={{ sx: styles.input }} />
        </Paper>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Right JSON</Typography>
          <TextField multiline minRows={12} value={right} onChange={(event) => setRight(event.target.value)} fullWidth InputProps={{ sx: styles.input }} />
        </Paper>
      </Box>

      <Paper elevation={0} sx={styles.panel}>
        <Typography sx={styles.panelTitle}>Differences</Typography>
        <Box sx={styles.diffList}>
          {result.diffs.length ? result.diffs.map((diff) => (
            <Box key={diff.path} sx={styles.diffRow}>
              <Typography sx={styles.diffPath}>{diff.path}</Typography>
              <Typography sx={styles.diffReason}>{diff.reason}</Typography>
              <Typography sx={styles.diffValue}>Left: {JSON.stringify(diff.left)}</Typography>
              <Typography sx={styles.diffValue}>Right: {JSON.stringify(diff.right)}</Typography>
            </Box>
          )) : (
            <Typography sx={styles.emptyState}>No semantic differences found.</Typography>
          )}
        </Box>
      </Paper>
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
  diffList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.25,
  },
  diffRow: {
    p: 1.5,
    borderRadius: 3,
    border: '1px solid rgba(148, 163, 184, 0.18)',
    background: 'rgba(248, 250, 252, 0.8)',
  },
  diffPath: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0f172a',
    fontFamily: '"SF Mono", "SFMono-Regular", Consolas, monospace',
  },
  diffReason: {
    mt: 0.5,
    fontSize: 12,
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  diffValue: {
    mt: 0.75,
    fontSize: 12,
    color: '#475569',
    wordBreak: 'break-word',
    fontFamily: '"SF Mono", "SFMono-Regular", Consolas, monospace',
  },
  emptyState: {
    fontSize: 13,
    color: '#64748b',
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
