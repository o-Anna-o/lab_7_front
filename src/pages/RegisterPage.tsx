// src/pages/RegisterPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from "../api" // импорт сгенерированного API

export default function RegisterPage() {
  const [fio, setFio] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      

      // вызываем метод из кодогенерации
      const data = await api.api.usersRegisterCreate({
        fio,
        login,
        password,
        role: "creator"
      })

      
      navigate('/login') // редирект после успешной регистрации

    } catch (err: any) {
      

      // Axios-подобная структура ошибки
      if (err?.response?.data) {
        
      }

      setError(err?.response?.data?.detail || err?.message || 'Ошибка регистрации')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 600, marginTop: 40, background: '#3A3A3A', padding: 30, borderRadius: 6 }}>
        <h2>Регистрация</h2>

        {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: 10 }}>
            <input
              className="request__cnt-input"
              placeholder="ФИО"
              value={fio}
              onChange={e => setFio(e.target.value)}
            />
          </div>

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

          <button className="btn" type="submit">Зарегистрироваться</button>
        </form>

        <div style={{ marginTop: 15 }}>
          Уже есть аккаунт?{' '}
          <span
            style={{ color: '#AA9B7D', cursor: 'pointer' }}
            onClick={() => navigate('/login')}
          >
            Войти
          </span>
        </div>
      </div>
    </div>
  )
}
