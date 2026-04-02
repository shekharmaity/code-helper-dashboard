import { useMemo, useState } from 'react';
import { FiChevronDown, FiChevronRight, FiCode, FiCopy, FiEdit3, FiMinimize2, FiTrash2 } from 'react-icons/fi';
import formatXml from 'xml-formatter';

const FORMAT_OPTIONS = {
  indentation: '  ',
  collapseContent: true,
};

const EMPTY_COLLAPSED_STATE = {};

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

function getIndentLevel(line) {
  const firstNonSpaceIndex = line.search(/\S/);
  return firstNonSpaceIndex === -1 ? 0 : firstNonSpaceIndex;
}

function isClosingTag(line) {
  return /^<\/.+>$/.test(line);
}

function isCollapsibleOpeningTag(line) {
  if (!line.startsWith('<') || line.startsWith('</') || line.startsWith('<?') || line.startsWith('<!')) {
    return false;
  }

  if (line.endsWith('/>')) {
    return false;
  }

  return !line.includes('</');
}

function buildXmlRanges(lines) {
  const stack = [];
  const ranges = {};

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const indent = getIndentLevel(line);

    if (isCollapsibleOpeningTag(trimmed)) {
      stack.push({ index, indent });
      return;
    }

    if (!isClosingTag(trimmed)) {
      return;
    }

    for (let stackIndex = stack.length - 1; stackIndex >= 0; stackIndex -= 1) {
      if (stack[stackIndex].indent === indent) {
        const start = stack[stackIndex];
        ranges[start.index] = index;
        stack.splice(stackIndex, 1);
        break;
      }
    }
  });

  return ranges;
}

function getCollapsedPreview(line) {
  const match = line.trim().match(/^<([^\s/>]+)/);

  if (!match) {
    return '<...>';
  }

  return `<${match[1]}>...</${match[1]}>`;
}

