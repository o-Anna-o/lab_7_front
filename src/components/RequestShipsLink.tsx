import React from 'react'
import { Link } from 'react-router-dom'

export default function RequestShipsLink() {
  return (
    <div
      className="links"
    >
      <Link to="/request_ship" style={{ textDecoration: 'none', fontSize: '25px' }}>
        Заявки
      </Link>
    </div>
  )
}
