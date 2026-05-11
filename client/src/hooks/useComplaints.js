import { useState, useEffect } from 'react'
import api from '../services/api'

export function useComplaints(query = '') {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = () => {
    setLoading(true)
    api.get(`/complaints${query}`)
      .then(res => setComplaints(res.data.complaints))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [query])
  return { complaints, loading, error, refetch: fetch }
}