function getActionButtonStyle(variant) {
  const buttonVariants = {
    primary: {
      background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
      color: '#f8fafc',
      border: '1px solid rgba(15, 118, 110, 0.4)',
      boxShadow: '0 14px 28px rgba(15, 118, 110, 0.22)',
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

export default function XmlFormatter() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [formattedValue, setFormattedValue] = useState('');
  const [collapsed, setCollapsed] = useState(EMPTY_COLLAPSED_STATE);
  const [view, setView] = useState('editor');

  const lines = useMemo(() => (formattedValue ? formattedValue.split('\n') : []), [formattedValue]);
  const ranges = useMemo(() => buildXmlRanges(lines), [lines]);

  const hiddenLines = useMemo(() => {
    const indexes = new Set();

    Object.entries(collapsed).forEach(([rawIndex, isCollapsed]) => {
      if (!isCollapsed) {
        return;
      }

      const index = Number(rawIndex);
      const endIndex = ranges[index];

      if (endIndex === undefined) {
        return;
      }

      for (let lineIndex = index + 1; lineIndex <= endIndex; lineIndex += 1) {
        indexes.add(lineIndex);
      }
    });

    return indexes;
  }, [collapsed, ranges]);

  const nodeCount = useMemo(
    () => lines.filter((line) => isCollapsibleOpeningTag(line.trim())).length,
    [lines],
  );
  const lineCount = lines.length || (input ? input.split('\n').length : 0);
  const inputSize = useMemo(() => formatSize(getTextSize(input)), [input]);

  const updateWorkspace = (nextInput, nextFormattedValue) => {
    setInput(nextInput);
    setFormattedValue(nextFormattedValue);
    setView('tree');
    setError('');
    setCopied(false);
    setCollapsed(EMPTY_COLLAPSED_STATE);
  };

  const handleFormat = () => {
    try {
      const formatted = formatXml(input, FORMAT_OPTIONS);
      updateWorkspace(formatted, formatted);
    } catch (err) {
      setError(`Invalid XML: ${err.message}`);
      setFormattedValue('');
      setCollapsed(EMPTY_COLLAPSED_STATE);
      setView('editor');
    }
  };

  const handleMinify = () => {
    try {
      const formatted = formatXml(input, FORMAT_OPTIONS);
      const minified = formatted.replace(/>\s+</g, '><').trim();
      setInput(minified);
      setFormattedValue('');
      setView('editor');
      setError('');
      setCopied(false);
      setCollapsed(EMPTY_COLLAPSED_STATE);
    } catch (err) {
      setError(`Invalid XML: ${err.message}`);
      setFormattedValue('');
      setCollapsed(EMPTY_COLLAPSED_STATE);
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
      setError(`Unable to copy XML: ${err.message}`);
    }
  };

  const handleClear = () => {
    setInput('');
    setFormattedValue('');
    setError('');
    setCopied(false);
    setCollapsed(EMPTY_COLLAPSED_STATE);
    setView('editor');
  };

  const toggleCollapse = (index) => {
    setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const renderXmlTree = () => {
    if (!lines.length) {
      return (
        <div style={styles.placeholder}>
          <div style={styles.placeholderTitle}>Formatted XML will appear here</div>
          <div style={styles.placeholderText}>
            Use Format to render the current XML as a collapsible tree in this panel.
          </div>
        </div>
      );
    }

    return lines.map((line, index) => {
      if (hiddenLines.has(index)) {
        return null;
      }

      const trimmed = line.trim();
      const hasChildren = ranges[index] !== undefined;
      const indentLevel = getIndentLevel(line);

      return (
        <div key={index} style={{ ...styles.line, paddingLeft: `${indentLevel + 14}px` }}>
          <span style={styles.toggle}>
            {hasChildren ? (
              <button
                type="button"
                style={styles.toggleButton}
                onClick={() => toggleCollapse(index)}
                aria-label={collapsed[index] ? 'Expand XML node' : 'Collapse XML node'}
              >
                {collapsed[index] ? <FiChevronRight size={14} /> : <FiChevronDown size={14} />}
              </button>
            ) : null}
          </span>
          <span>{collapsed[index] ? getCollapsedPreview(trimmed) : trimmed}</span>
        </div>
      );
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroCopy}>
          <div style={styles.eyebrow}>Developer Utility</div>
          <h2 style={styles.title}>XML Formatter</h2>
          <p style={styles.description}>
            Format or minify XML, then inspect it as a collapsible tree in the same workspace area
            without a separate output box.
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
            <span style={styles.statLabel}>Tree Nodes</span>
            <span style={styles.statValue}>{nodeCount}</span>
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
            <div style={styles.panelTitle}>XML Workspace</div>
            <div style={styles.panelSubtitle}>
              {view === 'tree'
                ? 'Formatted XML is rendered as a collapsible tree right here.'
                : 'Paste or edit raw XML here, then format it when you are ready.'}
            </div>
          </div>
          <div style={styles.panelBadge}>{view === 'tree' ? 'Tree View' : 'Editor'}</div>
        </div>

        <div style={styles.workspace}>
          {view === 'tree' ? (
            <div style={styles.treeViewport}>{renderXmlTree()}</div>
          ) : (
            <textarea
              style={styles.textarea}
              placeholder="Paste XML here..."
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setFormattedValue('');
                setError('');
                setCopied(false);
                setCollapsed(EMPTY_COLLAPSED_STATE);
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
      'radial-gradient(circle at top left, rgba(94, 234, 212, 0.24), transparent 36%), linear-gradient(135deg, #0f172a 0%, #11223a 52%, #0f766e 100%)',
    color: '#f8fafc',
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.24)',
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
    color: '#ccfbf1',
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
    color: 'rgba(226, 232, 240, 0.88)',
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
    background: 'rgba(20, 184, 166, 0.12)',
    color: '#99f6e4',
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
  treeViewport: {
    height: '100%',
    minHeight: '500px',
    overflow: 'auto',
    padding: '14px 0',
    color: '#dbeafe',
    fontSize: '13px',
    lineHeight: 1.7,
    fontFamily: '"SF Mono", "SFMono-Regular", Consolas, monospace',
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
  line: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '4px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    paddingRight: '14px',
  },
  toggle: {
    display: 'inline-flex',
    width: '18px',
    justifyContent: 'center',
    flexShrink: 0,
  },
  toggleButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    padding: 0,
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    color: '#5eead4',
    cursor: 'pointer',
  },
  placeholder: {
    display: 'flex',
    minHeight: '500px',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    textAlign: 'center',
  },
  placeholderTitle: {
    color: '#f8fafc',
    fontSize: '14px',
    fontWeight: '700',
  },
  placeholderText: {
    marginTop: '6px',
    color: '#94a3b8',
    fontSize: '13px',
    maxWidth: '38ch',
    lineHeight: 1.6,
  },
};
