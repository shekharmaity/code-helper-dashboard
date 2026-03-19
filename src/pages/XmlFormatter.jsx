import { useMemo, useState } from 'react';
import {
  FiChevronDown,
  FiChevronRight,
  FiCode,
  FiCopy,
  FiFileText,
  FiLayers,
  FiMinimize2,
  FiTrash2,
} from 'react-icons/fi';
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
  const variants = {
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

  return { ...stylesBase.actionButton, ...variants[variant] };
}

export default function XmlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(EMPTY_COLLAPSED_STATE);

  const lines = useMemo(() => (output ? output.split('\n') : []), [output]);
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

  const lineCount = lines.length;
  const nodeCount = useMemo(
    () => lines.filter((line) => isCollapsibleOpeningTag(line.trim())).length,
    [lines],
  );
  const inputSize = useMemo(() => formatSize(getTextSize(input)), [input]);
  const outputSize = useMemo(() => formatSize(getTextSize(output)), [output]);

  const updateOutput = (nextOutput) => {
    setOutput(nextOutput);
    setError('');
    setCopied(false);
    setCollapsed(EMPTY_COLLAPSED_STATE);
  };

  const handleFormat = () => {
    try {
      updateOutput(formatXml(input, FORMAT_OPTIONS));
    } catch (err) {
      setError(`Invalid XML: ${err.message}`);
      setOutput('');
      setCollapsed(EMPTY_COLLAPSED_STATE);
    }
  };

  const handleMinify = () => {
    try {
      const formatted = formatXml(input, FORMAT_OPTIONS);
      updateOutput(formatted.replace(/>\s+</g, '><').trim());
    } catch (err) {
      setError(`Invalid XML: ${err.message}`);
      setOutput('');
      setCollapsed(EMPTY_COLLAPSED_STATE);
    }
  };

  const handleCopy = async () => {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setError(`Unable to copy XML: ${err.message}`);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setCopied(false);
    setCollapsed(EMPTY_COLLAPSED_STATE);
  };

  const toggleCollapse = (index) => {
    setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const renderXml = () => {
    if (!lines.length) {
      return (
        <div style={styles.placeholder}>
          <FiLayers size={18} />
          <div>
            <div style={styles.placeholderTitle}>Formatted XML will appear here</div>
            <div style={styles.placeholderText}>
              Use Format for readable structure or Minify for compact transport output.
            </div>
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
                {collapsed[index] ? <FiChevronRight /> : <FiChevronDown />}
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
            Clean up payloads, inspect nested nodes, and switch between readable and transport-ready
            XML without leaving the dashboard.
          </p>
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Input Size</span>
            <span style={styles.statValue}>{inputSize}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Output Size</span>
            <span style={styles.statValue}>{outputSize}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Output Lines</span>
            <span style={styles.statValue}>{lineCount}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Collapsible Nodes</span>
            <span style={styles.statValue}>{nodeCount}</span>
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
          onClick={handleCopy}
          disabled={!output}
          style={{
            ...getActionButtonStyle('secondary'),
            ...(output ? null : styles.disabledButton),
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

      <div style={styles.grid}>
        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.panelTitle}>Input XML</div>
              <div style={styles.panelSubtitle}>Paste a raw payload or service response.</div>
            </div>
            <div style={styles.panelBadge}>
              <FiFileText size={14} />
              Source
            </div>
          </div>

          <textarea
            style={styles.textarea}
            placeholder="Paste XML here..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </section>

        <section style={styles.outputPanel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.outputTitle}>Formatted Output</div>
              <div style={styles.outputSubtitle}>Expand and collapse nested nodes inline.</div>
            </div>
            <div style={styles.outputBadge}>
              <FiLayers size={14} />
              Inspector
            </div>
          </div>

          <div style={styles.output}>{renderXml()}</div>
        </section>
      </div>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
    gap: '14px',
    alignItems: 'stretch',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '340px',
    padding: '16px',
    borderRadius: '16px',
    background: '#ffffff',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    boxShadow: '0 22px 48px rgba(15, 23, 42, 0.08)',
  },
  outputPanel: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '340px',
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
    color: '#0f172a',
    fontSize: '16px',
    fontWeight: '700',
  },
  panelSubtitle: {
    marginTop: '4px',
    color: '#64748b',
    fontSize: '12px',
  },
  panelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 8px',
    borderRadius: '999px',
    background: '#f1f5f9',
    color: '#0f172a',
    fontSize: '11px',
    fontWeight: '700',
  },
  outputTitle: {
    color: '#f8fafc',
    fontSize: '16px',
    fontWeight: '700',
  },
  outputSubtitle: {
    marginTop: '4px',
    color: '#94a3b8',
    fontSize: '12px',
  },
  outputBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 8px',
    borderRadius: '999px',
    background: 'rgba(51, 65, 85, 0.62)',
    color: '#e2e8f0',
    fontSize: '11px',
    fontWeight: '700',
  },
  textarea: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid rgba(148, 163, 184, 0.26)',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    color: '#0f172a',
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '13px',
    lineHeight: 1.55,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  },
  output: {
    flex: 1,
    minHeight: '100%',
    padding: '14px',
    borderRadius: '14px',
    background:
      'linear-gradient(180deg, rgba(15, 23, 42, 0.52) 0%, rgba(2, 6, 23, 0.82) 100%)',
    color: '#e2e8f0',
    overflowX: 'auto',
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '13px',
    lineHeight: 1.55,
    boxSizing: 'border-box',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
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
    fontSize: '12px',
  },
  line: {
    display: 'flex',
    alignItems: 'flex-start',
    minHeight: '22px',
    whiteSpace: 'pre-wrap',
  },
  toggle: {
    width: '24px',
    marginLeft: '-24px',
    display: 'inline-flex',
    justifyContent: 'center',
    flexShrink: 0,
  },
  toggleButton: {
    border: 'none',
    background: 'transparent',
    color: '#5eead4',
    cursor: 'pointer',
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
  },
};
