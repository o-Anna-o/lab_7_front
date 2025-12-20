// src/components/Navbar.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import ShipListIcon from '../components/ShipListIcon'
import AuthLink from '../components/AuthLink'
import UserLoginLink from './UserLoginLink'
import RequestShipsLink from './RequestShipsLink'

export default function Navbar() {
  return (
    <div style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '50px', width: '70%', marginLeft: '60px' }}>
        <ShipListIcon />
        <RequestShipsLink />
        <AuthLink />
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <UserLoginLink />
      </div>
    </div>
  )
}
