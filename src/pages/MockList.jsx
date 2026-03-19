import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { deleteMock, getAllMocks } from '../api/mocks';
import CreateMockForm from './CreateMock';

export default function MockList() {
  const [open, setOpen] = useState(false);
  const [mocks, setMocks] = useState([]);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const data = await getAllMocks();
      setMocks(data);
    } catch (e) {
      console.error(e);
      setMocks([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = async (id) => {
    if (!window.confirm('Delete mock?')) return;
    await deleteMock(id);
    await load();
  };

  const normalizedFilter = filter.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      mocks.filter(
        (m) => !normalizedFilter || (m.name && m.name.toLowerCase().includes(normalizedFilter))
      ),
    [mocks, normalizedFilter],
  );

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', p: 2 }}>
      <Paper
        elevation={4}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 3,
          borderRadius: 3,
        }}
      >
        {/* PAGE HEADER */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Mock API Manager
          </Typography>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              variant="outlined"
              placeholder="Search mocks…"
              value={filter}
              sx={{ width: 250 }}
              onChange={(e) => setFilter(e.target.value)}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Create Mock
            </Button>
          </Box>
        </Box>

        {/* CREATE DIALOG */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
          <CreateMockForm
            onClose={() => setOpen(false)}
            onCreated={() => {
              setOpen(false);
              load();
            }}
          />
        </Dialog>

        {/* TABLE SECTION */}
        <Box
          sx={{
            overflowY: 'auto',
            flexGrow: 1,
            borderRadius: 2,
            border: '1px solid #e0e0e0',
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {['Name', 'Method', 'Path', 'Type', 'Priority', 'Actions'].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: 'bold',
                      background: '#f8fafc',
                      fontSize: '0.95rem',
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((m) => (
                <TableRow
                  hover
                  key={m.id}
                  sx={{
                    '&:hover': { backgroundColor: '#f7f9fc' },
                  }}
                >
                  <TableCell>{m.name}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1.2,
                        py: 0.3,
                        borderRadius: 2,
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        bgcolor: '#eef2ff',
                        color: '#3730a3',
                      }}
                    >
                      {m.method}
                    </Box>
                  </TableCell>
                  <TableCell>{m.pathPattern}</TableCell>
                  <TableCell>{m.responseType}</TableCell>
                  <TableCell>{m.priority}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => navigate(`/edit/${m.id}`)} size="small">
                        <EditIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => onDelete(m.id)}>
                        <DeleteIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'gray' }}>
                    No mocks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}
