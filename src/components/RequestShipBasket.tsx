// src/components/RequestShipBasket.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getToken } from '../auth';
import axios from 'axios';

const CART_ICON_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAn0lEQVR4nO3QMQ4BURSF4ckUEol1qGgobIGFaaxIi0ah0lAohE0QkU9GRvcGY15iIv72nXv+d2+S/BzoYq08a3RelTex8zl7tJ4JxnlwhbTE1imW+eykKNTGCVcM3i1/gH4+e0EvFJiKxywkyH4fi3NIcCepiKKerwnQwDZwhkVMwSYgmEcRlOUveMlfUG/BUTwOIcEoe4hRjmHVS9SHGxku7S0HDKVsAAAAAElFTkSuQmCC';

export default function RequestShipBasket() {
  const [count, setCount] = useState<number | null>(null);
  const [requestId, setRequestId] = useState<number | null>(null);
  const isAuthenticated = Boolean(getToken());

  async function fetchBasket() {
    const tkn = getToken();
    
    if (!tkn) {
      setCount(null);
      setRequestId(null);
      return;
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + tkn,
      };

      const res = await axios.get('/api/request_ship/basket', {
        headers,
      });

      const json = res.data;
      
      if (res.status === 401) {
        setCount(null);
        setRequestId(null);
        return;
      }

      if (!json) {
        setCount(null);
        setRequestId(null);
        return;
      }

      let id = null;
      let c: number | null = null;

      if (json.data && typeof json.data === 'object') {
        id = json.data.request_ship_id ?? json.data.requestShipId ?? json.data.requestShipID ?? null;
        c = json.data.ships_count ?? json.data.shipsCount ?? json.count ?? null;
      } else {
        id = json.request_ship_id ?? json.requestShipId ?? null;
        c = json.ships_count ?? json.shipsCount ?? json.count ?? null;
      }

      // Normalize
      if (c === null || typeof c === 'undefined') {
        // if server intentionally returns 0, we set 0; else null
        setCount(0);
      } else {
        setCount(Number(c));
      }
      setRequestId(id ? Number(id) : null);
      
    } catch (e) {
      setCount(null);
      setRequestId(null);
    }
  }

  useEffect(() => {
    fetchBasket();
    const handler = () => {
      fetchBasket();
    };
    window.addEventListener('lt:basket:refresh', handler);
    return () => window.removeEventListener('lt:basket:refresh', handler);
  }, []);

  return (
    <div style={{ position: 'absolute', right: 16, top: 12, zIndex: 5 }}>
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
  );
}