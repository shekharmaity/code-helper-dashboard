import { useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

function getValueLabel(value) {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }

  if (typeof value === 'object') {
    return `Object(${Object.keys(value).length})`;
  }

  if (typeof value === 'string') {
    return `"${value}"`;
  }

  return String(value);
}

function getValueStyle(value) {
  if (value === null) {
    return styles.nullValue;
  }

  if (Array.isArray(value) || typeof value === 'object') {
    return styles.groupValue;
  }

  if (typeof value === 'string') {
    return styles.stringValue;
  }

  if (typeof value === 'number') {
    return styles.numberValue;
  }

  if (typeof value === 'boolean') {
    return styles.booleanValue;
  }

  return styles.defaultValue;
}

function TreeNode({ label, value, depth = 0 }) {
  const isGroup = value !== null && typeof value === 'object';
  const [collapsed, setCollapsed] = useState(false);

  const entries = Array.isArray(value)
    ? value.map((item, index) => [`[${index}]`, item])
    : isGroup
      ? Object.entries(value)
      : [];

  return (
    <div>
      <div style={{ ...styles.row, paddingLeft: `${depth * 18}px` }}>
        <span style={styles.toggleWrap}>
          {isGroup ? (
            <button
              type="button"
              style={styles.toggleButton}
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? 'Expand node' : 'Collapse node'}
            >
              {collapsed ? <FiChevronRight size={14} /> : <FiChevronDown size={14} />}
            </button>
          ) : null}
        </span>

        {label ? <span style={styles.key}>{label}: </span> : null}
        <span style={getValueStyle(value)}>{getValueLabel(value)}</span>
      </div>

      {isGroup && !collapsed ? (
        <div style={styles.children}>
          {entries.length ? (
            entries.map(([childLabel, childValue]) => (
              <TreeNode
                key={`${label ?? 'root'}-${childLabel}`}
                label={childLabel}
                value={childValue}
                depth={depth + 1}
              />
            ))
          ) : (
            <div style={{ ...styles.row, paddingLeft: `${(depth + 1) * 18}px` }}>
              <span style={styles.toggleWrap} />
              <span style={styles.emptyValue}>empty</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function StructuredDataTree({ data, emptyTitle, emptyHint }) {
  if (data === undefined) {
    return (
      <div style={styles.placeholder}>
        <div style={styles.placeholderTitle}>{emptyTitle}</div>
        <div style={styles.placeholderHint}>{emptyHint}</div>
      </div>
    );
  }

  return (
    <div style={styles.tree}>
      <TreeNode value={data} />
    </div>
  );
}

const styles = {
  tree: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '14px',
    color: '#e2e8f0',
    fontFamily: '"SF Mono", "SFMono-Regular", Consolas, monospace',
    fontSize: '13px',
    lineHeight: 1.7,
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    minHeight: '24px',
  },
  children: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  toggleWrap: {
    width: '18px',
    display: 'inline-flex',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: '2px',
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
    color: '#93c5fd',
    cursor: 'pointer',
  },
  key: {
    color: '#f8fafc',
    fontWeight: 700,
  },
  groupValue: {
    color: '#93c5fd',
  },
  stringValue: {
    color: '#86efac',
  },
  numberValue: {
    color: '#fca5a5',
  },
  booleanValue: {
    color: '#fcd34d',
  },
  nullValue: {
    color: '#c4b5fd',
  },
  defaultValue: {
    color: '#dbeafe',
  },
  emptyValue: {
    color: '#64748b',
    fontStyle: 'italic',
  },
  placeholder: {
    display: 'flex',
    minHeight: '320px',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    textAlign: 'center',
  },
  placeholderTitle: {
    color: '#f8fafc',
    fontSize: '14px',
    fontWeight: 700,
  },
  placeholderHint: {
    marginTop: '6px',
    color: '#94a3b8',
    fontSize: '13px',
    maxWidth: '38ch',
    lineHeight: 1.6,
  },
};
