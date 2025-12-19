// src/components/ShipListIcon.tsx

import React from 'react'
import { Link } from 'react-router-dom'

export default function ShipListIcon() {
  return (
    <div
      className="links"
    >
      <Link to="/ships">
              Контейнеровозы
      </Link>
    </div>
  )
}
