// src/api.ts
import { getToken } from './auth'
import axios from 'axios'
const API_BASE = '/api'

// НЕ используем mock здесь — только бэкенд
export type ShipsFilterParams = {
  search?: string
  capacity_min?: number
  capacity_max?: number
  cranes_min?: number
  cranes_max?: number
}

export async function getShips(params?: ShipsFilterParams) {

  const url = new URL(API_BASE + '/ships', window.location.origin)

  if (params?.search) url.searchParams.set('search', String(params.search))
  if (typeof params?.capacity_min === 'number') url.searchParams.set('capacity_min', String(params.capacity_min))
  if (typeof params?.capacity_max === 'number') url.searchParams.set('capacity_max', String(params.capacity_max))
  if (typeof params?.cranes_min === 'number') url.searchParams.set('cranes_min', String(params.cranes_min))
  if (typeof params?.cranes_max === 'number') url.searchParams.set('cranes_max', String(params.cranes_max))


  const res = await axios.get(url.toString(), {
    withCredentials: true
  })

  if (res.status < 200 || res.status >= 300) {
    throw new Error('HTTP ' + res.status + (res.statusText ? ': ' + res.statusText : ''))
  }

  const j = res.data
  if (j && j.data && Array.isArray(j.data)) return j.data
  if (j && Array.isArray(j)) return j
  return j ?? []
}

export async function addShipToRequest(shipId:number){
  
  const token = getToken();
  const headers: Record<string,string> = {'Content-Type':'application/json'};
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const response = await axios.post(`${API_BASE}/ships/${shipId}/add-to-ship-bucket`, {}, {
    headers,
    withCredentials: true
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error('HTTP ' + response.status + (response.statusText ? ': ' + response.statusText : ''))
  }
  return response.data
}

// получить одну заявку по id
export async function getRequestShip(id: number | string) {
  const token = getToken()
  const headers: Record<string,string> = {'Content-Type': 'application/json'}
  if (token) headers['Authorization'] = 'Bearer ' + token

  const url = `${API_BASE}/request_ship/${id}`
  const res = await axios.get(url, {
    headers,
    withCredentials: true
  })

  if (res.status < 200 || res.status >= 300) {
    throw new Error('HTTP ' + res.status + (res.statusText ? ': ' + res.statusText : ''))
  }
  const j = res.data
  if (!j) return {}
  // normalize common shapes
  const data = j.data ?? j
  return data
}

// получить корзину/черновик
export async function getRequestShipBasket() {
  const token = getToken()
  const headers: Record<string,string> = {'Content-Type': 'application/json'}
  if (token) headers['Authorization'] = 'Bearer ' + token

  const res = await axios.get(`${API_BASE}/request_ship/basket`, {
    headers,
    withCredentials: true
  })
  if (res.status < 200 || res.status >= 300) {
    throw new Error('HTTP ' + res.status + (res.statusText ? ': ' + res.statusText : ''))
  }
  const j = res.data
  if (!j) return null
  const payload = j.data ?? j

  // return normalized small object the redirect/consumer expects
  return {
    request_ship_id: payload.request_ship_id ?? payload.RequestShipID ?? payload.id ?? payload.requestShipId ?? null,
    ships_count: payload.ships_count ?? payload.ShipsCount ?? payload.count ?? null,
    raw: payload
  }
}

// удалить конкретный корабль из заявки
export async function deleteShipFromRequest(requestId: number | string, shipId: number | string) {
  const token = getToken()
  const headers: Record<string, string> = {}
  if (token) headers['Authorization'] = 'Bearer ' + token

  const res = await axios.delete(`${API_BASE}/request_ship/${requestId}/ships/${shipId}`, {
    headers,
    withCredentials: true,
  })
  if (res.status < 200 || res.status >= 300) {
    throw new Error('HTTP ' + res.status + (res.statusText ? ': ' + res.statusText : ''))
  }
  return res.data
}

// удалить всю заявку
export async function deleteRequestShip(requestId: number | string) {
  const token = getToken()
  const headers: Record<string,string> = {'Content-Type': 'application/json'}
  if (token) headers['Authorization'] = 'Bearer ' + token

  const res = await axios.post(`${API_BASE}/request_ship/${requestId}`, { _method: 'DELETE' }, {
    headers,
    withCredentials: true
  })
  if (res.status < 200 || res.status >= 300) {
    throw new Error('HTTP ' + res.status + (res.statusText ? ': ' + res.statusText : ''))
  }
  return res.data
}

// рассчитать время погрузки (PUT)
export async function calculateLoadingTime(requestId: number | string, payload: { containers_20ft?: number, containers_40ft?: number, comment?: string }) {
  const token = getToken()
  const headers: Record<string,string> = {'Content-Type': 'application/json'}
  if (token) headers['Authorization'] = 'Bearer ' + token

  const res = await axios.post(`${API_BASE}/request_ship/calculate_loading_time/${requestId}`, payload, {
    headers,
    withCredentials: true
  })
  if (res.status < 200 || res.status >= 300) {
    throw new Error('HTTP ' + res.status + (res.statusText ? ': ' + res.statusText : ''))
  }
  return res.data
}

// обновить количество конкретного корабля в заявке
export async function updateShipCountInRequest(requestId: number | string, shipId: number | string, shipsCount: number) {
  console.log('updateShipCountInRequest called with:', { requestId, shipId, shipsCount });
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token) headers['Authorization'] = 'Bearer ' + token

  const url = `${API_BASE}/request_ship/${requestId}/ships/${shipId}`;
  console.log('Making PUT request to:', url);
  console.log('Request data:', { ships_count: shipsCount });
  console.log('Headers:', headers);

  try {
    const res = await axios.put(url, {
      ships_count: shipsCount
    }, {
      headers,
      withCredentials: true,
    })
    console.log('Response status:', res.status);
    console.log('Response data:', res.data);
    if (res.status < 200 || res.status >= 300) {
      throw new Error('HTTP ' + res.status + (res.statusText ? ': ' + res.statusText : ''))
    }
    return res.data
  } catch (error) {
    console.error('Error in updateShipCountInRequest:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    throw error;
  }
}

export async function completeRequestShip(
  requestId: number,
  action: "complete" | "reject"
) {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: "Bearer " + token,
  };

  const body = new URLSearchParams();
  body.append("action", action);

  const res = await axios.put(
    `${API_BASE}/request_ship/${requestId}/completion`,
    body,
    { headers, withCredentials: true }
  );

  return res.data;
}
