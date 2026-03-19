import { useMemo, useState } from 'react';
import {
  FiCopy,
  FiHash,
  FiLayers,
  FiPlusCircle,
  FiRefreshCw,
  FiTrash2,
} from 'react-icons/fi';

function createUuid() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

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

export default function UuidGenerator() {
  const [uuids, setUuids] = useState(() => [createUuid()]);
  const [count, setCount] = useState(5);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const latestUuid = uuids[0] || '';
  const totalCharacters = useMemo(
    () => uuids.reduce((sum, value) => sum + value.length, 0),
    [uuids],
  );

  const updateUuids = (nextUuids) => {
    setUuids(nextUuids);
    setCopied(false);
    setError('');
  };

  const handleGenerateOne = () => {
    updateUuids([createUuid()]);
  };

  const handleGenerateBatch = () => {
    const safeCount = Math.min(Math.max(Number(count) || 1, 1), 100);
    updateUuids(Array.from({ length: safeCount }, createUuid));
    setCount(safeCount);
  };

  const handleCopy = async () => {
    if (!uuids.length) {
      return;
    }

    try {
      await navigator.clipboard.writeText(uuids.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setError(`Unable to copy UUIDs: ${err.message}`);
    }
  };

  const handleClear = () => {
    setUuids([]);
    setCopied(false);
    setError('');
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroCopy}>
          <div style={styles.eyebrow}>Developer Utility</div>
          <h2 style={styles.title}>UUID Generator</h2>
          <p style={styles.description}>
            Generate RFC 4122 version 4 UUIDs for mocks, test fixtures, and client-side debugging
            without leaving the dashboard.
          </p>
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>UUIDs Ready</span>
            <span style={styles.statValue}>{uuids.length}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Characters</span>
            <span style={styles.statValue}>{totalCharacters}</span>
          </div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <button type="button" onClick={handleGenerateOne} style={getActionButtonStyle('primary')}>
          <FiRefreshCw />
          Generate One
        </button>
        <button
          type="button"
          onClick={handleGenerateBatch}
          style={getActionButtonStyle('secondary')}
        >
          <FiPlusCircle />
          Generate Batch
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!uuids.length}
          style={{
            ...getActionButtonStyle('secondary'),
            ...(uuids.length ? null : styles.disabledButton),
          }}
        >
          <FiCopy />
          {copied ? 'Copied' : 'Copy All'}
        </button>
        <button type="button" onClick={handleClear} style={getActionButtonStyle('muted')}>
          <FiTrash2 />
          Clear
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.grid}>
        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.panelTitle}>Generation Controls</div>
              <div style={styles.panelSubtitle}>
                Create a single UUID or generate a controlled batch up to 100 values.
              </div>
            </div>
            <div style={styles.panelBadge}>
              <FiHash size={14} />
              v4
            </div>
          </div>

          <div style={styles.controlCard}>
            <label htmlFor="uuid-count" style={styles.inputLabel}>
              Batch size
            </label>
            <input
              id="uuid-count"
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(event) => setCount(event.target.value)}
              style={styles.numberInput}
            />
            <div style={styles.helperText}>Recommended for bulk copy into tests and fixtures.</div>
          </div>

          <div style={styles.highlightCard}>
            <div style={styles.highlightLabel}>Latest UUID</div>
            <div style={styles.highlightValue}>{latestUuid || 'Generate a UUID to start.'}</div>
          </div>
        </section>

        <section style={styles.outputPanel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.outputTitle}>Generated Output</div>
              <div style={styles.outputSubtitle}>
                UUIDs are listed one per line for direct copying into tooling.
              </div>
            </div>
            <div style={styles.outputBadge}>
              <FiLayers size={14} />
              Output
            </div>
          </div>

          <div style={styles.output}>
            {uuids.length ? (
              uuids.map((uuid, index) => (
                <div key={uuid} style={styles.uuidRow}>
                  <span style={styles.uuidIndex}>{String(index + 1).padStart(2, '0')}</span>
                  <span>{uuid}</span>
                </div>
              ))
            ) : (
              <div style={styles.placeholder}>
                <FiLayers size={18} />
                <div>
                  <div style={styles.placeholderTitle}>Generated UUIDs will appear here</div>
                  <div style={styles.placeholderText}>
                    Use Generate One for a single ID or Generate Batch for a larger set.
                  </div>
                </div>
              </div>
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
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '20px 0 28px',
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '18px',
    flexWrap: 'wrap',
    padding: '24px 26px',
    borderRadius: '24px',
    background:
      'radial-gradient(circle at top left, rgba(196, 181, 253, 0.28), transparent 34%), linear-gradient(135deg, #111827 0%, #2e1065 46%, #7c3aed 100%)',
    color: '#faf5ff',
    boxShadow: '0 24px 70px rgba(17, 24, 39, 0.22)',
  },
  heroCopy: {
    maxWidth: '640px',
  },
  eyebrow: {
    display: 'inline-flex',
    marginBottom: '10px',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(196, 181, 253, 0.16)',
    color: '#ede9fe',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontSize: '34px',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
  },
  description: {
    margin: '12px 0 0',
    maxWidth: '58ch',
    color: 'rgba(243, 232, 255, 0.92)',
    fontSize: '15px',
    lineHeight: 1.7,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    minWidth: '280px',
    alignSelf: 'flex-end',
    flex: '1 1 280px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '18px',
    borderRadius: '18px',
    background: 'rgba(17, 24, 39, 0.24)',
    border: '1px solid rgba(196, 181, 253, 0.18)',
    backdropFilter: 'blur(12px)',
  },
  statLabel: {
    color: 'rgba(221, 214, 254, 0.82)',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
  },
  toolbar: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginTop: '18px',
    marginBottom: '18px',
  },
  disabledButton: {
    opacity: 0.55,
    cursor: 'not-allowed',
    boxShadow: 'none',
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
    gridTemplateColumns: 'minmax(320px, 0.9fr) minmax(420px, 1.1fr)',
    gap: '18px',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minHeight: '560px',
    padding: '18px',
    borderRadius: '22px',
    background: '#ffffff',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    boxShadow: '0 22px 48px rgba(15, 23, 42, 0.08)',
  },
  outputPanel: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '560px',
    padding: '18px',
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
  },
  panelTitle: {
    color: '#0f172a',
    fontSize: '18px',
    fontWeight: '700',
  },
  panelSubtitle: {
    marginTop: '4px',
    color: '#64748b',
    fontSize: '13px',
  },
  panelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '999px',
    background: '#f5f3ff',
    color: '#6d28d9',
    fontSize: '12px',
    fontWeight: '700',
  },
  controlCard: {
    padding: '18px',
    borderRadius: '18px',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
  },
  inputLabel: {
    display: 'block',
    marginBottom: '10px',
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '600',
  },
  numberInput: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid rgba(148, 163, 184, 0.24)',
    fontSize: '15px',
    color: '#0f172a',
    boxSizing: 'border-box',
  },
  helperText: {
    marginTop: '10px',
    color: '#64748b',
    fontSize: '13px',
  },
  highlightCard: {
    padding: '18px',
    borderRadius: '18px',
    background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    border: '1px solid rgba(196, 181, 253, 0.28)',
  },
  highlightLabel: {
    marginBottom: '10px',
    color: '#6d28d9',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  highlightValue: {
    color: '#312e81',
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '14px',
    lineHeight: 1.7,
    wordBreak: 'break-all',
  },
  outputTitle: {
    color: '#f8fafc',
    fontSize: '18px',
    fontWeight: '700',
  },
  outputSubtitle: {
    marginTop: '4px',
    color: '#94a3b8',
    fontSize: '13px',
  },
  outputBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '999px',
    background: 'rgba(76, 29, 149, 0.4)',
    color: '#ede9fe',
    fontSize: '12px',
    fontWeight: '700',
  },
  output: {
    flex: 1,
    minHeight: '420px',
    marginTop: '14px',
    padding: '16px',
    borderRadius: '18px',
    background:
      'linear-gradient(180deg, rgba(15, 23, 42, 0.52) 0%, rgba(2, 6, 23, 0.82) 100%)',
    color: '#e2e8f0',
    overflowX: 'auto',
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '14px',
    lineHeight: 1.75,
    boxSizing: 'border-box',
  },
  uuidRow: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    padding: '8px 0',
    borderBottom: '1px solid rgba(51, 65, 85, 0.45)',
    wordBreak: 'break-all',
  },
  uuidIndex: {
    color: '#a78bfa',
    minWidth: '28px',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    color: '#94a3b8',
    minHeight: '100%',
  },
  placeholderTitle: {
    color: '#f8fafc',
    fontWeight: '600',
    marginBottom: '4px',
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: '13px',
  },
};
