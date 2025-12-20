// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loginUserShipThunk } from '../store/slices/auth/authThunks'
import { clearError } from '../store/slices/auth/authSlice'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()

  // Очищаем ошибки при размонтировании компонента
  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Выполняем thunk для входа
    const result = await dispatch(loginUserShipThunk({ login, password }))
    
    // Если вход успешен, перенаправляем на страницу кораблей
    if (loginUserShipThunk.fulfilled.match(result)) {
      navigate('/ships')
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
              disabled={loading}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <input
              className="request__cnt-input"
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
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
