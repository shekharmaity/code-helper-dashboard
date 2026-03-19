import { useMemo, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import YAML from 'yaml';
import UtilityPageShell from '../components/UtilityPageShell';

function summarizeManifest(doc, index) {
  const json = doc.toJSON();

  return {
    id: `${json?.kind ?? 'Unknown'}-${json?.metadata?.name ?? index}`,
    kind: json?.kind ?? 'Unknown',
    apiVersion: json?.apiVersion ?? '-',
    name: json?.metadata?.name ?? '-',
    namespace: json?.metadata?.namespace ?? 'default',
  };
}

export default function KubernetesManifest() {
  const [input, setInput] = useState(
    'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: sample-api\n  namespace: default\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: sample-api\n  template:\n    metadata:\n      labels:\n        app: sample-api\n    spec:\n      containers:\n        - name: app\n          image: nginx:1.27\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: sample-api\nspec:\n  selector:\n    app: sample-api\n  ports:\n    - port: 80\n      targetPort: 80\n',
  );

  const analysis = useMemo(() => {
    if (!input.trim()) {
      return { resources: [], commands: [], error: '' };
    }

    try {
      const docs = YAML.parseAllDocuments(input).filter((doc) => doc.toJSON() !== null);

      docs.forEach((doc) => {
        if (doc.errors.length) {
          throw new Error(doc.errors[0].message);
        }
      });

      const resources = docs.map(summarizeManifest);
      const commands = resources.map(
        (resource) =>
          `kubectl get ${resource.kind.toLowerCase()} ${resource.name}${resource.namespace && resource.namespace !== 'default' ? ` -n ${resource.namespace}` : ''}`,
      );

      return { resources, commands, error: '' };
    } catch (err) {
      return { resources: [], commands: [], error: `Invalid manifest: ${err.message}` };
    }
  }, [input]);

  return (
    <UtilityPageShell
      title="Kubernetes Manifest Inspector"
      description="Validate multi-document Kubernetes YAML, inspect resource metadata, and generate quick kubectl lookup commands."
      stats={[
        { label: 'Resources', value: analysis.resources.length },
        { label: 'Kinds', value: new Set(analysis.resources.map((item) => item.kind)).size },
        { label: 'Status', value: analysis.error ? 'Invalid' : analysis.resources.length ? 'Parsed' : 'Idle' },
      ]}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
        <Button
          variant="text"
          sx={styles.textButton}
          onClick={() => {
            setInput('');
          }}
        >
          Clear Manifest
        </Button>
      </Stack>

      {analysis.error ? <Paper elevation={0} sx={styles.error}>{analysis.error}</Paper> : null}

      <Box sx={styles.grid}>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Manifest YAML</Typography>
          <TextField
            multiline
            minRows={16}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            fullWidth
            InputProps={{ sx: styles.input }}
          />
        </Paper>

        <Stack spacing={2}>
          <Paper elevation={0} sx={styles.panel}>
            <Typography sx={styles.panelTitle}>Resource Summary</Typography>
            <Stack spacing={1.25}>
              {analysis.resources.length ? (
                analysis.resources.map((resource) => (
                  <Box key={resource.id} sx={styles.summaryRow}>
                    <Typography sx={styles.resourceTitle}>
                      {resource.kind} / {resource.name}
                    </Typography>
                    <Typography sx={styles.resourceMeta}>API: {resource.apiVersion}</Typography>
                    <Typography sx={styles.resourceMeta}>Namespace: {resource.namespace}</Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={styles.emptyState}>
                  Parsed Kubernetes resources will appear here.
                </Typography>
              )}
            </Stack>
          </Paper>

          <Paper elevation={0} sx={styles.panel}>
            <Typography sx={styles.panelTitle}>kubectl Hints</Typography>
            <Stack spacing={1}>
              {analysis.commands.length ? (
                analysis.commands.map((command) => (
                  <Typography key={command} sx={styles.command}>
                    {command}
                  </Typography>
                ))
              ) : (
                <Typography sx={styles.emptyState}>
                  Quick commands will appear once the manifest parses.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </UtilityPageShell>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
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
  summaryRow: {
    p: 1.5,
    borderRadius: 3,
    background: 'rgba(248, 250, 252, 0.86)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
  },
  resourceTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0f172a',
  },
  resourceMeta: {
    mt: 0.5,
    fontSize: 12,
    color: '#475569',
  },
  command: {
    px: 1.25,
    py: 1,
    borderRadius: 3,
    background: 'rgba(248, 250, 252, 0.86)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    fontSize: 12,
    color: '#1e293b',
    fontFamily: '"SF Mono", "SFMono-Regular", Consolas, monospace',
    wordBreak: 'break-word',
  },
  emptyState: {
    fontSize: 13,
    color: '#64748b',
  },
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
