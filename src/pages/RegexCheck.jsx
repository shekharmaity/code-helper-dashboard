import { useMemo, useState } from 'react';
import {
  FiCheckCircle,
  FiCopy,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiType,
} from 'react-icons/fi';

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildHighlightedHtml(input, regex) {
  if (!input) {
    return '';
  }

  const matches = Array.from(input.matchAll(regex));

  if (!matches.length) {
    return escapeHtml(input).replaceAll('\n', '<br />');
  }

  let cursor = 0;
  let html = '';

  matches.forEach((match) => {
    const start = match.index ?? 0;
    const end = start + match[0].length;

    html += escapeHtml(input.slice(cursor, start));
    html += `<mark>${escapeHtml(match[0] || '')}</mark>`;
    cursor = end;
  });

  html += escapeHtml(input.slice(cursor));
  return html.replaceAll('\n', '<br />');
}

function getActionButtonStyle(variant) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #047857 0%, #0f766e 100%)',
      color: '#ecfeff',
      border: '1px solid rgba(4, 120, 87, 0.42)',
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

export default function RegexCheck() {
  const [pattern, setPattern] = useState('\\b\\w{4}\\b');
  const [flags, setFlags] = useState('gi');
  const [input, setInput] = useState(
    'This regex tester finds four-letter words and highlights each match in the text block.',
  );
  const [copied, setCopied] = useState(false);

  const { regex, matches, error } = useMemo(() => {
    try {
      const compiledRegex = new RegExp(pattern, flags);
      const safeRegex = compiledRegex.global
        ? compiledRegex
        : new RegExp(compiledRegex.source, `${compiledRegex.flags}g`);
      const nextMatches = Array.from(input.matchAll(safeRegex));

      return {
        regex: safeRegex,
        matches: nextMatches,
        error: '',
      };
    } catch (err) {
      return {
        regex: null,
        matches: [],
        error: err.message,
      };
    }
  }, [pattern, flags, input]);

  const highlightedOutput = useMemo(
    () => (regex ? buildHighlightedHtml(input, regex) : escapeHtml(input).replaceAll('\n', '<br />')),
    [input, regex],
  );

  const handleCopyPattern = async () => {
    try {
      await navigator.clipboard.writeText(`/${pattern}/${flags}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setPattern('\\b\\w{4}\\b');
    setFlags('gi');
    setInput('This regex tester finds four-letter words and highlights each match in the text block.');
    setCopied(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroCopy}>
          <div style={styles.eyebrow}>Developer Utility</div>
          <h2 style={styles.title}>Regex Check</h2>
          <p style={styles.description}>
            Test regular expressions live, inspect matches, and verify flags against sample text
            without leaving the dashboard.
          </p>
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Matches</span>
            <span style={styles.statValue}>{matches.length}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Flags</span>
            <span style={styles.statValue}>{flags || '-'}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Status</span>
            <span style={styles.statValue}>{error ? 'Error' : 'Valid'}</span>
          </div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <button type="button" onClick={handleCopyPattern} style={getActionButtonStyle('primary')}>
          <FiCopy />
          {copied ? 'Copied' : 'Copy Regex'}
        </button>
        <button type="button" onClick={handleReset} style={getActionButtonStyle('secondary')}>
          <FiRefreshCw />
          Reset
        </button>
        <button type="button" onClick={() => setInput('')} style={getActionButtonStyle('muted')}>
          <FiTrash2 />
          Clear Text
        </button>
      </div>

      {error && <div style={styles.error}>Invalid regex: {error}</div>}

      <div style={styles.grid}>
        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.panelTitle}>Pattern Setup</div>
              <div style={styles.panelSubtitle}>Enter the regex source and flags separately.</div>
            </div>
            <div style={styles.panelBadge}>
              <FiSearch size={14} />
              Regex
            </div>
          </div>

          <label style={styles.label}>Pattern</label>
          <input
            type="text"
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            style={styles.input}
            placeholder="\\d+"
          />

          <label style={styles.label}>Flags</label>
          <input
            type="text"
            value={flags}
            onChange={(event) => setFlags(event.target.value)}
            style={styles.input}
            placeholder="gi"
          />

          <label style={styles.label}>Test Text</label>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            style={styles.textarea}
            placeholder="Paste sample text here..."
          />
        </section>

        <section style={styles.outputPanel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.outputTitle}>Match Preview</div>
              <div style={styles.outputSubtitle}>Matched segments are highlighted inline.</div>
            </div>
            <div style={styles.outputBadge}>
              <FiCheckCircle size={14} />
              Live
            </div>
          </div>

          <div
            style={styles.preview}
            dangerouslySetInnerHTML={{ __html: highlightedOutput || '<span>Nothing to preview yet.</span>' }}
          />

          <div style={styles.matchesCard}>
            <div style={styles.matchesTitle}>Matched Values</div>
            <div style={styles.matchesList}>
              {matches.length ? (
                matches.map((match, index) => (
                  <div key={`${match.index}-${index}`} style={styles.matchRow}>
                    <span style={styles.matchIndex}>#{index + 1}</span>
                    <span>{match[0]}</span>
                  </div>
                ))
              ) : (
                <div style={styles.emptyMatches}>
                  <FiType size={16} />
                  No matches found
                </div>
              )}
            </div>
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
      'radial-gradient(circle at top left, rgba(110, 231, 183, 0.18), transparent 34%), linear-gradient(135deg, #0f172a 0%, #14532d 50%, #047857 100%)',
    color: '#f0fdf4',
    boxShadow: '0 24px 70px rgba(15, 23, 42, 0.24)',
  },
  heroCopy: {
    maxWidth: '640px',
  },
  eyebrow: {
    display: 'inline-flex',
    marginBottom: '10px',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(110, 231, 183, 0.12)',
    color: '#bbf7d0',
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
    color: 'rgba(220, 252, 231, 0.88)',
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
    border: '1px solid rgba(110, 231, 183, 0.16)',
    backdropFilter: 'blur(12px)',
  },
  statLabel: {
    color: 'rgba(187, 247, 208, 0.84)',
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
    background: '#ecfdf5',
    color: '#065f46',
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
  textarea: {
    flex: 1,
    width: '100%',
    minHeight: '100%',
    padding: '16px',
    borderRadius: '18px',
    border: '1px solid rgba(148, 163, 184, 0.26)',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    color: '#0f172a',
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '14px',
    lineHeight: 1.65,
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
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
    background: 'rgba(16, 185, 129, 0.18)',
    color: '#bbf7d0',
    fontSize: '12px',
    fontWeight: '700',
  },
  preview: {
    flex: 1,
    minHeight: '220px',
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
  matchesCard: {
    marginTop: '16px',
    padding: '16px',
    borderRadius: '18px',
    background: 'rgba(15, 23, 42, 0.42)',
    border: '1px solid rgba(51, 65, 85, 0.48)',
  },
  matchesTitle: {
    color: '#f8fafc',
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '12px',
  },
  matchesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxHeight: '220px',
    overflowY: 'auto',
  },
  matchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '12px',
    background: 'rgba(16, 185, 129, 0.08)',
    color: '#d1fae5',
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '13px',
  },
  matchIndex: {
    color: '#6ee7b7',
    fontWeight: '700',
  },
  emptyMatches: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#94a3b8',
    fontSize: '13px',
  },
};
