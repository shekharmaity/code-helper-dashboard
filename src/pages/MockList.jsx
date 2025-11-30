import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteMock, getAllMocks } from '../api/mocks';

import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

export default function MockList() {
  const [mocks, setMocks] = useState([]);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await getAllMocks();
      setMocks(data);
    } catch (e) {
      console.error(e);
      setMocks([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm('Delete mock?')) return;
    await deleteMock(id);
    await load();
  };

  const filtered = mocks.filter(
    (m) => !filter || (m.name && m.name.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <Box
      sx={{
        height: '100vh',
        boxSizing: 'border-box',
        p: 2,
        overflow: 'hidden',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Mocks
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search by name"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />

            <Button variant="contained" onClick={() => navigate('/create')}>
              Create
            </Button>
          </Box>
        </Box>

        {/* Scrollable Table Section */}
        <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>Name</b>
                </TableCell>
                <TableCell>
                  <b>Method</b>
                </TableCell>
                <TableCell>
                  <b>Path</b>
                </TableCell>
                <TableCell>
                  <b>Type</b>
                </TableCell>
                <TableCell>
                  <b>Priority</b>
                </TableCell>
                <TableCell>
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((m) => (
                <TableRow hover key={m.id}>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>{m.method}</TableCell>
                  <TableCell>{m.pathPattern}</TableCell>
                  <TableCell>{m.responseType}</TableCell>
                  <TableCell>{m.priority}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => navigate(`/edit/${m.id}`)}>
                      Edit
                    </Button>

                    <Button size="small" color="error" onClick={() => onDelete(m.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}
