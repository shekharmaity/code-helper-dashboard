import { useMemo, useState } from 'react';
import {
  FiClock,
  FiCopy,
  FiRefreshCw,
  FiTrash2,
  FiZap,
} from 'react-icons/fi';

const FIELD_DEFINITIONS = [
  { key: 'minute', label: 'Minute', min: 0, max: 59 },
  { key: 'hour', label: 'Hour', min: 0, max: 23 },
  { key: 'dayOfMonth', label: 'Day of Month', min: 1, max: 31 },
  { key: 'month', label: 'Month', min: 1, max: 12 },
  { key: 'dayOfWeek', label: 'Day of Week', min: 0, max: 6 },
];

const DEFAULT_EXPRESSION = '*/15 9-18 * * 1-5';

function getActionButtonStyle(variant) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
      color: '#faf5ff',
      border: '1px solid rgba(124, 58, 237, 0.42)',
      boxShadow: '0 14px 28px rgba(109, 40, 217, 0.24)',
    },
    secondary: {
      background: '#ffffff',
      color: '#0f172a',
      border: '1px solid rgba(148, 163, 184, 0.4)',
    },
    muted: {
      background: '#e2e8f0',
      color: '#334155',
      border: '1px solid rgba(148, 163, 184, 0.35)',
    },
  };

  return { ...stylesBase.actionButton, ...variants[variant] };
}

function expandPart(part, min, max) {
  const values = new Set();
  const segments = part.split(',');

  segments.forEach((segment) => {
    const trimmed = segment.trim();

    if (!trimmed) {
      throw new Error(`Invalid segment "${segment}"`);
    }

    const [base, stepRaw] = trimmed.split('/');
    const step = stepRaw ? Number(stepRaw) : 1;

    if (!Number.isInteger(step) || step <= 0) {
      throw new Error(`Invalid step "${trimmed}"`);
    }

    let start = min;
    let end = max;

    if (base !== '*') {
      if (base.includes('-')) {
        const [startRaw, endRaw] = base.split('-').map(Number);
        if (
          !Number.isInteger(startRaw) ||
          !Number.isInteger(endRaw) ||
          startRaw < min ||
          endRaw > max ||
          startRaw > endRaw
        ) {
          throw new Error(`Invalid range "${trimmed}"`);
        }

        start = startRaw;
        end = endRaw;
      } else {
        const value = Number(base);
        if (!Number.isInteger(value) || value < min || value > max) {
          throw new Error(`Invalid value "${trimmed}"`);
        }

        start = value;
        end = value;
      }
    }

    for (let current = start; current <= end; current += step) {
      values.add(current);
    }
  });

  return [...values].sort((a, b) => a - b);
}

function parseCron(expression) {
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 5) {
    throw new Error('Cron expression must contain exactly 5 fields.');
  }

  const expanded = FIELD_DEFINITIONS.map((field, index) => ({
    ...field,
    raw: parts[index],
    values: expandPart(parts[index], field.min, field.max),
  }));

  return expanded;
}

function describeField(raw, label) {
  if (raw === '*') {
    return `${label}: every value`;
  }

  if (raw.includes('/')) {
    return `${label}: recurring pattern ${raw}`;
  }

  if (raw.includes(',')) {
    return `${label}: selected values ${raw}`;
  }

  if (raw.includes('-')) {
    return `${label}: range ${raw}`;
  }

  return `${label}: ${raw}`;
}

function matchesDate(parsed, date) {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;
  const dayOfWeek = date.getDay();

  return parsed.every((field) => {
    const valueMap = {
      minute,
      hour,
      dayOfMonth,
      month,
      dayOfWeek,
    };

    return field.values.includes(valueMap[field.key]);
  });
}

function getNextRuns(parsed, count = 5) {
  const results = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  let attempts = 0;
  const maxAttempts = 525600;

  while (results.length < count && attempts < maxAttempts) {
    if (matchesDate(parsed, cursor)) {
      results.push(new Date(cursor));
    }

    cursor.setMinutes(cursor.getMinutes() + 1);
    attempts += 1;
  }

  return results;
}

