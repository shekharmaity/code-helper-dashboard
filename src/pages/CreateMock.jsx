import React, { useState } from 'react'
import { createMock } from '../api/mocks'
import { useNavigate } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

export default function CreateMock(){
  const [form, setForm] = useState({
    name:'', method:'GET', pathPattern:'', responseType:'application/json', responseBody:'', priority:100, enabled:true, templating:true
  })
  const navigate = useNavigate()

  const onChange = (k,v) => setForm({...form, [k]: v})

  const onSubmit = async (e) => {
    e.preventDefault()
    await createMock(form)
    navigate('/')
  }

  return (
    <Paper style={{ padding: 16 }}>
      <h2>Create Mock</h2>
      <form onSubmit={onSubmit} style={{ display:'grid', gap: 12 }}>
        <TextField label='Name' value={form.name} onChange={e=>onChange('name', e.target.value)} required />
        <TextField select label='Method' value={form.method} onChange={e=>onChange('method', e.target.value)}>
          {['GET','POST','PUT','DELETE','PATCH','ANY'].map(m=> <MenuItem key={m} value={m}>{m}</MenuItem>)}
        </TextField>
        <TextField label='Path Pattern' helperText='e.g. ^/api/users$ or /api/users/*' value={form.pathPattern} onChange={e=>onChange('pathPattern', e.target.value)} required />
        <TextField label='Response Type' value={form.responseType} onChange={e=>onChange('responseType', e.target.value)} />
        <TextField label='Priority' type='number' value={form.priority} onChange={e=>onChange('priority', Number(e.target.value))} />
        <TextField label='Response Body' multiline minRows={6} value={form.responseBody} onChange={e=>onChange('responseBody', e.target.value)} />
        <div style={{ display:'flex', gap:8 }}>
          <Button type='submit' variant='contained'>Save</Button>
          <Button variant='outlined' onClick={()=>navigate('/')}>Cancel</Button>
        </div>
      </form>
    </Paper>
  )
}
