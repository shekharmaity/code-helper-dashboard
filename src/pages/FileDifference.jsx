import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiArrowRight,
  FiCopy,
  FiFileText,
  FiLayers,
  FiRefreshCw,
  FiTrash2,
  FiUpload,
} from 'react-icons/fi';

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error(`Unable to read file: ${file.name}`));
    reader.readAsText(file);
  });
}

function buildLineDiff(leftText, rightText) {
  const leftLines = leftText.split('\n');
  const rightLines = rightText.split('\n');
  const rows = [];
  const dp = Array.from({ length: leftLines.length + 1 }, () =>
    Array(rightLines.length + 1).fill(0),
  );

  for (let leftIndex = leftLines.length - 1; leftIndex >= 0; leftIndex -= 1) {
    for (let rightIndex = rightLines.length - 1; rightIndex >= 0; rightIndex -= 1) {
      if (leftLines[leftIndex] === rightLines[rightIndex]) {
        dp[leftIndex][rightIndex] = dp[leftIndex + 1][rightIndex + 1] + 1;
      } else {
        dp[leftIndex][rightIndex] = Math.max(
          dp[leftIndex + 1][rightIndex],
          dp[leftIndex][rightIndex + 1],
        );
      }
    }
  }

  let leftIndex = 0;
  let rightIndex = 0;
  let leftNumber = 1;
  let rightNumber = 1;

  while (leftIndex < leftLines.length && rightIndex < rightLines.length) {
    if (leftLines[leftIndex] === rightLines[rightIndex]) {
      rows.push({
        type: 'same',
        leftLine: leftLines[leftIndex],
        rightLine: rightLines[rightIndex],
        leftNumber,
        rightNumber,
      });
      leftIndex += 1;
      rightIndex += 1;
      leftNumber += 1;
      rightNumber += 1;
      continue;
    }

    if (dp[leftIndex + 1][rightIndex] >= dp[leftIndex][rightIndex + 1]) {
      rows.push({
        type: 'removed',
        leftLine: leftLines[leftIndex],
        rightLine: '',
        leftNumber,
        rightNumber: '',
      });
      leftIndex += 1;
      leftNumber += 1;
      continue;
    }

    rows.push({
      type: 'added',
      leftLine: '',
      rightLine: rightLines[rightIndex],
      leftNumber: '',
      rightNumber,
    });
    rightIndex += 1;
    rightNumber += 1;
  }

  while (leftIndex < leftLines.length) {
    rows.push({
      type: 'removed',
      leftLine: leftLines[leftIndex],
      rightLine: '',
      leftNumber,
      rightNumber: '',
    });
    leftIndex += 1;
    leftNumber += 1;
  }

  while (rightIndex < rightLines.length) {
    rows.push({
      type: 'added',
      leftLine: '',
      rightLine: rightLines[rightIndex],
      leftNumber: '',
      rightNumber,
    });
    rightIndex += 1;
    rightNumber += 1;
  }

  return rows;
}

function getActionButtonStyle(variant) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)',
      color: '#fff7ed',
      border: '1px solid rgba(194, 65, 12, 0.4)',
      boxShadow: '0 14px 28px rgba(194, 65, 12, 0.22)',
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

