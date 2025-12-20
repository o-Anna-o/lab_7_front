// src/pages/RequestShipsListPage.tsx
import React, { useEffect } from 'react'
import { DsRequestShip } from '../api/Api'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Breadcrumbs from '../components/Breadcrumbs'
import { getToken } from '../auth'
import '../../resources/request_ship_style.css'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getUserRequestShipsThunk } from '../store/slices/requestShipSlice'

// Компонент для отображения списка заявок пользователя
export default function RequestShipsListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  // Получаем данные из Redux store
  const { userRequests: requests, loading, error } = useAppSelector(state => state.requestShip);

  // Проверка авторизации при монтировании компонента
  useEffect(() => {
    const token = getToken();
    if (!token) {
      // Если токен отсутствует, перенаправляем на страницу входа
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Эффект для загрузки списка заявок пользователя
  useEffect(() => {
    // Проверяем токен перед загрузкой заявок
    const token = getToken();
    if (token) {
      dispatch(getUserRequestShipsThunk());
    }
  }, [dispatch]);

  // Функция для определения, является ли заявка черновиком
  const isDraft = (status: string) => {
    const normalizedStatus = status?.toLowerCase().trim();
    return normalizedStatus === 'черновик' || normalizedStatus === 'draft';
  };

  // Функция для обработки нажатия на кнопку "Открыть"
  const handleOpenRequest = (requestId: number) => {
    navigate(`/request_ship/${requestId}`);
  };

  // Отображение состояния загрузки
  if (loading) return <div className="loading">Загрузка...</div>
  // Отображение ошибки, если она произошла
  if (error) return <div className="error">Ошибка: {error}</div>

  return (
    <>
      <Navbar />
      <Breadcrumbs />
      
      <div className="request">
        <h1>Мои заявки</h1>
        
        {/* Отображение сообщения, если у пользователя нет заявок */}
        {requests.length === 0 ? (
          <p>У вас пока нет заявок.</p>
        ) : (
          
          <div className="request__cards">
            {requests.map((request) => {
              // Нормализация названий полей для отображения
              const requestId = request.requestShipID || (request as any).RequestShipID || (request as any).request_ship_id || (request as any).id;
              const status = request.status || (request as any).Status || 'Не указан';
              const creationDate = request.creationDate || (request as any).CreationDate || (request as any).created_at || 'Не указана';
              const completionDate = request.completionDate || (request as any).CompletionDate || (request as any).completed_at || 'Не завершена';
              
              // Проверяем, является ли заявка черновиком
              const isRequestDraft = isDraft(status);
              
              return (
                <div className="request__card" key={requestId}>
                  <div className="request__card__title">
                    <p>Заявка №{requestId}</p>
                  </div>
                  <div className="request__card__status">
                    <p>Статус: {status}</p>
                  </div>
                  <div className="request__card__creation-date">
                    <p>Создана: {creationDate ? new Date(creationDate).toLocaleDateString('ru-RU') : 'Не указана'}</p>
                  </div>
                  <div className="request__card__completion-date">
                    <p>Завершена: {completionDate && new Date(completionDate).toString() !== 'Invalid Date' ? new Date(completionDate).toLocaleDateString('ru-RU') : 'нет'}</p>
                  </div>
                  <div className="request__card__open-button">
                    
                    <button
                      className="btn btn-inactive"
                      onClick={() => handleOpenRequest(requestId)}
                      disabled={!isRequestDraft}
                    >
                      Открыть
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  )
}