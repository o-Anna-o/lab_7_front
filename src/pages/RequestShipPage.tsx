// src/pages/RequestShipPage.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getRequestShip, deleteShipFromRequest, deleteRequestShip, calculateLoadingTime, updateShipCountInRequest } from '../apii'
import Navbar from '../components/Navbar'
import Breadcrumbs from '../components/Breadcrumbs'

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { formRequestShipThunk } from "../store/slices/requestShipSlice";

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
      const data = await getRequestShip(idToLoad) 

      const payload = data?.data ?? data

      if (!payload || typeof payload !== 'object') {
        throw new Error('Unexpected request_ship payload')
      }

      const requestShipId = payload.request_ship_id
      const containers20 = payload.containers_20ft_count ?? 0
      const containers40 = payload.containers_40ft_count ?? 0
      const commentVal = payload.comment ?? ''
      const loadingTimeVal = payload.loading_time ?? ''

      const rawShips = Array.isArray(payload.ships) ? payload.ships : []

      const shipsNormalized = rawShips.map((si: any) => ({
        Ship: {
          ShipID: si.ship_id,
          Name: si.name,
          PhotoURL: si.photo_url,
          Capacity: si.capacity,
          Length: si.length,
          Width: si.width,
          Cranes: si.cranes
        },
        ShipsCount: si.ships_count ?? 1
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
    } catch (e) {
      console.error('load request error', e)
      if (e instanceof Error && e.message.startsWith('HTTP 401')) {
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

  // Функция для обновления количества кораблей в локальном состоянии
  const updateShipCount = (shipId: number, newCount: number) => {
    if (request && request.Ships) {
      const updatedShips = request.Ships.map(ship =>
        ship.Ship.ShipID === shipId ? { ...ship, ShipsCount: newCount } : ship
      );
      setRequest({ ...request, Ships: updatedShips });
    }
  };

  // Функция для сохранения количества кораблей в локальном состоянии и в базе данных
  const onSaveShip = async (shipId: number, count: number) => {
    // Обновляем локальное состояние
    updateShipCount(shipId, count);
    
    // Сохраняем в базе данных
    try {
      if (request) {
        await updateShipCountInRequest(request.RequestShipID, shipId, count);
        // Отправляем событие обновления корзины
        window.dispatchEvent(new CustomEvent('lt:basket:refresh'));
      }
    } catch (error) {
      console.error('Ошибка при сохранении количества кораблей:', error);
      alert('Ошибка при сохранении количества кораблей');
    }
  };

  async function onDeleteShip(shipId: number) {
    if (!request) return
    try {
      await deleteShipFromRequest(request.RequestShipID, shipId)
      await load(String(request.RequestShipID))
      window.dispatchEvent(new CustomEvent('lt:basket:refresh'))
    } catch(e) {
      console.error('deleteShip error', e)
      alert('Ошибка удаления корабля')
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
    if (!request) return

    try {
      await api.api.requestShipDelete(request.RequestShipID)

      navigate('/ships')
      window.dispatchEvent(new CustomEvent('lt:basket:refresh'))
    } catch (e) {
      console.error('deleteRequest error', e)
      alert('Ошибка удаления заявки')
    }
  }

  async function onCalculate(e?: React.FormEvent) {
    e?.preventDefault()
    if (!request) return
    try {
      const payload = {
        containers_20ft: Number(containers20) || 0,
        containers_40ft: Number(containers40) || 0,
        comment: comment ?? ''
      }
      await calculateLoadingTime(request.RequestShipID, payload)
      // загрузим обновлённую заявку
      await load(String(request.RequestShipID))
      window.dispatchEvent(new CustomEvent('lt:basket:refresh'))
    } catch (err) {
      console.error('calculate error', err)
      alert('Ошибка расчёта')
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
            <div className="request__cards" style={{display:'flex', flexDirection:'column', gap:20}}>
              {/* Заголовок таблицы */}
              <div className="request__card request__card-header">
                <div className="card-header_request__card__title">Корабль</div>
                <div className="card-header_request__card__photo">Фото</div>
                <div className="card-header_request__card__capacity">Вместимость</div>
                <div className="card-header_request__card__cranes">Краны</div>
                <div className="card-header_request__card__count">Количество</div>
                <div className="card-header_request__card__action">Действие</div>
              </div>
              
              {request.Ships && request.Ships.length > 0 ? (
                request.Ships.map((s) => (
                  <div key={s.Ship.ShipID} className="request__card" style={{display:'flex', flexDirection:'row', alignItems:'center', gap:20, width:1198, border:'2px solid #AA9B7D', padding: '15px 30px', borderRadius:5}}>
                    <div className="request__card__title" style={{width:148}}>{s.Ship.Name}</div>

                    <div style={{width:200, height:100, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      {s.Ship.PhotoURL ? (
                        <img className="request__card__ship-card__img"
                             src={getShipImageUrl(s.Ship.PhotoURL)}
                             style={{maxWidth:'100%', maxHeight:'100%'}}
                             alt={s.Ship.Name}
                             onError={(ev)=> { (ev.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <div style={{color:'#888'}}>Нет фото</div>
                      )}
                    </div>

                    <div style={{width:120}}>{s.Ship.Capacity ?? '-'} TEU</div>
                    <div style={{width:30}}>{s.Ship.Cranes ?? '-'}</div>
                    
                    <div style={{width:150, display:'flex', alignItems:'center', gap:10}}>
                      <button
                        type="button"
                        className="ship-card__other-btn btn"
                        onClick={() => {
                          // Уменьшаем количество кораблей на 1
                          const newCount = Math.max(1, s.ShipsCount - 1);
                          // Обновляем локальное состояние
                          updateShipCount(s.Ship.ShipID, newCount);
                        }}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}
                      >
                        -
                      </button>
                      <input
                        className="ship-card__cnt-input"
                        type="number"
                        value={s.ShipsCount}
                        onChange={(e) => {
                          const newCount = parseInt(e.target.value) || 1;
                          updateShipCount(s.Ship.ShipID, newCount);
                        }}
                        min="1"
                        style={{width:'80px', textAlign:'center'}}
                      />
                      <button
                        type="button"
                        className="ship-card__other-btn btn"
                        onClick={() => {
                          // Увеличиваем количество кораблей на 1
                          const newCount = s.ShipsCount + 1;
                          // Обновляем локальное состояние
                          updateShipCount(s.Ship.ShipID, newCount);
                        }}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}
                      >
                        +
                      </button>
                    </div>

                    <div style={{width:150, display:'flex', gap:10}}>
                      <button
                        type="button"
                        className="ship-card__other-btn btn"
                        onClick={()=> onSaveShip(s.Ship.ShipID, s.ShipsCount)}
                        style={{padding: '8px 16px', fontSize: '16px', height: 'auto'}}
                      >
                        Сохранить
                      </button>
                      <button
                        type="button"
                        className="ship-card__other-btn btn"
                        onClick={()=> onDeleteShip(s.Ship.ShipID)}
                        style={{padding: '8px 16px', fontSize: '16px', height: 'auto'}}
                      >
                        Удалить
                      </button>
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
