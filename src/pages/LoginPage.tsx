// src/pages/LoginPage.tsx
import React, { useState } from 'react'
import { saveToken } from '../auth'
import { useNavigate } from 'react-router-dom'
import { api } from "../api" // импорт сгенерированного API

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      

      // вызываем метод из кодогенерации
      const data = await api.api.usersLoginCreate({ login, password })

      
      const token =
        (data.data as any)?.token ||
        (data.data as any)?.access_token ||
        (data.data as any)?.jwt

      if (!token) {
        setError('Токен не получен')
        
        return
      }

      saveToken(token)
      navigate('/ships')
    } catch (err: any) {
      
      if (err?.response?.data) {
        
      }
      setError(err?.response?.data?.detail || err?.message || 'Ошибка входа')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 600, marginTop: 40, background: '#3A3A3A', padding: 30, borderRadius: 6 }}>
        <h2>Вход</h2>
        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 10 }}>
            <input
              className="request__cnt-input"
              placeholder="Логин"
              value={login}
              onChange={e => setLogin(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input
              className="request__cnt-input"
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button className="btn" type="submit">Войти</button>
        </form>

        <div style={{ marginTop: 15 }}>
          Нет аккаунта?{' '}
          <span
            style={{ color: '#AA9B7D', cursor: 'pointer' }}
            onClick={() => navigate('/register')}
          >
            Зарегистрироваться
          </span>
        </div>
      </div>
    </div>
  )
}
