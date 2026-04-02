import { useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import YAML from 'yaml';
import StructuredDataTree from '../components/StructuredDataTree';
import UtilityPageShell from '../components/UtilityPageShell';

function formatSize(value) {
  const bytes = new TextEncoder().encode(value).length;

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function countNodes(value) {
  if (!value || typeof value !== 'object') {
    return 0;
  }

  const children = Array.isArray(value) ? value : Object.values(value);
  return 1 + children.reduce((total, child) => total + countNodes(child), 0);
}

export default function YamlFormatter() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState('editor');
  const [treeData, setTreeData] = useState();
  const [mode, setMode] = useState('yaml');

  const stats = useMemo(
    () => [
      { label: 'Workspace Size', value: formatSize(input) },
      { label: 'Visible Lines', value: input ? input.split('\n').length : 0 },
      { label: 'Tree Blocks', value: countNodes(treeData) },
      { label: 'Mode', value: view === 'tree' ? 'Tree View' : 'Raw Input' },
    ],
    [input, treeData, view],
  );

  const parseYamlDocuments = () => {
    const docs = YAML.parseAllDocuments(input);

    docs.forEach((doc) => {
      if (doc.errors.length) {
        throw new Error(doc.errors[0].message);
      }
    });

    return docs;
  };

  const handleFormat = () => {
    try {
      const docs = parseYamlDocuments();
      const formatted = docs
        .map((doc) => String(doc.toString({ indent: 2 })).trimEnd())
        .join('\n---\n');
      const parsed = docs.map((doc) => doc.toJSON());

      setInput(formatted);
      setTreeData(parsed.length === 1 ? parsed[0] : parsed);
      setMode('yaml');
      setView('tree');
      setError('');
    } catch (err) {
      setError(`Invalid YAML: ${err.message}`);
      setTreeData(undefined);
      setView('editor');
    }
  };

  const handleToJson = () => {
    try {
      const docs = parseYamlDocuments();
      const parsed = docs.map((doc) => doc.toJSON());
      const json = docs.map((doc) => JSON.stringify(doc.toJSON(), null, 2)).join('\n\n');

      setInput(json);
      setTreeData(parsed.length === 1 ? parsed[0] : parsed);
      setMode('json');
      setView('tree');
      setError('');
    } catch (err) {
      setError(`Invalid YAML: ${err.message}`);
      setTreeData(undefined);
      setView('editor');
    }
  };

  return (
    <UtilityPageShell
      title="YAML Formatter"
      description="Paste YAML, then format it or convert it to JSON and inspect the result as a tree in the same workspace panel."
      stats={stats}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
        <Button variant="contained" sx={styles.primaryButton} onClick={handleFormat}>
          Format YAML
        </Button>
        <Button variant="outlined" sx={styles.secondaryButton} onClick={handleToJson}>
          Convert To JSON
        </Button>
        <Button variant="outlined" sx={styles.secondaryButton} onClick={() => setView('editor')} disabled={!input}>
          Edit Raw
        </Button>
        <Button
          variant="text"
          sx={styles.textButton}
          onClick={() => {
            setInput('');
            setTreeData(undefined);
            setError('');
            setMode('yaml');
            setView('editor');
          }}
        >
          Clear
        </Button>
      </Stack>

      {error ? <Paper elevation={0} sx={styles.error}>{error}</Paper> : null}

      <Paper elevation={0} sx={styles.panel}>
        <Box sx={styles.panelHeader}>
          <Box>
            <Typography sx={styles.panelTitle}>YAML Workspace</Typography>
            <Typography sx={styles.panelSubtitle}>
              {view === 'tree'
                ? `Formatted ${mode.toUpperCase()} is rendered as a tree in this same panel.`
                : 'Paste or edit raw YAML here, then format it when you are ready.'}
            </Typography>
          </Box>
          <Typography sx={styles.panelBadge}>{view === 'tree' ? 'Tree View' : 'Editor'}</Typography>
        </Box>

        <Box sx={styles.workspace}>
          {view === 'tree' ? (
            <StructuredDataTree
              data={treeData}
              emptyTitle="Formatted YAML will appear here"
              emptyHint="Run YAML format or convert to JSON to render a tree view in this panel."
            />
          ) : (
            <TextField
              multiline
              minRows={20}
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setTreeData(undefined);
                setError('');
              }}
              placeholder="Paste YAML here..."
              fullWidth
              InputProps={{ sx: styles.input }}
            />
          )}
        </Box>
      </Paper>
    </UtilityPageShell>
  );
}

const styles = {
  panel: {
    p: 2,
    borderRadius: 4,
    background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
    border: '1px solid rgba(30, 41, 59, 0.85)',
    boxShadow: '0 24px 52px rgba(15, 23, 42, 0.18)',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 2,
    mb: 1.5,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#f8fafc',
  },
  panelSubtitle: {
    mt: 0.5,
    fontSize: 12,
    color: '#94a3b8',
  },
  panelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    px: 1.25,
    py: 0.75,
    borderRadius: 999,
    background: 'rgba(59, 130, 246, 0.12)',
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  workspace: {
    minHeight: 500,
    borderRadius: 3,
    overflow: 'hidden',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    background: 'rgba(15, 23, 42, 0.34)',
  },
  input: {
    alignItems: 'flex-start',
    minHeight: 500,
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 1.7,
    fontFamily: '"SF Mono", "SFMono-Regular", Consolas, monospace',
    background: 'transparent',
    '& textarea': {
      minHeight: '500px !important',
      color: '#e2e8f0',
    },
    '& fieldset': {
      border: 'none',
    },
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
