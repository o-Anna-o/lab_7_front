// src/components/Navbar.tsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getToken } from '../auth'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getRequestShipBasketThunk } from '../store/slices/requestShipSlice'

import ShipListIcon from '../components/ShipListIcon'
import AuthLink from '../components/AuthLink'
import UserLoginLink from './UserLoginLink'
import RequestShipsLink from './RequestShipsLink'

const CART_ICON_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAn0lEQVR4nO3QMQ4BURSF4ckUEol1qGgobIGFaaxIi0ah0lAohE0QkU9GRvcGY15iIv72nXv+d2+S/BzoYq08a3RelTex8zl7tJ4JxnlwhbTE1imW+eykKNTGCVcM3i1/gH4+e0EvFJiKxywkyH4fi3NIcCepiKKerwnQwDZwhkVMwSYgmEcRlOUveMlfUG/BUTwOIcEoe4hRjmHVS9SHGxku7S0HDKVsAAAAAElFTkSuQmCC'

export default function Navbar() {
  const dispatch = useAppDispatch();
  const [authState, setAuthState] = useState({})
  const isAuthenticated = Boolean(getToken())
  
  // Получаем данные корзины из Redux store
  const requestShipBasketData = useAppSelector(state => state.requestShip.basket);
  const requestShipBasketLoading = useAppSelector(state => state.requestShip.loading);

  // Извлекаем count и requestId из данных корзины
  const rawData = requestShipBasketData?.data ?? requestShipBasketData ?? {};
  const count = rawData.ships_count ?? rawData.ShipsCount ?? rawData.count ?? 0;
  const requestId = rawData.request_ship_id ?? rawData.RequestShipID ?? rawData.requestShipId ?? rawData.id ?? null;

  // Функция для получения корзины через Redux thunk
  const fetchRequestShipBasket = () => {
    if (isAuthenticated) {
      dispatch(getRequestShipBasketThunk());
    }
  };

  useEffect(() => {
    fetchRequestShipBasket()
    const handler = () => {
      fetchRequestShipBasket()
      // Force re-render of auth components
      setAuthState({})
    }
    window.addEventListener('lt:basket:refresh', handler)
    return () => window.removeEventListener('lt:basket:refresh', handler)
  }, [isAuthenticated])

  return (
    <div style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', left: 12, top: 12, zIndex: 10 }}>
      
        {isAuthenticated ? (
          // Авторизованный пользователь — корзина всегда активна (показываем 0, если count отсутствует)
          <Link
            to={requestId ? `/request_ship/${requestId}` : '/request_ship'}
            className="cart-link"
            style={{ textDecoration: 'none' }}
            onClick={e => e.stopPropagation()}
          >
            <img
              className="loading_time-img cart-link-icon"
              src={'data:image/png;base64,' + CART_ICON_BASE64}
              alt="busket"
            />
            <span className="cart-count">{typeof count === 'number' ? count : 0}</span>
          </Link>
        ) : (
          // Гость — корзина неактивна
          <span className="links cart-link cart-link--disabled" title="Требуется вход">
            <img
              className="loading_time-img cart-link-icon--disabled"
              src={'data:image/png;base64,' + CART_ICON_BASE64}
              alt="busket"
            />
          </span>
        )}
    
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '50px', width: '70%', marginLeft: '60px' }}>
        <ShipListIcon />
        <RequestShipsLink />
        <AuthLink />
      </div>
      <div style={{ marginLeft: 'auto' }}>
          <UserLoginLink key={localStorage.getItem('lt_token') || 'logged-out'} />
      </div>
      
    </div>
  )
}
