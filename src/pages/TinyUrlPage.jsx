import { useMemo, useState } from 'react';
import {
  FiClock,
  FiCopy,
  FiExternalLink,
  FiLink,
  FiRefreshCw,
  FiScissors,
  FiTrash2,
} from 'react-icons/fi';

const DEFAULT_DOMAIN = 'tiny.mock';
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function normalizeUrl(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error('Enter a URL to shorten.');
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);

  if (!url.hostname) {
    throw new Error('Enter a valid URL.');
  }

  return url.toString();
}

function hashString(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function toBase62(number) {
  if (number === 0) {
    return BASE62[0];
  }

  let result = '';
  let current = number;

  while (current > 0) {
    result = BASE62[current % 62] + result;
    current = Math.floor(current / 62);
  }

  return result;
}

function createShortCode(url, seed = '') {
  const hash = hashString(`${url}:${seed}:${Date.now()}`);
  return toBase62(hash).padStart(6, '0').slice(0, 7);
}

function getActionButtonStyle(variant) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      color: '#fff7ed',
      border: '1px solid rgba(220, 38, 38, 0.38)',
      boxShadow: '0 14px 28px rgba(185, 28, 28, 0.24)',
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

export default function TinyUrlPage() {
  const [url, setUrl] = useState('');
  const [domain, setDomain] = useState(DEFAULT_DOMAIN);
  const [shortUrl, setShortUrl] = useState('');
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const totalLinks = history.length;
  const latestLink = history[0]?.shortUrl || shortUrl || 'No short link generated yet';
  const inputLength = useMemo(() => url.trim().length, [url]);

  const updateShortUrl = (nextShortUrl, originalUrl) => {
    setShortUrl(nextShortUrl);
    setCopied(false);
    setError('');
    setHistory((prev) => [{ shortUrl: nextShortUrl, originalUrl }, ...prev].slice(0, 8));
  };

  const handleShorten = () => {
    try {
      const normalizedUrl = normalizeUrl(url);
      const safeDomain = domain.trim() || DEFAULT_DOMAIN;
      const code = createShortCode(normalizedUrl);
      updateShortUrl(`https://${safeDomain}/${code}`, normalizedUrl);
    } catch (err) {
      setError(err.message);
      setShortUrl('');
    }
  };

  const handleRegenerate = () => {
    try {
      const normalizedUrl = normalizeUrl(url);
      const safeDomain = domain.trim() || DEFAULT_DOMAIN;
      const code = createShortCode(normalizedUrl, Math.random().toString(36));
      updateShortUrl(`https://${safeDomain}/${code}`, normalizedUrl);
    } catch (err) {
      setError(err.message);
      setShortUrl('');
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setError(`Unable to copy short URL: ${err.message}`);
    }
  };

  const handleClear = () => {
    setUrl('');
    setShortUrl('');
    setHistory([]);
    setCopied(false);
    setError('');
    setDomain(DEFAULT_DOMAIN);
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroCopy}>
          <div style={styles.eyebrow}>Developer Utility</div>
          <h2 style={styles.title}>Tiny URL Generator</h2>
          <p style={styles.description}>
            Create clean short links for demos, internal sharing, and test flows. This utility
            generates client-side short URLs instantly for the current dashboard.
          </p>
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Links Created</span>
            <span style={styles.statValue}>{totalLinks}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Input Length</span>
            <span style={styles.statValue}>{inputLength}</span>
          </div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <button type="button" onClick={handleShorten} style={getActionButtonStyle('primary')}>
          <FiScissors />
          Shorten URL
        </button>
        <button
          type="button"
          onClick={handleRegenerate}
          style={getActionButtonStyle('secondary')}
        >
          <FiRefreshCw />
          Regenerate
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!shortUrl}
          style={{
            ...getActionButtonStyle('secondary'),
            ...(shortUrl ? null : styles.disabledButton),
          }}
        >
          <FiCopy />
          {copied ? 'Copied' : 'Copy Link'}
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
              <div style={styles.panelTitle}>URL Input</div>
              <div style={styles.panelSubtitle}>Paste a long URL and choose a short-link domain.</div>
            </div>
            <div style={styles.panelBadge}>
              <FiLink size={14} />
              Link Tool
            </div>
          </div>

          <label htmlFor="tiny-domain" style={styles.inputLabel}>
            Short domain
          </label>
          <input
            id="tiny-domain"
            type="text"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            style={styles.textInput}
            placeholder="tiny.mock"
          />

          <label htmlFor="tiny-url" style={{ ...styles.inputLabel, marginTop: '14px' }}>
            Destination URL
          </label>
          <textarea
            id="tiny-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/some/really/long/path?with=params"
            style={styles.textarea}
          />

          <div style={styles.helperText}>
            If you omit `https://`, the page will add it automatically before generating the short
            link.
          </div>
        </section>

        <section style={styles.outputPanel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.outputTitle}>Short Links</div>
              <div style={styles.outputSubtitle}>Latest result plus a short recent-history list.</div>
            </div>
            <div style={styles.outputBadge}>
              <FiClock size={14} />
              Recent
            </div>
          </div>

          <div style={styles.outputCard}>
            <div style={styles.resultLabel}>Latest Short URL</div>
            <div style={styles.resultValue}>{latestLink}</div>
          </div>

          <div style={styles.output}>
            {history.length ? (
              history.map((item) => (
                <div key={`${item.shortUrl}-${item.originalUrl}`} style={styles.historyRow}>
                  <div style={styles.historyShort}>{item.shortUrl}</div>
                  <div style={styles.historyLong}>{item.originalUrl}</div>
                </div>
              ))
            ) : (
              <div style={styles.placeholder}>
                <FiExternalLink size={18} />
                <div>
                  <div style={styles.placeholderTitle}>Short links will appear here</div>
                  <div style={styles.placeholderText}>
                    Generate a link to keep a recent list ready for copy and reference.
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
      'radial-gradient(circle at top left, rgba(253, 186, 116, 0.26), transparent 34%), linear-gradient(135deg, #111827 0%, #431407 46%, #dc2626 100%)',
    color: '#fff7ed',
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
    background: 'rgba(251, 191, 36, 0.12)',
    color: '#fed7aa',
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
    color: 'rgba(255, 237, 213, 0.92)',
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
    border: '1px solid rgba(251, 191, 36, 0.16)',
    backdropFilter: 'blur(12px)',
  },
  statLabel: {
    color: 'rgba(254, 215, 170, 0.84)',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '18px',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
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
    background: '#fff7ed',
    color: '#c2410c',
    fontSize: '12px',
    fontWeight: '700',
  },
  inputLabel: {
    display: 'block',
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  textInput: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid rgba(148, 163, 184, 0.24)',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    color: '#0f172a',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  textarea: {
    flex: 1,
    width: '100%',
    minHeight: '280px',
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
  helperText: {
    marginTop: '12px',
    color: '#64748b',
    fontSize: '13px',
    lineHeight: 1.6,
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
    background: 'rgba(127, 29, 29, 0.42)',
    color: '#fed7aa',
    fontSize: '12px',
    fontWeight: '700',
  },
  outputCard: {
    padding: '16px',
    borderRadius: '18px',
    background: 'rgba(15, 23, 42, 0.48)',
    border: '1px solid rgba(148, 163, 184, 0.14)',
  },
  resultLabel: {
    color: '#fdba74',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '8px',
  },
  resultValue: {
    color: '#f8fafc',
    fontSize: '15px',
    fontWeight: '600',
    lineHeight: 1.7,
    wordBreak: 'break-all',
  },
  output: {
    flex: 1,
    minHeight: '320px',
    marginTop: '14px',
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
  historyRow: {
    padding: '12px 0',
    borderBottom: '1px solid rgba(51, 65, 85, 0.45)',
  },
  historyShort: {
    color: '#fdba74',
    fontWeight: '600',
    marginBottom: '6px',
    wordBreak: 'break-all',
  },
  historyLong: {
    color: '#94a3b8',
    fontSize: '13px',
    lineHeight: 1.6,
    wordBreak: 'break-all',
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
