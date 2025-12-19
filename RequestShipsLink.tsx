import React from 'react'
import { Link } from 'react-router-dom'

export default function RequestShipsLink() {
  return (
    <div
      className="breadcrumbs"
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <Link to="/request_ships" style={{ textDecoration: 'none', fontSize: '25px' }}>
        Заявки
      </Link>
    </div>
  )
}
