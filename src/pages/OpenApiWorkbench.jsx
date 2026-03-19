import { useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, Typography } from '@mui/material';
import YAML from 'yaml';
import UtilityPageShell from '../components/UtilityPageShell';

function parseSpec(source) {
  const trimmed = source.trim();

  if (!trimmed) {
    return { spec: null, error: '' };
  }

  try {
    const doc = YAML.parseDocument(trimmed);

    if (doc.errors.length) {
      throw new Error(doc.errors[0].message);
    }

    return { spec: doc.toJSON(), error: '' };
  } catch (err) {
    return { spec: null, error: err.message };
  }
}

function buildSuggestions(spec) {
  if (!spec) {
    return [];
  }

  const suggestions = [];
  const version = spec.openapi || spec.swagger;

  if (!version) {
    suggestions.push('Add `openapi` or `swagger` at the root so tooling can detect the spec version.');
  }

  if (!spec.info?.title) {
    suggestions.push('Add `info.title` to make the spec easier to identify in tooling.');
  }

  if (!spec.info?.version) {
    suggestions.push('Add `info.version` so consumers can track spec changes.');
  }

  if (!spec.paths || !Object.keys(spec.paths).length) {
    suggestions.push('Define at least one path under `paths` so the spec exposes actual operations.');
  }

  if (spec.paths) {
    Object.entries(spec.paths).forEach(([path, pathItem]) => {
      const operations = Object.entries(pathItem || {}).filter(([method]) =>
        ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method),
      );

      operations.forEach(([method, operation]) => {
        if (!operation.summary && !operation.description) {
          suggestions.push(`Add a summary or description for \`${method.toUpperCase()} ${path}\`.`);
        }

        if (!operation.responses || !Object.keys(operation.responses).length) {
          suggestions.push(`Add responses for \`${method.toUpperCase()} ${path}\`.`);
        }
      });
    });
  }

  return suggestions.slice(0, 8);
}

