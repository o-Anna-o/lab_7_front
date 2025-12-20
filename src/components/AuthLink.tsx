// src/components/AuthLink.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutUserShipThunk } from '../store/slices/auth/authThunks'

export default function AuthLink() {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  const handleLogout = () => {
    dispatch(logoutUserShipThunk())
    window.location.reload()
  }

  return (
    <div
      className="links"
    >
      {isAuthenticated ? (
        <a
          onClick={handleLogout}
          style={{
            color: 'white',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          Выход
        </a>
      ) : (
        <Link
          to="/login"
          style={{
            color: 'white',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
        >
          Вход
        </Link>
      )}
    </div>
  )
}
