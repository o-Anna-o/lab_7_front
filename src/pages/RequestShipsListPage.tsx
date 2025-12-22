// src/pages/RequestShipsListPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Breadcrumbs from '../components/Breadcrumbs'
import { getToken } from '../auth'
import '../../resources/request_ship_style.css'
import { completeRequestShip } from '../apii'
import { useRequestShipsPolling } from '../hooks/useRequestShipsPolling'
import { DsRequestShip } from '../api/Api'

// Компонент для отображения списка заявок пользователя
export default function RequestShipsListPage() {
  // Используем хук для short polling
  const { requests, loading, error, userRole, refetch } = useRequestShipsPolling(5000); // 5 секунд
  const [filteredRequests, setFilteredRequests] = useState<DsRequestShip[]>([])
  const [notification, setNotification] = useState<{message: string, type: string} | null>(null);
  const navigate = useNavigate()

  // Состояния для фильтров
  const [statusFilter, setStatusFilter] = useState('')
  const [creationDateFilter, setCreationDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [formationDateFilter, setFormationDateFilter] = useState('')
  const [userFilter, setUserFilter] = useState('') // Новый фильтр по создателю
  const [userOptions, setUserOptions] = useState<string[]>([]) // Список логинов пользователей

  // Проверка авторизации при монтировании компонента
  useEffect(() => {
    const token = getToken();
    if (!token) {
      // Если токен отсутствует, перенаправляем на страницу входа
      navigate('/login');
    }
  }, [navigate]);

  // Обновление списка пользователей при изменении заявок
  useEffect(() => {
    // Получаем список уникальных ID пользователей из нe удаленных заявок
    const uniqueUserIds = Array.from(new Set(requests
      .filter(request => request.user?.userID)
      .map(request => request.user!.userID!.toString())));
    setUserOptions(uniqueUserIds);
  }, [requests]);

  // Функция для показа уведомления
  const showNotification = (message: string, type: string = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000); // Скрыть уведомление через 3 секунды
  };

  // Эффект для применения фильтров по умолчанию при загрузке
  useEffect(() => {
    if (requests.length > 0) {
      applyFilters();
    }
  }, [requests]);

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

  // Функция для применения фильтров
  const applyFilters = () => {
    let result = [...requests];

    // Фильтр по статусу
    if (statusFilter) {
      result = result.filter(request => {
        const status = request.status || (request as any).Status || '';
        return status.toLowerCase().includes(statusFilter.toLowerCase());
      });
    }

    // Фильтр по статусу (исключаем черновики и удаленные)
    result = result.filter(request => {
      const status = request.status || (request as any).Status || 'Не указан';
      return !isDraft(status) && !isDeleted(status);
    });

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

    // Фильтр по дате оформления
    if (formationDateFilter) {
      result = result.filter(request => {
        const formationDate = request.formationDate || (request as any).FormationDate || (request as any).completed_at;
        if (!formationDate) return false;
        const requestDate = new Date(formationDate);
        const filterDate = new Date(formationDateFilter);
        return requestDate.toDateString() === filterDate.toDateString();
      });
    }

    // Фильтр по создателю (ID пользователя)
    if (userFilter) {
      result = result.filter(request => {
        const userId = request.user?.userID?.toString() || (request as any).User?.userID?.toString() || '';
        return userId.includes(userFilter);
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
        <h1>{userRole === "port_operator" ? "Все заявки" : "Мои заявки"}</h1>
        
        {/* Фильтры */}
        <div className="request__filters">
          <div className="filter-item">
            <label>Статус:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Все статусы</option>
              <option value="сформирован">Сформирован</option>
              <option value="завершен">Завершен</option>
              <option value="отклонен">Отклонен</option>
            </select>
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
            <label>Дата формирования:</label>
            <input
              type="date"
              value={formationDateFilter}
              onChange={(e) => setFormationDateFilter(e.target.value)}
            />
          </div>
          {userRole === "port_operator" && (
            <div className="filter-item">
              <label>Создатель:</label>
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="">Все создатели</option>
                {userOptions.map(id => (
                  <option key={id} value={id}>{id}</option>
                ))}
              </select>
            </div>
          )}
          <button className="show_btn btn btn-active" onClick={applyFilters}>Показать</button>
        </div>
        
        {/* Отображение сообщения, если у пользователя нет заявок */}
        {filteredRequests.length === 0 ? (
          <p>У вас пока нет заявок.</p>
        ) : (
          
          <div className="request__cards">
            {/* Заголовок таблицы */}
            <div className={`request__card request__card-header ${userRole === "port_operator" ? "port-operator" : ""}`}>
              <div className={`card-header_request__card__title ${userRole === "port_operator" ? "port-operator" : ""}`}>№</div>
              <div className={`card-header_request__card__20ft ${userRole === "port_operator" ? "port-operator" : ""}`}>20 футов</div>
              <div className={`card-header_request__card__40ft ${userRole === "port_operator" ? "port-operator" : ""}`}>40 футов</div>
              <div className={`card-header_request__card__status ${userRole === "port_operator" ? "port-operator" : ""}`}>Статус</div>
              <div className={`card-header_request__card__creation-date ${userRole === "port_operator" ? "port-operator" : ""}`}>Дата создания</div>
              <div className={`card-header_request__card__formation-date ${userRole === "port_operator" ? "port-operator" : ""}`}>Дата оформления</div>
              <div className={`card-header_request__card__result ${userRole === "port_operator" ? "port-operator" : ""}`}>Результат</div>
              {userRole === "port_operator" && (
                <div className={`card-header_request__card__actions ${userRole === "port_operator" ? "port-operator" : ""}`}>Действие</div>
              )}
            </div>
            
            {filteredRequests.map((request) => {
              // Нормализация названий полей для отображения
              const requestId = request.requestShipID || (request as any).RequestShipID || (request as any).request_ship_id || (request as any).id;
              const status = request.status || (request as any).Status || 'Не указан';
              const creationDate = request.creationDate || (request as any).CreationDate || (request as any).created_at || 'Не указана';
              const formationDate = request.formationDate || (request as any).FormationDate || (request as any).completed_at || 'Не завершена';
              const containers20 = request.containers20ftCount || (request as any).Containers20ftCount || (request as any).containers_20ft_count || (request as any).containers20 || 0;
              const containers40 = request.containers40ftCount || (request as any).Containers40ftCount || (request as any).containers_40ft_count || (request as any).containers40 || 0;
              const resultTime = (status.toLowerCase() === "сформирован") ? 0 : (request.loadingTime || (request as any).LoadingTime || (request as any).loading_time || 0);
                           
              // Проверяем, является ли заявка черновиком
              const isRequestDraft = isDraft(status);

              
              return (
                <div className={`request__card ${userRole === "port_operator" ? "port-operator" : ""}`} key={requestId}>
                <div className={`request__card__title ${userRole === "port_operator" ? "port-operator" : ""}`}>{requestId}</div>
                <div className={`request__card__20ft ${userRole === "port_operator" ? "port-operator" : ""}`}>{containers20}</div>
                <div className={`request__card__40ft ${userRole === "port_operator" ? "port-operator" : ""}`}>{containers40}</div>
                <div className={`request__card__status ${userRole === "port_operator" ? "port-operator" : ""}`}>{status}</div>
                <div className={`request__card__creation-date ${userRole === "port_operator" ? "port-operator" : ""}`}>
                  {creationDate ? new Date(creationDate).toLocaleDateString('ru-RU') : 'Не указана'}
                </div>
                <div className={`request__card__formation-date ${userRole === "port_operator" ? "port-operator" : ""}`}>
                  {formationDate ? new Date(formationDate).toLocaleDateString('ru-RU') : 'нет'}
                </div>
                <div className={`request__card__result ${userRole === "port_operator" ? "port-operator" : ""}`}>{resultTime}</div>

                
                {userRole === "port_operator" && (
                  <div className={`request__card__actions ${userRole === "port_operator" ? "port-operator" : ""}`}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      {status.toLowerCase() === "сформирован" ? (
                        <>
                          <button
                            className="btn btn-success"
                            onClick={async () => {
                              try {
                                console.log("Completing request:", requestId, "action: complete");
                                await completeRequestShip(requestId, "complete");
                                showNotification("Заявка завершена, расчёт запущен");
                                refetch(); // обновляем список через polling
                              } catch (e: any) {
                                console.error("Ошибка завершения заявки:", e);
                                console.error("Ошибка завершения заявки: " + (e.message || e));
                              }
                            }}
                          >
                            Завершить
                          </button>

                          <button
                            className="btn btn-danger"
                            onClick={async () => {
                              try {
                                console.log("Rejecting request:", requestId, "action: reject");
                                await completeRequestShip(requestId, "reject");
                                showNotification("Заявка отклонена");
                                refetch(); // обновляем список через polling
                              } catch (e: any) {
                                console.error("Ошибка отклонения заявки:", e);
                                console.error("Ошибка отклонения заявки: " + (e.message || e));
                              }
                            }}
                          >
                            Отклонить
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-active"
                          style={{ width: "150px" }}
                          onClick={async () => {
                            const newStatus = prompt("Введите новый статус для заявки:", status);
                            if (newStatus !== null && newStatus !== status) {
                              try {
                                // Создаем объект с текущими значениями полей заявки
                                const updateData = {
                                  comment: request.comment || "",
                                  containers_20ft_count: request.containers20ftCount || 0,
                                  containers_40ft_count: request.containers40ftCount || 0,
                                  status: newStatus
                                };
                                
                                // Отправляем запрос на обновление заявки
                                await completeRequestShip(requestId, "update", updateData);
                                
                                showNotification("Статус заявки обновлён");
                                refetch(); // обновляем список через polling
                              } catch (e: any) {
                                console.error("Ошибка обновления статуса заявки:", e);
                                console.error("Ошибка обновления статуса заявки: " + (e.message || e));
                              }
                            }
                          }}
                        >
                          Изменить
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  )
}