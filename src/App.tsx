// src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ShipsList from './pages/ShipsList'
import ShipPage from './pages/ShipPage'
import RequestShipPage from './pages/RequestShipPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import RequestShipsListPage from './pages/RequestShipsListPage'
import { clearToken } from './auth'
import { useEffect } from 'react'

export default function App(){
  // Сброс токена при загрузке приложения (перезагрузке страницы)
  useEffect(() => {
    clearToken();
  }, []);

  return (
    <BrowserRouter>
    
      <div className="page-content" style={{ marginTop: '20px' }}>
        <Routes>
            <Route path='/' element={<HomePage/>} />
            <Route path='/ships' element={<ShipsList/>} />
            <Route path='/ship/:id' element={<ShipPage/>} />
            <Route path='/request_ship/:id' element={<RequestShipPage/>} />
            <Route path='/login' element={<LoginPage/>} />
            <Route path='/register' element={<RegisterPage/>} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/request_ship" element={<RequestShipsListPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