export default function FileDifference() {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [leftName, setLeftName] = useState('Original file');
  const [rightName, setRightName] = useState('Changed file');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const leftDiffRef = useRef(null);
  const rightDiffRef = useRef(null);
  const syncingPaneRef = useRef(null);

  const rows = useMemo(() => buildLineDiff(leftText, rightText), [leftText, rightText]);
  const addedCount = useMemo(() => rows.filter((row) => row.type === 'added').length, [rows]);
  const removedCount = useMemo(() => rows.filter((row) => row.type === 'removed').length, [rows]);
  const unchangedCount = useMemo(() => rows.filter((row) => row.type === 'same').length, [rows]);

  useEffect(() => {
    const leftPane = leftDiffRef.current;
    const rightPane = rightDiffRef.current;

    if (!leftPane || !rightPane) {
      return undefined;
    }

    const syncScroll = (source, target, sourceName) => {
      if (syncingPaneRef.current && syncingPaneRef.current !== sourceName) {
        return;
      }

      syncingPaneRef.current = sourceName;
      target.scrollTop = source.scrollTop;

      window.requestAnimationFrame(() => {
        syncingPaneRef.current = null;
      });
    };

    const handleLeftScroll = () => syncScroll(leftPane, rightPane, 'left');
    const handleRightScroll = () => syncScroll(rightPane, leftPane, 'right');

    leftPane.addEventListener('scroll', handleLeftScroll, { passive: true });
    rightPane.addEventListener('scroll', handleRightScroll, { passive: true });

    return () => {
      leftPane.removeEventListener('scroll', handleLeftScroll);
      rightPane.removeEventListener('scroll', handleRightScroll);
    };
  }, [rows]);

  const handleFileLoad = async (event, side) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await readFileAsText(file);
      setError('');
      setCopied(false);

      if (side === 'left') {
        setLeftText(text);
        setLeftName(file.name);
      } else {
        setRightText(text);
        setRightName(file.name);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSwap = () => {
    setLeftText(rightText);
    setRightText(leftText);
    setLeftName(rightName);
    setRightName(leftName);
    setCopied(false);
    setError('');
  };

  const handleCopySummary = async () => {
    if (!rows.length) {
      return;
    }

    const summary = rows
      .map((row) => {
        const marker = row.type === 'added' ? '+' : row.type === 'removed' ? '-' : ' ';
        const leftPart = row.leftLine || row.rightLine;
        return `${marker} ${leftPart}`;
      })
      .join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setError(`Unable to copy diff: ${err.message}`);
    }
  };

  const handleClear = () => {
    setLeftText('');
    setRightText('');
    setLeftName('Original file');
    setRightName('Changed file');
    setCopied(false);
    setError('');
  };

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroCopy}>
          <div style={styles.eyebrow}>Developer Utility</div>
          <h2 style={styles.title}>File Difference</h2>
          <p style={styles.description}>
            Compare two files or pasted text blocks side by side and inspect added, removed, and
            unchanged lines in one view.
          </p>
        </div>

        <div style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Added</span>
            <span style={styles.statValue}>{addedCount}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Removed</span>
            <span style={styles.statValue}>{removedCount}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Unchanged</span>
            <span style={styles.statValue}>{unchangedCount}</span>
          </div>
        </div>
      </div>

      <div style={styles.toolbar}>
        <button type="button" onClick={handleSwap} style={getActionButtonStyle('primary')}>
          <FiArrowRight />
          Swap Sides
        </button>
        <button type="button" onClick={handleCopySummary} style={getActionButtonStyle('secondary')}>
          <FiCopy />
          {copied ? 'Copied' : 'Copy Diff'}
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
              <div style={styles.panelTitle}>Original</div>
              <div style={styles.panelSubtitle}>{leftName}</div>
            </div>
            <label style={styles.uploadButton}>
              <FiUpload size={14} />
              Upload
              <input type="file" hidden onChange={(event) => handleFileLoad(event, 'left')} />
            </label>
          </div>
          <textarea
            style={styles.textarea}
            placeholder="Paste the first file or text here..."
            value={leftText}
            onChange={(event) => setLeftText(event.target.value)}
          />
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <div style={styles.panelTitle}>Changed</div>
              <div style={styles.panelSubtitle}>{rightName}</div>
            </div>
            <label style={styles.uploadButton}>
              <FiUpload size={14} />
              Upload
              <input type="file" hidden onChange={(event) => handleFileLoad(event, 'right')} />
            </label>
          </div>
          <textarea
            style={styles.textarea}
            placeholder="Paste the second file or text here..."
            value={rightText}
            onChange={(event) => setRightText(event.target.value)}
          />
        </section>
      </div>

      <section style={styles.outputPanel}>
        <div style={styles.panelHeader}>
          <div>
            <div style={styles.outputTitle}>Side-by-Side Diff</div>
            <div style={styles.outputSubtitle}>Green shows additions, red shows removals.</div>
          </div>
          <div style={styles.outputBadge}>
            <FiLayers size={14} />
            Compare
          </div>
        </div>

        <div style={styles.output}>
          {rows.length ? (
            <>
              <div style={styles.diffHeader}>
                <div style={styles.diffHeaderPane}>
                  <span style={styles.diffHeaderLabel}>{leftName}</span>
                </div>
                <div style={styles.diffHeaderPane}>
                  <span style={styles.diffHeaderLabel}>{rightName}</span>
                </div>
              </div>

              <div style={styles.diffBody}>
                <div ref={leftDiffRef} style={styles.diffPane}>
                  {rows.map((row, index) => (
                    <div key={`left-${row.type}-${index}`} style={styles.diffPaneRow}>
                      <div
                        style={{
                          ...styles.diffCell,
                          ...styles.numberCell,
                          ...rowStyles[row.type].left,
                        }}
                      >
                        {row.leftNumber}
                      </div>
                      <div style={{ ...styles.diffCell, ...rowStyles[row.type].left }}>
                        {row.leftLine || ' '}
                      </div>
                    </div>
                  ))}
                </div>

                <div ref={rightDiffRef} style={styles.diffPane}>
                  {rows.map((row, index) => (
                    <div key={`right-${row.type}-${index}`} style={styles.diffPaneRow}>
                      <div
                        style={{
                          ...styles.diffCell,
                          ...styles.numberCell,
                          ...rowStyles[row.type].right,
                        }}
                      >
                        {row.rightNumber}
                      </div>
                      <div style={{ ...styles.diffCell, ...rowStyles[row.type].right }}>
                        {row.rightLine || ' '}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={styles.placeholder}>
              <FiFileText size={18} />
              <div>
                <div style={styles.placeholderTitle}>Diff results will appear here</div>
                <div style={styles.placeholderText}>
                  Upload two files or paste text into both panels to compare line changes.
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const rowStyles = {
  same: {
    left: { background: 'transparent', color: '#e2e8f0' },
    right: { background: 'transparent', color: '#e2e8f0' },
  },
  added: {
    left: { background: 'rgba(15, 23, 42, 0.36)', color: '#64748b' },
    right: { background: 'rgba(22, 163, 74, 0.16)', color: '#dcfce7' },
  },
  removed: {
    left: { background: 'rgba(220, 38, 38, 0.16)', color: '#fee2e2' },
    right: { background: 'rgba(15, 23, 42, 0.36)', color: '#64748b' },
  },
};

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
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '12px 0 24px',
  },
  hero: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '18px',
    flexWrap: 'wrap',
    padding: '24px 26px',
    borderRadius: '24px',
    background:
      'radial-gradient(circle at top left, rgba(251, 191, 36, 0.22), transparent 34%), linear-gradient(135deg, #111827 0%, #3f3f46 50%, #b45309 100%)',
    color: '#fffbeb',
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
    background: 'rgba(251, 191, 36, 0.12)',
    color: '#fde68a',
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
    color: 'rgba(254, 243, 199, 0.9)',
    fontSize: '15px',
    lineHeight: 1.7,
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
    gap: '12px',
    width: '100%',
    alignSelf: 'flex-end',
    flex: '1 1 280px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '18px',
    borderRadius: '18px',
    background: 'rgba(15, 23, 42, 0.24)',
    border: '1px solid rgba(251, 191, 36, 0.16)',
    backdropFilter: 'blur(12px)',
  },
  statLabel: {
    color: 'rgba(253, 230, 138, 0.84)',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
    gap: '18px',
    marginBottom: '18px',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '360px',
    padding: '18px',
    borderRadius: '22px',
    background: '#ffffff',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    boxShadow: '0 22px 48px rgba(15, 23, 42, 0.08)',
  },
  outputPanel: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '420px',
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
  uploadButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    borderRadius: '999px',
    background: '#fef3c7',
    color: '#92400e',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  textarea: {
    flex: 1,
    width: '100%',
    minHeight: '260px',
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
    background: 'rgba(113, 63, 18, 0.42)',
    color: '#fde68a',
    fontSize: '12px',
    fontWeight: '700',
  },
  output: {
    flex: 1,
    minHeight: '320px',
    borderRadius: '18px',
    overflow: 'hidden',
    background: 'rgba(15, 23, 42, 0.42)',
    display: 'flex',
    flexDirection: 'column',
  },
  diffHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
    borderBottom: '1px solid rgba(51, 65, 85, 0.42)',
    background: 'rgba(15, 23, 42, 0.82)',
  },
  diffHeaderPane: {
    padding: '12px 16px',
    borderRight: '1px solid rgba(51, 65, 85, 0.36)',
  },
  diffHeaderLabel: {
    color: '#f8fafc',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  diffBody: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
    minHeight: 0,
    flex: 1,
  },
  diffPane: {
    overflowY: 'auto',
    minHeight: 0,
    scrollBehavior: 'smooth',
    scrollbarColor: '#475569 rgba(15, 23, 42, 0.28)',
  },
  diffPaneRow: {
    display: 'grid',
    gridTemplateColumns: '56px 1fr',
    borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
  },
  diffCell: {
    padding: '10px 12px',
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: '13px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  numberCell: {
    textAlign: 'right',
    borderRight: '1px solid rgba(51, 65, 85, 0.3)',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    color: '#94a3b8',
    minHeight: '100%',
    padding: '20px',
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
