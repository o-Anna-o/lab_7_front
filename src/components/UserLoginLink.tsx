// src/components/UserLoginLink.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken, isLoggedIn } from '../auth'
import { api } from '../api'

export default function UserLoginLink() {
  const [userLogin, setUserLogin] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuthAndFetchProfile = async () => {
      // Always check the current state
      const token = getToken()
      const loggedIn = isLoggedIn()
      
      
      
      
      
      
      
      // If not logged in, hide the link
      if (!loggedIn || !token) {
      
        setUserLogin(null)
        setLoading(false)
        return
      }

      try {
      
        const res = await api.api.usersProfileList()
        
        
        // Детальная нормализация полей данных пользователя
        const userData = res.data;
        
        
        // Попытка получить логин различными способами
        const login = userData?.login ||
                    (userData as any)?.Login ||
                    (userData as any)?.userLogin ||
                    (userData as any)?.username ||
                    (userData as any)?.userName ||
                    (userData as any)?.name ||
                    'Пользователь';
        
        
        
        
        setUserLogin(login)
      } catch (err: any) {
        
        if (err.response) {
          
          
        }
        // Even if we can't fetch profile, we're still logged in
        setUserLogin('Пользователь')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetchProfile()
  }, [])

  // If still loading, show nothing
  if (loading) {
    return null
  }
  
  // If not logged in, don't show anything
  if (!isLoggedIn() || !getToken()) {
    return null
  }

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
