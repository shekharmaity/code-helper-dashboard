import { Box, Button, Divider, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { createMock } from '../api/mocks';

export default function CreateMock({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    method: 'GET',
    pathPattern: '',
    responseType: 'application/json',
    responseBody: '',
    priority: 100,
    enabled: true,
    templating: true,
  });

  const onChange = (k, v) => setForm({ ...form, [k]: v });

  const onSubmit = async (e) => {
    e.preventDefault();
    await createMock(form);
    if (onCreated) onCreated(); // close dialog + refresh list
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Create New Mock
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <TextField
          label="Mock Name"
          required
          fullWidth
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
        />

        <TextField
          select
          label="HTTP Method"
          fullWidth
          value={form.method}
          onChange={(e) => onChange('method', e.target.value)}
        >
          {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ANY'].map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Path Pattern"
          required
          fullWidth
          helperText="Examples: ^/api/users$ , /api/users/*"
          value={form.pathPattern}
          onChange={(e) => onChange('pathPattern', e.target.value)}
        />

        <TextField
          label="Response Type"
          fullWidth
          value={form.responseType}
          onChange={(e) => onChange('responseType', e.target.value)}
        />

        <TextField
          label="Priority"
          type="number"
          fullWidth
          value={form.priority}
          onChange={(e) => onChange('priority', Number(e.target.value))}
        />

        <TextField
          label="Response Body"
          fullWidth
          multiline
          minRows={6}
          value={form.responseBody}
          onChange={(e) => onChange('responseBody', e.target.value)}
        />

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="contained" color="primary">
            Save Mock
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