function collectOperations(spec) {
  if (!spec?.paths) {
    return [];
  }

  return Object.entries(spec.paths).flatMap(([path, pathItem]) =>
    Object.entries(pathItem || {})
      .filter(([method]) => ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'].includes(method))
      .map(([method, operation]) => ({
        id: `${method}:${path}`,
        method: method.toUpperCase(),
        path,
        summary: operation.summary || operation.operationId || 'No summary',
        tags: operation.tags || [],
      })),
  );
}

function calculateSpecPerformanceScore(spec, operations) {
  if (!spec || !operations.length) {
    return { score: 0, label: 'Idle', breakdown: [] };
  }

  let score = 0;
  const breakdown = [];
  const servers = spec.servers?.length ?? 0;
  const pathCount = spec.paths ? Object.keys(spec.paths).length : 0;
  const componentsCount = spec.components ? Object.keys(spec.components).length : 0;
  const documentedOps = operations.filter(
    (operation) => operation.summary && operation.summary !== 'No summary',
  ).length;

  const operationDetails = operations.map((operation) => {
    const raw = spec.paths?.[operation.path]?.[operation.method.toLowerCase()] ?? {};
    return {
      ...operation,
      responses: raw.responses ? Object.keys(raw.responses).length : 0,
      tagsCount: raw.tags?.length ?? 0,
      hasOperationId: Boolean(raw.operationId),
    };
  });

  const responseCoverage = operationDetails.filter((item) => item.responses > 0).length;
  const tagCoverage = operationDetails.filter((item) => item.tagsCount > 0).length;
  const operationIdCoverage = operationDetails.filter((item) => item.hasOperationId).length;

  const addScore = (value, label) => {
    score += value;
    breakdown.push({ value, label });
  };

  addScore(Math.min(20, documentedOps * 4), 'Operation summaries');
  addScore(Math.min(20, responseCoverage * 4), 'Response coverage');
  addScore(Math.min(12, tagCoverage * 2), 'Tag coverage');
  addScore(Math.min(10, operationIdCoverage * 2), 'Operation IDs');
  addScore(spec.info?.title ? 6 : 0, 'Spec title');
  addScore(spec.info?.version ? 6 : 0, 'Spec version');
  addScore(servers ? Math.min(8, servers * 4) : 0, 'Server definitions');
  addScore(pathCount ? Math.min(8, pathCount * 2) : 0, 'Path breadth');
  addScore(componentsCount ? Math.min(10, componentsCount * 2) : 0, 'Component reuse');

  const finalScore = Math.min(100, score);
  const label =
    finalScore >= 85 ? 'Strong' : finalScore >= 65 ? 'Good' : finalScore >= 40 ? 'Fair' : 'Weak';

  return { score: finalScore, label, breakdown };
}

function walkDifferences(left, right, path = '$') {
  const diffs = [];

  if (typeof left !== typeof right) {
    diffs.push({ path, reason: 'Type mismatch', left, right });
    return diffs;
  }

  if (left === null || right === null || typeof left !== 'object') {
    if (left !== right) {
      diffs.push({ path, reason: 'Value changed', left, right });
    }
    return diffs;
  }

  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

  keys.forEach((key) => {
    if (!(key in left)) {
      diffs.push({ path: `${path}.${key}`, reason: 'Added', left: undefined, right: right[key] });
      return;
    }

    if (!(key in right)) {
      diffs.push({ path: `${path}.${key}`, reason: 'Removed', left: left[key], right: undefined });
      return;
    }

    diffs.push(...walkDifferences(left[key], right[key], `${path}.${key}`));
  });

  return diffs;
}

export default function OpenApiWorkbench() {
  const [source, setSource] = useState(
    'openapi: 3.0.3\ninfo:\n  title: Sample Orders API\n  version: 1.0.0\nservers:\n  - url: https://api.example.com\npaths:\n  /orders:\n    get:\n      summary: List orders\n      tags: [Orders]\n      responses:\n        "200":\n          description: Successful response\n    post:\n      summary: Create order\n      tags: [Orders]\n      responses:\n        "201":\n          description: Order created\n',
  );
  const [compareSource, setCompareSource] = useState('');

  const parsedPrimary = useMemo(() => parseSpec(source), [source]);
  const parsedCompare = useMemo(() => parseSpec(compareSource), [compareSource]);

  const primarySpec = parsedPrimary.spec;
  const operations = useMemo(() => collectOperations(primarySpec), [primarySpec]);
  const suggestions = useMemo(() => buildSuggestions(primarySpec), [primarySpec]);
  const performanceScore = useMemo(
    () => calculateSpecPerformanceScore(primarySpec, operations),
    [operations, primarySpec],
  );

  const diffResult = useMemo(() => {
    if (!compareSource.trim()) {
      return { diffs: [], error: '' };
    }

    if (parsedPrimary.error) {
      return { diffs: [], error: 'Fix the primary spec before comparing.' };
    }

    if (parsedCompare.error) {
      return { diffs: [], error: `Comparison spec is invalid: ${parsedCompare.error}` };
    }

    return {
      diffs: walkDifferences(parsedPrimary.spec || {}, parsedCompare.spec || {}).slice(0, 40),
      error: '',
    };
  }, [compareSource, parsedCompare.error, parsedCompare.spec, parsedPrimary.error, parsedPrimary.spec]);

  const stats = [
    { label: 'Operations', value: operations.length },
    { label: 'Spec Score', value: `${performanceScore.score}/100` },
    { label: 'Servers', value: primarySpec?.servers?.length ?? 0 },
    { label: 'Status', value: parsedPrimary.error ? 'Invalid' : primarySpec ? performanceScore.label : 'Idle' },
  ];

  return (
    <UtilityPageShell
      title="OpenAPI Workbench"
      description="Validate Swagger or OpenAPI specs, preview routes, get authoring suggestions, and compare revisions semantically."
      stats={stats}
    >
      {parsedPrimary.error ? <Paper elevation={0} sx={styles.error}>Invalid spec: {parsedPrimary.error}</Paper> : null}

      <Box sx={styles.topGrid}>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>OpenAPI / Swagger Spec</Typography>
          <TextField
            multiline
            minRows={18}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="Paste JSON or YAML OpenAPI spec..."
            fullWidth
            InputProps={{ sx: styles.input }}
          />
        </Paper>

        <Stack spacing={2}>
          <Paper elevation={0} sx={styles.panel}>
            <Typography sx={styles.panelTitle}>Spec Overview</Typography>
            <Stack spacing={1}>
              <Typography sx={styles.valueRow}>Version: {primarySpec?.openapi || primarySpec?.swagger || '-'}</Typography>
              <Typography sx={styles.valueRow}>Title: {primarySpec?.info?.title || '-'}</Typography>
              <Typography sx={styles.valueRow}>Info Version: {primarySpec?.info?.version || '-'}</Typography>
              <Typography sx={styles.valueRow}>Base Servers: {primarySpec?.servers?.length ?? 0}</Typography>
              <Typography sx={styles.valueRow}>Paths: {primarySpec?.paths ? Object.keys(primarySpec.paths).length : 0}</Typography>
              <Typography sx={styles.valueRow}>Performance Score: {performanceScore.score}/100</Typography>
              <Typography sx={styles.valueRow}>Score Rating: {performanceScore.label}</Typography>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={styles.panel}>
            <Typography sx={styles.panelTitle}>Score Breakdown</Typography>
            <Stack spacing={1}>
              {performanceScore.breakdown.length ? (
                performanceScore.breakdown.map((item) => (
                  <Typography key={item.label} sx={styles.scoreRow}>
                    +{item.value} {item.label}
                  </Typography>
                ))
              ) : (
                <Typography sx={styles.emptyState}>
                  The score breakdown will appear once the spec is parsed.
                </Typography>
              )}
            </Stack>
          </Paper>

          <Paper elevation={0} sx={styles.panel}>
            <Typography sx={styles.panelTitle}>Authoring Suggestions</Typography>
            <Stack spacing={1}>
              {suggestions.length ? (
                suggestions.map((suggestion) => (
                  <Typography key={suggestion} sx={styles.suggestion}>
                    {suggestion}
                  </Typography>
                ))
              ) : (
                <Typography sx={styles.emptyState}>
                  No obvious suggestions. The spec has the basic required structure.
                </Typography>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Box>

      <Paper elevation={0} sx={styles.panel}>
        <Typography sx={styles.panelTitle}>UI Preview</Typography>
        <Box sx={styles.operationGrid}>
          {operations.length ? (
            operations.map((operation) => (
              <Box key={operation.id} sx={styles.operationCard}>
                <Box sx={styles.operationHeader}>
                  <Typography sx={styles.methodBadge}>{operation.method}</Typography>
                  <Typography sx={styles.operationPath}>{operation.path}</Typography>
                </Box>
                <Typography sx={styles.operationSummary}>{operation.summary}</Typography>
                <Typography sx={styles.operationTags}>
                  Tags: {operation.tags.length ? operation.tags.join(', ') : 'None'}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography sx={styles.emptyState}>
              Parsed operations will appear here once the spec is valid.
            </Typography>
          )}
        </Box>
      </Paper>

      <Box sx={styles.topGrid}>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Compare Against Another Spec</Typography>
          <TextField
            multiline
            minRows={14}
            value={compareSource}
            onChange={(event) => setCompareSource(event.target.value)}
            placeholder="Paste another OpenAPI spec to compare changes..."
            fullWidth
            InputProps={{ sx: styles.input }}
          />
        </Paper>

        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Spec Diff Viewer</Typography>
          {diffResult.error ? <Typography sx={styles.errorText}>{diffResult.error}</Typography> : null}
          <Stack spacing={1}>
            {diffResult.diffs.length ? (
              diffResult.diffs.map((diff) => (
                <Box key={diff.path} sx={styles.diffRow}>
                  <Typography sx={styles.diffPath}>{diff.path}</Typography>
                  <Typography sx={styles.diffReason}>{diff.reason}</Typography>
                  <Typography sx={styles.diffValue}>Left: {JSON.stringify(diff.left)}</Typography>
                  <Typography sx={styles.diffValue}>Right: {JSON.stringify(diff.right)}</Typography>
                </Box>
              ))
            ) : (
              <Typography sx={styles.emptyState}>
                {compareSource.trim()
                  ? 'No semantic differences found.'
                  : 'Paste a second spec to compare revisions.'}
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>
    </UtilityPageShell>
  );
}

const styles = {
  topGrid: {
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
  valueRow: {
    fontSize: 13,
    color: '#334155',
    wordBreak: 'break-word',
  },
  scoreRow: {
    px: 1.25,
    py: 1,
    borderRadius: 3,
    background: 'rgba(248, 250, 252, 0.86)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    fontSize: 12,
    color: '#334155',
    lineHeight: 1.6,
  },
  suggestion: {
    px: 1.25,
    py: 1,
    borderRadius: 3,
    background: 'rgba(248, 250, 252, 0.86)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    fontSize: 12,
    color: '#334155',
    lineHeight: 1.6,
  },
  operationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
    gap: 1.5,
  },
  operationCard: {
    p: 1.5,
    borderRadius: 3,
    background: 'rgba(248, 250, 252, 0.86)',
    border: '1px solid rgba(148, 163, 184, 0.16)',
  },
  operationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    flexWrap: 'wrap',
  },
  methodBadge: {
    px: 1,
    py: 0.35,
    borderRadius: 999,
    background: 'rgba(37, 99, 235, 0.12)',
    color: '#1d4ed8',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.05em',
  },
  operationPath: {
    fontSize: 13,
    fontWeight: 700,
    color: '#0f172a',
    fontFamily: '"SF Mono", "SFMono-Regular", Consolas, monospace',
  },
  operationSummary: {
    mt: 1,
    fontSize: 13,
    color: '#334155',
  },
  operationTags: {
    mt: 0.75,
    fontSize: 12,
    color: '#64748b',
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
  errorText: {
    mb: 1.25,
    fontSize: 13,
    color: '#b91c1c',
  },
};
