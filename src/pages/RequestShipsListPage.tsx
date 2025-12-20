// src/pages/RequestShipsListPage.tsx
import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { DsRequestShip } from '../api/Api'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Breadcrumbs from '../components/Breadcrumbs'
import { getToken } from '../auth'
import '../../resources/request_ship_style.css'

// Компонент для отображения списка заявок пользователя
export default function RequestShipsListPage() {
  // Состояния для хранения данных заявок, состояния загрузки и ошибок
  const [requests, setRequests] = useState<DsRequestShip[]>([])
  const [filteredRequests, setFilteredRequests] = useState<DsRequestShip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Состояния для фильтров
  const [statusFilter, setStatusFilter] = useState('')
  const [creationDateFilter, setCreationDateFilter] = useState('')
  const [completionDateFilter, setCompletionDateFilter] = useState('')

  // Проверка авторизации при монтировании компонента
  useEffect(() => {
    const token = getToken();
    if (!token) {
      // Если токен отсутствует, перенаправляем на страницу входа
      navigate('/login');
      return;
    }
    
    // Установка токена в заголовки API для авторизованных запросов
    api.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
  }, [navigate]);

  // Эффект для загрузки списка заявок пользователя
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Проверяем токен перед запросами
        const token = getToken();
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Получаем данные профиля текущего пользователя
        const userProfileResponse = await api.api.usersProfileList()
        
        // Получаем все заявки через кодогенерацию API
        const response = await api.api.requestShipList()
        
        // Фильтруем заявки по текущему пользователю
        const userRequests = response.data.filter(request => {
          // Нормализация названий полей для заявки
          const userId = request.userID || (request as any).UserID || (request as any).user_id || (request as any).userId;
          
          // Проверяем правильное поле для userID в данных профиля (нормализация названий)
          const profileUserId = userProfileResponse.data.userID ||
                                (userProfileResponse.data as any).UserID ||
                                (userProfileResponse.data as any).UserId
          
          // Возвращаем только заявки текущего пользователя
          return userId === profileUserId;
        })
        
        setRequests(userRequests)
        setFilteredRequests(userRequests)
        setLoading(false)
      } catch (err: any) {
        // Если ошибка авторизации, перенаправляем на страницу входа
        if (err?.response?.status === 401) {
          navigate('/login');
          return;
        }
        
        setError(err?.response?.data?.detail || err?.message || 'Ошибка загрузки заявок')
        setLoading(false)
      }
    }

    // Проверяем токен перед загрузкой заявок
    const token = getToken();
    if (token) {
      fetchRequests();
    }
  }, [navigate])

  // Функция для определения, является ли заявка черновиком
  const isDraft = (status: string) => {
    const normalizedStatus = status?.toLowerCase().trim();
    return normalizedStatus === 'черновик' || normalizedStatus === 'draft';
  };

  // Функция для определения, удалена ли заявка
  const isDeleted = (status: string) => {
    const normalizedStatus = status?.toLowerCase().trim();
    return normalizedStatus === 'удалена' || normalizedStatus === 'deleted';
  };

  // Функция для обработки нажатия на кнопку "Открыть"
  const handleOpenRequest = (requestId: number) => {
    navigate(`/request_ship/${requestId}`);
  };

  // Функция для применения фильтров
  const applyFilters = () => {
    let result = [...requests];

    // Фильтр по статусу (исключаем черновики и удаленные)
    result = result.filter(request => {
      const status = request.status || (request as any).Status || 'Не указан';
      return !isDraft(status) && !isDeleted(status);
    });

    // Фильтр по статусу
    if (statusFilter) {
      result = result.filter(request => {
        const status = request.status || (request as any).Status || '';
        return status.toLowerCase().includes(statusFilter.toLowerCase());
      });
    }

    // Фильтр по дате создания
    if (creationDateFilter) {
      result = result.filter(request => {
        const creationDate = request.creationDate || (request as any).CreationDate || (request as any).created_at;
        if (!creationDate) return false;
        const requestDate = new Date(creationDate);
        const filterDate = new Date(creationDateFilter);
        return requestDate.toDateString() === filterDate.toDateString();
      });
    }

    // Фильтр по дате оформления (завершения)
    if (completionDateFilter) {
      result = result.filter(request => {
        const completionDate = request.completionDate || (request as any).CompletionDate || (request as any).completed_at;
        if (!completionDate) return false;
        const requestDate = new Date(completionDate);
        const filterDate = new Date(completionDateFilter);
        return requestDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredRequests(result);
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
        
        {/* Фильтры */}
        <div className="request__filters">
          <div className="filter-item">
            <label>Статус:</label>
            <input
              type="text"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="Введите статус"
            />
          </div>
          <div className="filter-item">
            <label>Дата создания:</label>
            <input
              type="date"
              value={creationDateFilter}
              onChange={(e) => setCreationDateFilter(e.target.value)}
            />
          </div>
          <div className="filter-item">
            <label>Дата оформления:</label>
            <input
              type="date"
              value={completionDateFilter}
              onChange={(e) => setCompletionDateFilter(e.target.value)}
            />
          </div>
          <button className="btn btn-active" onClick={applyFilters}>Показать</button>
        </div>
        
        {/* Отображение сообщения, если у пользователя нет заявок */}
        {filteredRequests.length === 0 ? (
          <p>У вас пока нет заявок.</p>
        ) : (
          
          <div className="request__cards">
            {/* Заголовок таблицы */}
            <div className="request__card request__card-header">
              <div className="request__card__title">№</div>
              <div className="request__card__20ft">20 футов</div>
              <div className="request__card__40ft">40 футов</div>
              <div className="request__card__status">Статус</div>
              <div className="request__card__creation-date">Дата создания</div>
              <div className="request__card__completion-date">Дата оформления</div>
              <div className="request__card__result">Результат</div>
            </div>
            
            {filteredRequests.map((request) => {
              // Нормализация названий полей для отображения
              const requestId = request.requestShipID || (request as any).RequestShipID || (request as any).request_ship_id || (request as any).id;
              const status = request.status || (request as any).Status || 'Не указан';
              const creationDate = request.creationDate || (request as any).CreationDate || (request as any).created_at || 'Не указана';
              const completionDate = request.completionDate || (request as any).CompletionDate || (request as any).completed_at || 'Не завершена';
              const containers20 = (request as any).containers20 || (request as any).containers20ftCount || (request as any).containers_20ft_count || 0;
              const containers40 = (request as any).containers40 || (request as any).containers40ftCount || (request as any).containers_40ft_count || 0;
              const resultTime = request.loadingTime || (request as any).LoadingTime || (request as any).loading_time || 0;
              
              // Проверяем, является ли заявка черновиком
              const isRequestDraft = isDraft(status);
              
              return (
                <div className="request__card" key={requestId}>
                  <div className="request__card__title">{requestId}</div>
                  <div className="request__card__20ft">{containers20}</div>
                  <div className="request__card__40ft">{containers40}</div>
                  <div className="request__card__status">{status}</div>
                  <div className="request__card__creation-date">
                    {creationDate ? new Date(creationDate).toLocaleDateString('ru-RU') : 'Не указана'}
                  </div>
                  <div className="request__card__completion-date">
                    {completionDate && new Date(completionDate).toString() !== 'Invalid Date' ? new Date(completionDate).toLocaleDateString('ru-RU') : 'нет'}
                  </div>
                  <div className="request__card__result">{resultTime}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  )
}