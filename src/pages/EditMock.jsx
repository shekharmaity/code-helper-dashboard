import React, { useEffect, useState } from 'react'
import { getMock, updateMock } from '../api/mocks'
import { useNavigate, useParams } from 'react-router-dom'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'

export default function EditMock(){
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const navigate = useNavigate()
console.log(useParams())
  useEffect(()=> {
    (async()=>{
      try{
        const data = await getMock(id)
        setForm(data)
      }catch(e){
        console.error(e)
      }
    })()
  },[id])

  if(!form) return <div>Loading...</div>

  const onChange = (k,v) => setForm({...form, [k]: v})

  const onSubmit = async (e) => {
    e.preventDefault()
    await updateMock(id, form)
    navigate('/')
  }

  return (
    <Paper style={{ padding: 16 }}>
      <h2>Edit Mock</h2>
      <form onSubmit={onSubmit} style={{ display:'grid', gap: 12 }}>
        <TextField label='Name' value={form.name||''} onChange={e=>onChange('name', e.target.value)} required />
        <TextField select label='Method' value={form.method||'GET'} onChange={e=>onChange('method', e.target.value)}>
          {['GET','POST','PUT','DELETE','PATCH','ANY'].map(m=> <MenuItem key={m} value={m}>{m}</MenuItem>)}
        </TextField>
        <TextField label='Path Pattern' value={form.pathPattern||''} onChange={e=>onChange('pathPattern', e.target.value)} required />
        <TextField label='Response Type' value={form.responseType||''} onChange={e=>onChange('responseType', e.target.value)} />
        <TextField label='Priority' type='number' value={form.priority||100} onChange={e=>onChange('priority', Number(e.target.value))} />
        <TextField label='Response Body' multiline minRows={6} value={form.responseBody||''} onChange={e=>onChange('responseBody', e.target.value)} />
        <div style={{ display:'flex', gap:8 }}>
          <Button type='submit' variant='contained'>Save</Button>
          <Button variant='outlined' onClick={()=>navigate('/')}>Cancel</Button>
        </div>
      </form>
    </Paper>
  )
}
