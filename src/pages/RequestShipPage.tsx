// src/pages/RequestShipPage.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Breadcrumbs from '../components/Breadcrumbs'

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { formRequestShipThunk, getRequestShipBasketThunk } from "../store/slices/requestShipSlice";

import { api } from "../api" // импорт сгенерированного API

type ShipInRequest = {  
  Ship: {
    ShipID: number
    Name: string
    PhotoURL?: string
    Capacity?: number
    Length?: number
    Width?: number
    Cranes?: number
  }
  ShipsCount: number
}

type RequestShip = {
  RequestShipID: number
  Containers20ftCount?: number
  Containers40ftCount?: number
  Comment?: string
  LoadingTime?: string
  Ships?: ShipInRequest[]
}

export default function RequestShipPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [request, setRequest] = useState<RequestShip | null>(null)
  const [containers20, setContainers20] = useState<number | ''>('')
  const [containers40, setContainers40] = useState<number | ''>('')
  const [comment, setComment] = useState<string>('')
  const [resultTime, setResultTime] = useState<string>('')


  const [errors, setErrors] = useState({
  c20: false,
  c40: false,
  });


 async function load(idToLoad: string | undefined) {
  if (!idToLoad) return
  try {
    setLoading(true)
    const response = await api.api.requestShipDetail(Number(idToLoad), {
      secure: true,
    })

    const payload: any = response.data;

    if (!payload || typeof payload !== 'object') {
      throw new Error('Unexpected request_ship payload')
    }

    const requestShipId = payload.requestShipID || payload.RequestShipID || payload.request_ship_id || payload.id || 0;
    const containers20 = payload.containers20ftCount || payload.containers_20ft_count || 0;
    const containers40 = payload.containers40ftCount || payload.containers_40ft_count || 0;
    const commentVal = payload.comment || '';
    const loadingTimeVal = payload.loadingTime || payload.loading_time || '';

    const rawShips = Array.isArray(payload.ships) ? payload.ships : [];

    const shipsNormalized = rawShips.map((si: any) => ({
      Ship: {
        ShipID: si.ship?.shipID || si.ship?.ShipID || si.ship?.ship_id || si.ship_id || 0,
        Name: si.ship?.name || si.ship?.Name || '',
        PhotoURL: si.ship?.photoURL || si.ship?.PhotoURL || si.ship?.photo_url || '',
        Capacity: si.ship?.capacity || si.ship?.Capacity || 0,
        Length: si.ship?.length || si.ship?.Length || 0,
        Width: si.ship?.width || si.ship?.Width || 0,
        Cranes: si.ship?.cranes || si.ship?.Cranes || 0
      },
      ShipsCount: si.shipsCount || si.ships_count || si.ShipsCount || 1
    }))

    const rs: RequestShip = {
      RequestShipID: requestShipId,
      Containers20ftCount: containers20,
      Containers40ftCount: containers40,
      Comment: commentVal,
      LoadingTime: loadingTimeVal,
      Ships: shipsNormalized
    }

    setRequest(rs)
    setContainers20(rs.Containers20ftCount ?? '')
    setContainers40(rs.Containers40ftCount ?? '')
    setComment(rs.Comment ?? '')
    setResultTime(rs.LoadingTime ?? '')
  } catch (e: any) {
    console.error('load request error', e)
    if (e?.response?.status === 401) {
      navigate('/login')
    }
    setRequest(null)
  } finally {
    setLoading(false)
  }
}



  useEffect(()=> {
    load(id)
    const handler = ()=> load(id)
    window.addEventListener('lt:basket:refresh', handler)
    return ()=> window.removeEventListener('lt:basket:refresh', handler)
  }, [id])

  async function onDeleteShip(shipId: number) {
    if (!request || !id) return
    try {
      await api.api.requestShipShipsDelete(Number(id), shipId, {
        secure: true,
      })
      await load(String(id))
      // Обновляем корзину
      const dispatch = useAppDispatch();
      dispatch(getRequestShipBasketThunk());
    } catch(e: any) {
      console.error('deleteShip error', e)
      alert('Ошибка удаления корабля: ' + (e?.message || 'Неизвестная ошибка'))
    }
  }

// _________________________кодогенерация__________________________________

//  Redux Thunk версия onFormation 

const dispatch = useAppDispatch();
const loadingFormation = useAppSelector(state => state.requestShip.loading);

