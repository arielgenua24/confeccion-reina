import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function SoldProductsSelector() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/inbox', { replace: true })
  }, [navigate])
  return null
}

export default SoldProductsSelector
