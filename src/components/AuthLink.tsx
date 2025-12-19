// src/components/AuthLink.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { getToken, clearToken } from '../auth'

export default function AuthLink() {
  const token = getToken()

  return (
    <div
      className="links"
    >
      {token ? (
        <a
          onClick={() => {
            clearToken()
            window.location.reload()
          }}
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