function formatRun(date) {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function CronExpression() {
  const [expression, setExpression] = useState(DEFAULT_EXPRESSION);
  const [copied, setCopied] = useState(false);

  const { parsed, error } = useMemo(() => {
    try {
      return { parsed: parseCron(expression), error: '' };
    } catch (err) {
      return { parsed: null, error: err.message };
    }
  }, [expression]);

  const nextRuns = useMemo(() => (parsed ? getNextRuns(parsed, 6) : []), [parsed]);
  const descriptions = useMemo(
    () => (parsed ? parsed.map((field) => describeField(field.raw, field.label)) : []),
    [parsed],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(expression);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setExpression(DEFAULT_EXPRESSION);
    setCopied(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroCopy}>
          <div style={styles.eyebrow}>Developer Utility</div>
          <h2 style={styles.title}>Cron Expression</h2>
          <p style={styles.description}>
            Validate a cron schedule, inspect each field, and preview upcoming execution times from
            a single utility page.
          </p>
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Fields</span>
            <span style={styles.statValue}>5</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Next Runs</span>
            <span style={styles.statValue}>{nextRuns.length}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Status</span>
            <span style={styles.statValue}>{error ? 'Error' : 'Valid'}</span>
          </div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <button type="button" onClick={handleCopy} style={getActionButtonStyle('primary')}>
          <FiCopy />
          {copied ? 'Copied' : 'Copy Cron'}
        </button>
        <button type="button" onClick={handleReset} style={getActionButtonStyle('secondary')}>
          <FiRefreshCw />
          Reset
        </button>
        <button type="button" onClick={() => setExpression('')} style={getActionButtonStyle('muted')}>
          <FiTrash2 />
          Clear
        </button>
      </div>

      {error && <div style={styles.error}>Invalid cron: {error}</div>}

      <div style={styles.grid}>
        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.panelTitle}>Cron Input</div>
              <div style={styles.panelSubtitle}>Use the standard 5-field cron format.</div>
            </div>
            <div style={styles.panelBadge}>
              <FiZap size={14} />
              Schedule
            </div>
          </div>

          <label style={styles.label}>Expression</label>
          <input
            type="text"
            value={expression}
            onChange={(event) => setExpression(event.target.value)}
            style={styles.input}
            placeholder="*/15 9-18 * * 1-5"
          />

          <div style={styles.helper}>
            Format: `minute hour day-of-month month day-of-week`
          </div>

          <div style={styles.fieldsCard}>
            <div style={styles.fieldsTitle}>Field Breakdown</div>
            {descriptions.length ? (
              descriptions.map((item) => (
                <div key={item} style={styles.fieldRow}>
                  {item}
                </div>
              ))
            ) : (
              <div style={styles.emptyText}>Enter a valid cron expression to inspect each field.</div>
            )}
          </div>
        </section>

        <section style={styles.outputPanel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.outputTitle}>Next Execution Times</div>
              <div style={styles.outputSubtitle}>Preview upcoming schedule matches from now.</div>
            </div>
            <div style={styles.outputBadge}>
              <FiClock size={14} />
              Preview
            </div>
          </div>

          <div style={styles.output}>
            {nextRuns.length ? (
              nextRuns.map((run) => (
                <div key={run.toISOString()} style={styles.runRow}>
                  {formatRun(run)}
                </div>
              ))
            ) : (
              <div style={styles.emptyOutput}>No preview available yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const stylesBase = {
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    minHeight: '44px',
    padding: '0 16px',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 160ms ease, box-shadow 160ms ease, background 160ms ease',
  },
};

const styles = {
  page: {
    width: '100%',
    maxWidth: 'none',
    margin: 0,
    padding: '6px 0 20px',
    minHeight: 'calc(100vh - 48px)',
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '18px',
    flexWrap: 'wrap',
    padding: '28px 30px',
    borderRadius: '24px',
    background:
      'radial-gradient(circle at top left, rgba(192, 132, 252, 0.22), transparent 34%), linear-gradient(135deg, #111827 0%, #312e81 50%, #7c3aed 100%)',
    color: '#f5f3ff',
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.24)',
  },
  heroCopy: { maxWidth: '640px' },
  eyebrow: {
    display: 'inline-flex',
    marginBottom: '10px',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(196, 181, 253, 0.16)',
    color: '#ddd6fe',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  title: { margin: 0, fontSize: '34px', lineHeight: 1.1, letterSpacing: '-0.03em' },
  description: {
    margin: '12px 0 0',
    maxWidth: '58ch',
    color: 'rgba(237, 233, 254, 0.9)',
    fontSize: '15px',
    lineHeight: 1.7,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    minWidth: '320px',
    alignSelf: 'flex-end',
    flex: '1 1 320px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '18px',
    borderRadius: '18px',
    background: 'rgba(15, 23, 42, 0.24)',
    border: '1px solid rgba(196, 181, 253, 0.16)',
    backdropFilter: 'blur(12px)',
  },
  statLabel: {
    color: 'rgba(221, 214, 254, 0.84)',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  statValue: { fontSize: '28px', fontWeight: '700' },
  toolbar: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '18px',
    marginBottom: '18px',
  },
  error: {
    marginBottom: '18px',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid rgba(239, 68, 68, 0.14)',
    background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.95), rgba(254, 226, 226, 0.95))',
    color: '#b91c1c',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '18px',
    alignItems: 'stretch',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 340px)',
    padding: '20px',
    borderRadius: '22px',
    background: '#ffffff',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    boxShadow: '0 22px 48px rgba(15, 23, 42, 0.08)',
  },
  outputPanel: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 340px)',
    padding: '20px',
    borderRadius: '22px',
    background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
    border: '1px solid rgba(30, 41, 59, 0.9)',
    boxShadow: '0 24px 52px rgba(15, 23, 42, 0.18)',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '14px',
  },
  panelTitle: { color: '#0f172a', fontSize: '18px', fontWeight: '700' },
  panelSubtitle: { marginTop: '4px', color: '#64748b', fontSize: '13px' },
  panelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '999px',
    background: '#f5f3ff',
    color: '#5b21b6',
    fontSize: '12px',
    fontWeight: '700',
  },
  label: {
    marginTop: '8px',
    marginBottom: '8px',
    color: '#0f172a',
    fontSize: '13px',
    fontWeight: '700',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid rgba(148, 163, 184, 0.26)',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    color: '#0f172a',
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  helper: {
    marginTop: '12px',
    color: '#64748b',
    fontSize: '13px',
  },
  fieldsCard: {
    marginTop: '18px',
    padding: '16px',
    borderRadius: '18px',
    background: '#f8fafc',
    border: '1px solid rgba(148, 163, 184, 0.18)',
  },
  fieldsTitle: {
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '10px',
  },
  fieldRow: {
    padding: '10px 0',
    borderBottom: '1px solid rgba(226, 232, 240, 1)',
    color: '#334155',
    fontSize: '13px',
  },
  outputTitle: { color: '#f8fafc', fontSize: '18px', fontWeight: '700' },
  outputSubtitle: { marginTop: '4px', color: '#94a3b8', fontSize: '13px' },
  outputBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '999px',
    background: 'rgba(91, 33, 182, 0.3)',
    color: '#ddd6fe',
    fontSize: '12px',
    fontWeight: '700',
  },
  output: {
    flex: 1,
    minHeight: '100%',
    padding: '16px',
    borderRadius: '18px',
    background:
      'linear-gradient(180deg, rgba(15, 23, 42, 0.52) 0%, rgba(2, 6, 23, 0.82) 100%)',
    color: '#e2e8f0',
    overflowX: 'auto',
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '14px',
    lineHeight: 1.65,
    boxSizing: 'border-box',
  },
  runRow: {
    padding: '12px 14px',
    borderRadius: '12px',
    background: 'rgba(124, 58, 237, 0.12)',
    color: '#ede9fe',
    marginBottom: '10px',
  },
  emptyText: { color: '#64748b', fontSize: '13px' },
  emptyOutput: { color: '#94a3b8', fontSize: '13px' },
};