const onFormation = () => {
  if (!id) return;

  const c20 = Number(containers20) || 0;
  const c40 = Number(containers40) || 0;

  const newErrors = {
    c20: c20 <= 0,
    c40: c40 <= 0,
  };

  if (newErrors.c20 && newErrors.c40) {
    setErrors(newErrors);
    alert("Заполните хотя бы одно поле контейнеров");
    return;
  }

  setErrors({ c20: false, c40: false });

  dispatch(
    formRequestShipThunk({
      id: Number(id),
      containers20: c20,
      containers40: c40,
      comment: comment || "", 
    })
  );
};




  async function onDeleteRequest() {
    if (!request || !id) return

    try {
      await api.api.requestShipDelete(Number(id), {
        secure: true,
      })

      navigate('/ships')
      window.dispatchEvent(new CustomEvent('lt:basket:refresh'))
    } catch (e: any) {
      console.error('deleteRequest error', e)
      alert('Ошибка удаления заявки: ' + (e?.message || 'Неизвестная ошибка'))
    }
  }

  async function onCalculate(e?: React.FormEvent) {
    e?.preventDefault()
    if (!request || !id) return
    try {
      const payload = {
        containers_20ft: Number(containers20) || 0,
        containers_40ft: Number(containers40) || 0,
        comment: comment ?? ''
      }
      
      // Для расчета времени погрузки используем специальный эндпоинт
      // Поскольку в сгенерированном API нет этого метода, используем axios напрямую
      await api.instance.post(`/api/request_ship/calculate_loading_time/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...api.instance.defaults.headers.common,
        },
        withCredentials: true,
      });
      
      // загрузим обновлённую заявку
      await load(String(id))
      window.dispatchEvent(new CustomEvent('lt:basket:refresh'))
    } catch (err: any) {
      console.error('calculate error', err)
      alert('Ошибка расчёта: ' + (err?.message || 'Неизвестная ошибка'))
    }
  }

  if (loading) return <div style={{padding:20}}>Загрузка...</div>

  return (
    <>
    <Navbar />
    <Breadcrumbs />
    
    <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
      
      <div className="request" style={{width:1350, display:'flex', flexDirection:'column', alignItems:'center', gap:30, backgroundColor:'#3A3A3A', borderRadius:5, padding:'33px 120px'}}>
        <h1>Расчёт времени погрузки контейнеров</h1>

        { !request ? (
          <div className="empty-message">
            <p>Заявка не найдена. Добавьте контейнеровоз для расчета.</p>
          </div>
        ) : (
          <>
            <form className="request-form" id="main-form" style={{width:1198}}>
              <div className="request__counts">
                <div className="request__cnt request__cnt-20-f">
                  <p>Количество 20-футовых контейнеров</p>
                  <input
                    className="request__cnt-input"
                    style={errors.c20 ? { border: "2px solid red" } : {}}
                    type="number"
                    name="containers_20ft"
                    placeholder="Введите целое число"
                    value={containers20}
                    onChange={e => {
                      setContainers20(e.target.value === '' ? '' : Number(e.target.value));
                      setErrors(prev => ({ ...prev, c20: false }));
                    }}
                  />
                </div>
                <div className="request__cnt request__cnt-40-f">
                  <p>Количество 40-футовых контейнеров</p>
                  <input
                    className="request__cnt-input"
                    style={errors.c40 ? { border: "2px solid red" } : {}}
                    type="number"
                    name="containers_40ft"
                    placeholder="Введите целое число"
                    value={containers40}
                    onChange={e => {
                      setContainers40(e.target.value === '' ? '' : Number(e.target.value));
                      setErrors(prev => ({ ...prev, c40: false }));
                    }}
                  />
                </div>
              </div>

              <div className="fields" style={{marginTop:10}}>
                <div className="fields_item fields__comment">
                  <p>Комментарий</p>
                  <input className="fields__comment--input" type="text" name="comment"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>
                <div className="fields_item">
                  <p>Общее время погрузки</p>
                  <input className="fields__result--input fields__result" type="text" value={resultTime ?? ''} readOnly />
                </div>
              </div>
            </form>

            <h2>Выбранные контейнеровозы</h2>
            <div className="request__cards" style={{display:'flex', flexDirection:'column', gap:30}}>
              {request.Ships && request.Ships.length > 0 ? (
                request.Ships.map((s) => (
                  <div key={s.Ship.ShipID} className="request__card" style={{display:'flex', flexDirection:'row', gap:40, width:1198, border:'2px solid #AA9B7D', padding:30, borderRadius:5}}>
                    <h2 className="request__card__title" style={{width:148}}>{s.Ship.Name}</h2>

                    {s.Ship.PhotoURL ? (
                      <img className="request__card__ship-card__img"
                           src={getShipImageUrl(s.Ship.PhotoURL)}
                           style={{width:360}}
                           alt={s.Ship.Name}
                           onError={(ev)=> { (ev.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : null}

                    <div className="ship-card__text">
                      <p><b>Вместимость:</b> {s.Ship.Capacity ?? '-'} TEU</p>
                      <p><b>Габариты:</b> длина {s.Ship.Length ?? '-'} м, ширина {s.Ship.Width ?? '-'} м</p>
                      <p><b>Краны:</b> {s.Ship.Cranes ?? '-'} одновременно</p>
                    </div>

                    <div className="ship-card__other" style={{display:'flex', flexDirection:'column', gap:30}}>
                      <div className="ship-card__other-item ship-card__cnt"><p>Количество</p><input className="ship-card__cnt-input" type="text" value={String(s.ShipsCount)} readOnly/></div>

                      <div>
                        <button
                          type="button"
                          className="ship-card__other-item ship-card__other-btn btn"
                          onClick={()=> onDeleteShip(s.Ship.ShipID)}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-message">
                  <p>Нет выбранных контейнеровозов. Добавьте контейнеровоз для расчета.</p>
                </div>
              )}
            </div>

            <div className="ship-card__btns" style={{marginTop:20}}>
                <button
                  type="button"
                  className="ship-card__btn beige-btn btn"
                  onClick={onFormation}
                  disabled={loadingFormation}
                >
                  {loadingFormation ? "Формируется…" : "Сформировать заявку"}
              </button>

              <button type="button" className="ship-card__btn beige-btn btn" onClick={onDeleteRequest} style={{marginLeft:10}}>
                Удалить всю заявку
              </button>
            </div>
          </>
        )}
      </div>
    </div>

    </>

  )
}

// helper — формирует URL для изображения (minio)
function getShipImageUrl(photoPath?: string) {
  if (!photoPath) return ''
  const base = (import.meta.env?.VITE_IMG_BASE as string) ?? 'http://localhost:9000/loading-time-img/img'
  return `${base}/${photoPath}`
}
