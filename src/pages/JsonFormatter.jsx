import jsonlint from 'jsonlint-mod';
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

function isCollapsibleOpeningLine(line) {
  const trimmed = line.trim();
  return trimmed.endsWith('{') || trimmed.endsWith('[');
}

function isClosingLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('}') || trimmed.startsWith(']');
}

function buildJsonRanges(lines) {
  const stack = [];
  const ranges = {};

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const indent = getIndentLevel(line);

    if (isCollapsibleOpeningLine(line)) {
      stack.push({ index, indent, type: trimmed.at(-1) });
      return;
    }

    if (!isClosingLine(line)) {
      return;
    }

    const closingType = trimmed[0] === '}' ? '{' : '[';

    for (let stackIndex = stack.length - 1; stackIndex >= 0; stackIndex -= 1) {
      const item = stack[stackIndex];

      if (item.indent === indent && item.type === closingType) {
        ranges[item.index] = index;
        stack.splice(stackIndex, 1);
        break;
      }
    }
  });

  return ranges;
}

function getCollapsedPreview(line) {
  const trimmed = line.trim();

  if (trimmed.endsWith('{')) {
    return `${trimmed.slice(0, -1).trimEnd()} { ... }`;
  }

  if (trimmed.endsWith('[')) {
    return `${trimmed.slice(0, -1).trimEnd()} [ ... ]`;
  }

  return trimmed;
}

function getActionButtonStyle(variant) {
  const styles = {
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

  return { ...stylesBase.actionButton, ...styles[variant] };
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(EMPTY_COLLAPSED_STATE);

  const lines = useMemo(() => (output ? output.split('\n') : []), [output]);
  const ranges = useMemo(() => buildJsonRanges(lines), [lines]);

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
  const blockCount = useMemo(
    () => lines.filter((line) => isCollapsibleOpeningLine(line.trim())).length,
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

  const parseJson = () => jsonlint.parse(input);

  const handleFormat = () => {
    try {
      updateOutput(JSON.stringify(parseJson(), null, 2));
    } catch (err) {
      setError(err.message);
      setOutput('');
      setCollapsed(EMPTY_COLLAPSED_STATE);
    }
  };

  const handleMinify = () => {
    try {
      updateOutput(JSON.stringify(parseJson()));
    } catch (err) {
      setError(err.message);
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
      setError(`Unable to copy JSON: ${err.message}`);
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

  const renderJson = () => {
    if (!lines.length) {
      return (
        <div style={styles.placeholder}>
          <FiLayers size={18} />
          <div>
            <div style={styles.placeholderTitle}>Formatted JSON will appear here</div>
            <div style={styles.placeholderText}>
              Use Format for readable inspection or Minify for compact payload output.
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
                aria-label={collapsed[index] ? 'Expand JSON node' : 'Collapse JSON node'}
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
          <h2 style={styles.title}>JSON Formatter</h2>
          <p style={styles.description}>
            Validate, format, and inspect API payloads with a cleaner workspace built for quick
            debugging and nested object review.
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
            <span style={styles.statLabel}>Collapsible Blocks</span>
            <span style={styles.statValue}>{blockCount}</span>
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
              <div style={styles.panelTitle}>Input JSON</div>
              <div style={styles.panelSubtitle}>Paste a raw request body or API response.</div>
            </div>
            <div style={styles.panelBadge}>
              <FiFileText size={14} />
              Source
            </div>
          </div>

          <textarea
            style={styles.textarea}
            placeholder="Paste JSON here..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
        </section>

        <section style={styles.outputPanel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.outputTitle}>Formatted Output</div>
              <div style={styles.outputSubtitle}>Expand and collapse nested structures inline.</div>
            </div>
            <div style={styles.outputBadge}>
              <FiLayers size={14} />
              Inspector
            </div>
          </div>

          <div style={styles.output}>{renderJson()}</div>
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
    background: '#eff6ff',
    color: '#1e3a8a',
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
  line: {
    display: 'flex',
    alignItems: 'flex-start',
    minHeight: '24px',
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
    color: '#93c5fd',
    cursor: 'pointer',
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
  },
};
