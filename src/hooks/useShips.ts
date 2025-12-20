// src/hooks/useShips.ts
import { useEffect, useState } from 'react'
import { api } from '../api'
import mock from '../mock'
import { Ship } from '../types'
import { DsShip } from '../api/Api'

type ShipForFilter = { Name?: string; name?: string; [key: string]: any }

export function useShips(appliedSearch?: string) {
  const [ships, setShips] = useState<Ship[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const fetchShips = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await api.api.shipsList(
          appliedSearch ? { name: appliedSearch } : undefined,
          { secure: true }
        );

        // бекенд возвращает в поле data или массив
        let arr: DsShip[] = Array.isArray(response.data) ? response.data : [];
        
        // Преобразуем DsShip в Ship
        const ships: Ship[] = arr.map(ship => ({
          ship_id: ship.shipID || 0,
          name: ship.name || '',
          description: ship.description || null,
          capacity: ship.capacity || null,
          length: ship.length || null,
          width: ship.width || null,
          draft: ship.draft || null,
          cranes: ship.cranes || null,
          containers: ship.containers || null,
          photo_url: ship.photoURL || null,
        }));

        if (!cancelled) setShips(ships);
      } catch (err) {
        // fallback на mock
        let arr = mock;

        if (appliedSearch) {
          const s = appliedSearch.toLowerCase();
          arr = arr.filter(ship =>
            ship.name.toLowerCase().includes(s)
          );
        }

        if (!cancelled) setShips(arr);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchShips()
    return () => { cancelled = true }
  }, [appliedSearch])

  return { ships, loading, error }
}
