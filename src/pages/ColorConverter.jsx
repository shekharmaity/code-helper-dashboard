import { useMemo, useState } from 'react';
import { Box, Paper, Stack, TextField, Typography } from '@mui/material';
import UtilityPageShell from '../components/UtilityPageShell';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((value) => clamp(value, 0, 255).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3 ? normalized.split('').map((char) => char + char).join('') : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error('Invalid HEX color.');
  }

  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHsl(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let h;
  let s;
  const l = (max + min) / 2;

  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case red:
        h = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        h = (blue - red) / delta + 2;
        break;
      default:
        h = (red - green) / delta + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function parseColor(value) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('#')) {
    return hexToRgb(trimmed);
  }

  const rgbMatch = trimmed.match(/^rgb\(\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\s*\)$/i);

  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }

  throw new Error('Use HEX like #1D4ED8 or rgb(29, 78, 216).');
}

export default function ColorConverter() {
  const [input, setInput] = useState('#3574f0');

  const parsed = useMemo(() => {
    try {
      const rgb = parseColor(input);

      if (!rgb) {
        return { hex: '', rgb: '', hsl: '', error: '' };
      }

      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      return {
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        error: '',
      };
    } catch (err) {
      return { hex: '', rgb: '', hsl: '', error: err.message };
    }
  }, [input]);

  return (
    <UtilityPageShell
      title="Color Converter"
      description="Convert between HEX, RGB, and HSL while previewing the resulting swatch."
      stats={[
        { label: 'HEX', value: parsed.hex || '-' },
        { label: 'RGB', value: parsed.rgb || '-' },
        { label: 'Status', value: parsed.error ? 'Invalid' : 'Ready' },
      ]}
    >
      {parsed.error ? <Paper elevation={0} sx={styles.error}>{parsed.error}</Paper> : null}

      <Box sx={styles.grid}>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Input Color</Typography>
          <TextField value={input} onChange={(event) => setInput(event.target.value)} fullWidth InputProps={{ sx: styles.input }} />
          <Box sx={{ ...styles.swatch, background: parsed.hex || '#1f2937' }} />
        </Paper>
        <Paper elevation={0} sx={styles.panel}>
          <Typography sx={styles.panelTitle}>Converted Values</Typography>
          <Stack spacing={1}>
            <Typography sx={styles.valueRow}>HEX: {parsed.hex || '-'}</Typography>
            <Typography sx={styles.valueRow}>RGB: {parsed.rgb || '-'}</Typography>
            <Typography sx={styles.valueRow}>HSL: {parsed.hsl || '-'}</Typography>
          </Stack>
        </Paper>
      </Box>
    </UtilityPageShell>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
    gap: 2,
  },
  panel: {
    p: 2,
    borderRadius: 4,
    background: 'rgba(255, 255, 255, 0.88)',
    border: '1px solid rgba(148, 163, 184, 0.18)',
  },
  panelTitle: {
    mb: 1.25,
    fontSize: 14,
    fontWeight: 700,
    color: '#0f172a',
  },
  input: {
    fontSize: 13,
    background: 'rgba(248, 250, 252, 0.9)',
    borderRadius: 3,
  },
  swatch: {
    mt: 2,
    height: 120,
    borderRadius: 4,
    border: '1px solid rgba(148, 163, 184, 0.2)',
  },
  valueRow: {
    fontSize: 13,
    color: '#334155',
    wordBreak: 'break-word',
    fontFamily: '"SF Mono", "SFMono-Regular", Consolas, monospace',
  },
  error: {
    px: 1.5,
    py: 1.25,
    borderRadius: 3,
    border: '1px solid rgba(239, 68, 68, 0.16)',
    background: 'rgba(254, 242, 242, 0.95)',
    color: '#b91c1c',
    fontSize: 13,
  },
};
