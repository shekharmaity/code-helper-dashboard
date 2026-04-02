import jsonlint from 'jsonlint-mod';
import { useMemo, useState } from 'react';
import { FiCode, FiCopy, FiEdit3, FiMinimize2, FiTrash2 } from 'react-icons/fi';
import StructuredDataTree from '../components/StructuredDataTree';

function getTextSize(value) {
  return new TextEncoder().encode(value).length;
}

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getActionButtonStyle(variant) {
  const buttonVariants = {
    primary: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: '#eff6ff',
      border: '1px solid rgba(37, 99, 235, 0.42)',
      boxShadow: '0 14px 28px rgba(37, 99, 235, 0.2)',
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

  return { ...stylesBase.actionButton, ...buttonVariants[variant] };
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [treeData, setTreeData] = useState();
  const [view, setView] = useState('editor');

  const parsedJson = () => jsonlint.parse(input);
  const lineCount = useMemo(() => (input ? input.split('\n').length : 0), [input]);
  const blockCount = useMemo(() => {
    if (!treeData || typeof treeData !== 'object') {
      return 0;
    }

    const countNodes = (value) => {
      if (!value || typeof value !== 'object') {
        return 0;
      }

      const children = Array.isArray(value) ? value : Object.values(value);
      return 1 + children.reduce((total, child) => total + countNodes(child), 0);
    };

    return countNodes(treeData);
  }, [treeData]);
  const inputSize = useMemo(() => formatSize(getTextSize(input)), [input]);

  const updateWorkspace = (nextInput, nextTreeData) => {
    setInput(nextInput);
    setTreeData(nextTreeData);
    setView('tree');
    setError('');
    setCopied(false);
  };

  const handleFormat = () => {
    try {
      const parsed = parsedJson();
      updateWorkspace(JSON.stringify(parsed, null, 2), parsed);
    } catch (err) {
      setError(err.message);
      setTreeData(undefined);
      setView('editor');
    }
  };

  const handleMinify = () => {
    try {
      const parsed = parsedJson();
      setInput(JSON.stringify(parsed));
      setTreeData(undefined);
      setView('editor');
      setError('');
      setCopied(false);
    } catch (err) {
      setError(err.message);
      setTreeData(undefined);
      setView('editor');
    }
  };

  const handleCopy = async () => {
    if (!input) {
      return;
    }

    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setError(`Unable to copy JSON: ${err.message}`);
    }
  };

  const handleClear = () => {
    setInput('');
    setError('');
    setCopied(false);
    setTreeData(undefined);
    setView('editor');
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroCopy}>
          <div style={styles.eyebrow}>Developer Utility</div>
          <h2 style={styles.title}>JSON Formatter</h2>
          <p style={styles.description}>
            Paste raw JSON, format or minify it, and review the result as a tree in the same
            workspace instead of a second output panel.
          </p>
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Workspace Size</span>
            <span style={styles.statValue}>{inputSize}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Visible Lines</span>
            <span style={styles.statValue}>{lineCount}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Tree Blocks</span>
            <span style={styles.statValue}>{blockCount}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Mode</span>
            <span style={styles.statValue}>{view === 'tree' ? 'Tree View' : 'Raw Input'}</span>
          </div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <button type="button" onClick={handleFormat} style={getActionButtonStyle('primary')}>
          <FiCode />
          Format
        </button>
        <button type="button" onClick={handleMinify} style={getActionButtonStyle('secondary')}>
          <FiMinimize2 />
          Minify
        </button>
        <button
          type="button"
          onClick={() => setView('editor')}
          disabled={!input}
          style={{
            ...getActionButtonStyle('secondary'),
            ...(input ? null : styles.disabledButton),
          }}
        >
          <FiEdit3 />
          Edit Raw
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!input}
          style={{
            ...getActionButtonStyle('secondary'),
            ...(input ? null : styles.disabledButton),
          }}
        >
          <FiCopy />
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button type="button" onClick={handleClear} style={getActionButtonStyle('muted')}>
          <FiTrash2 />
          Clear
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <div style={styles.panelTitle}>JSON Workspace</div>
            <div style={styles.panelSubtitle}>
              {view === 'tree'
                ? 'Formatted data is rendered as a collapsible tree in this same panel.'
                : 'Paste or edit raw JSON here, then format it when you are ready.'}
            </div>
          </div>
          <div style={styles.panelBadge}>{view === 'tree' ? 'Tree View' : 'Editor'}</div>
        </div>

        <div style={styles.workspace}>
          {view === 'tree' ? (
            <StructuredDataTree
              data={treeData}
              emptyTitle="Formatted JSON will appear here"
              emptyHint="Use Format to turn the current input into a tree view."
            />
          ) : (
            <textarea
              style={styles.textarea}
              placeholder="Paste JSON here..."
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setTreeData(undefined);
                setError('');
                setCopied(false);
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}

const stylesBase = {
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: '38px',
    padding: '0 14px',
    borderRadius: '10px',
    fontSize: '13px',
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
    padding: '4px 0 16px',
    minHeight: 'calc(100vh - 48px)',
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '14px',
    flexWrap: 'wrap',
    padding: '22px 24px',
    borderRadius: '18px',
    background:
      'radial-gradient(circle at top left, rgba(125, 211, 252, 0.26), transparent 34%), linear-gradient(135deg, #0f172a 0%, #14213d 48%, #2563eb 100%)',
    color: '#eff6ff',
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.22)',
  },
  heroCopy: {
    maxWidth: '640px',
  },
  eyebrow: {
    display: 'inline-flex',
    marginBottom: '8px',
    padding: '5px 9px',
    borderRadius: '999px',
    background: 'rgba(148, 163, 184, 0.16)',
    color: '#dbeafe',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
  },
  description: {
    margin: '10px 0 0',
    maxWidth: '58ch',
    color: 'rgba(219, 234, 254, 0.9)',
    fontSize: '14px',
    lineHeight: 1.6,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
    gap: '10px',
    width: '100%',
    alignSelf: 'flex-end',
    flex: '1 1 280px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '14px',
    borderRadius: '14px',
    background: 'rgba(15, 23, 42, 0.24)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    backdropFilter: 'blur(12px)',
  },
  statLabel: {
    color: 'rgba(191, 219, 254, 0.82)',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '700',
  },
  toolbar: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '14px',
    marginBottom: '14px',
  },
  disabledButton: {
    opacity: 0.55,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  error: {
    marginBottom: '18px',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(239, 68, 68, 0.14)',
    background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.95), rgba(254, 226, 226, 0.95))',
    color: '#b91c1c',
    fontWeight: '500',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '560px',
    padding: '16px',
    borderRadius: '16px',
    background: 'linear-gradient(180deg, #111827 0%, #0f172a 100%)',
    border: '1px solid rgba(30, 41, 59, 0.9)',
    boxShadow: '0 24px 52px rgba(15, 23, 42, 0.18)',
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '10px',
    marginBottom: '12px',
  },
  panelTitle: {
    color: '#f8fafc',
    fontSize: '16px',
    fontWeight: '700',
  },
  panelSubtitle: {
    marginTop: '4px',
    color: '#94a3b8',
    fontSize: '12px',
  },
  panelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(59, 130, 246, 0.12)',
    color: '#93c5fd',
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  workspace: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: '14px',
    border: '1px solid rgba(148, 163, 184, 0.14)',
    background: 'rgba(15, 23, 42, 0.34)',
  },
  textarea: {
    width: '100%',
    minHeight: '500px',
    height: '100%',
    border: 'none',
    outline: 'none',
    resize: 'vertical',
    padding: '16px',
    background: 'transparent',
    color: '#e2e8f0',
    fontSize: '13px',
    lineHeight: 1.7,
    fontFamily: '"SF Mono", "SFMono-Regular", Consolas, monospace',
  },
};
