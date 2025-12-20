// src/components/UserLoginLink.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'

export default function UserLoginLink() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()

  // If not logged in, don't show anything
  if (!isAuthenticated || !user) {
    return null
  }

  // Попытка получить логин различными способами
  const userLogin = user?.login ||
                    (user as any)?.Login ||
                    (user as any)?.userLogin ||
                    (user as any)?.username ||
                    (user as any)?.userName ||
                    (user as any)?.name ||
                    'Пользователь';

  return (
    <div
      className="links user_login"
    >
      <span
        onClick={() => navigate('/profile')}
      >
        {userLogin || 'Профиль'}
      </span>
    </div>
  )
}
