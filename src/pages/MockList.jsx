import React, { useEffect, useState } from 'react'
import { getAllMocks, deleteMock } from '../api/mocks'
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'

export default function MockList(){
  const [mocks, setMocks] = useState([])
  const [filter, setFilter] = useState('')
  const navigate = useNavigate()

  const load = async () => {
    try {
      const data = await getAllMocks()
      setMocks(data)
    } catch (e) {
      console.error(e)
      setMocks([])
    }
  }

  useEffect(()=>{ load() }, [])

  const onDelete = async (id) => {
    if(!confirm('Delete mock?')) return
    await deleteMock(id)
    await load()
  }

  const filtered = mocks.filter(m => !filter || (m.name && m.name.toLowerCase().includes(filter.toLowerCase())))

  return (
    <Paper style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Mocks</h2>
        <div>
          <TextField size='small' placeholder='search by name' value={filter} onChange={e=>setFilter(e.target.value)} />
          <Button style={{ marginLeft: 8 }} variant='contained' onClick={()=>navigate('/create')}>Create</Button>
        </div>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Path</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map(m => (
            <TableRow key={m.id}>
              <TableCell>{m.name}</TableCell>
              <TableCell>{m.method}</TableCell>
              <TableCell>{m.pathPattern}</TableCell>
              <TableCell>{m.responseType}</TableCell>
              <TableCell>{m.priority}</TableCell>
              <TableCell>
                <Button size='small' onClick={()=>navigate(`/edit/${m.id}`)}>Edit</Button>
                <Button size='small' color='error' onClick={()=>onDelete(m.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}
