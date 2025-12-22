// src/hooks/useRequestShipsPolling.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { DsRequestShip } from '../api/Api';
import { getToken } from '../auth';

// Тип для функции обновления заявок
type UpdateRequestsCallback = (requests: DsRequestShip[]) => void;

/**
 * Хук для реализации short polling получения списка заявок
 * @param interval - интервал опроса в миллисекундах (по умолчанию 5000 мс = 5 секунд)
 */
export const useRequestShipsPolling = (interval: number = 5000) => {
  const [requests, setRequests] = useState<DsRequestShip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Функция для нормализации статуса заявки
  const normalizeStatus = (status: string) => {
    return status?.toLowerCase().trim();
  };

  // Функция для определения, является ли заявка черновиком
  const isDraft = (status: string) => {
    const normalizedStatus = normalizeStatus(status);
    return normalizedStatus === 'черновик' || normalizedStatus === 'draft';
  };

  // Функция для определения, удалена ли заявка
  const isDeleted = (status: string) => {
    const normalizedStatus = normalizeStatus(status);
    return normalizedStatus === 'удалена' || normalizedStatus === 'deleted';
  };

  // Функция для получения заявок с бэкенда
  const fetchRequests = useCallback(async (updateCallback?: UpdateRequestsCallback) => {
    try {
      // Проверяем токен перед запросами
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token');
      }
      
      // Получаем данные профиля текущего пользователя
      const userProfileResponse = await api.api.usersProfileList();
      
      const role =
        userProfileResponse.data.role ||
        (userProfileResponse.data as any).Role ||
        (userProfileResponse.data as any).role_name;
      
      setUserRole(role);
      
      // Получаем все заявки через кодогенерацию API
      const response = await api.api.requestShipList();
      
      // Для оператора порта отображаем все заявки, для других пользователей - только свои
      let userRequests = [];
      if (role === "port_operator") {
        // Для оператора порта отображаем все заявки
        userRequests = response.data;
      } else {
        // Для других пользователей фильтруем по текущему пользователю
        userRequests = response.data.filter(request => {
          // Нормализация названий полей для заявки
          const userId = request.userID || (request as any).UserID || (request as any).user_id || (request as any).userId;
          
          // Проверяем правильное поле для userID в данных профиля (нормализация названий)
          const profileUserId = userProfileResponse.data.userID ||
                                (userProfileResponse.data as any).UserID ||
                                (userProfileResponse.data as any).UserId;
          
          // Возвращаем только заявки текущего пользователя
          return userId === profileUserId;
        });
      }
      
      // Фильтруем заявки - не отображаем черновики
      const filteredUserRequests = userRequests.filter(request => {
        const status = request.status || (request as any).Status || 'Не указан';
        return !isDraft(status) && !isDeleted(status) && status.toLowerCase() !== 'черновик';
      });
      
      // Обновляем состояние или вызываем callback
      if (updateCallback) {
        updateCallback(filteredUserRequests);
      } else {
        setRequests(filteredUserRequests);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      const errorMessage = err?.response?.data?.detail || err?.message || 'Ошибка загрузки заявок';
      setError(errorMessage);
      
      // Если ошибка авторизации, возможно нужно перенаправить на страницу входа
      // Но это должен обрабатывать компонент, использующий хук
    }
  }, []);

  // Эффект для запуска polling
  useEffect(() => {
    // Устанавливаем токен в заголовки API для авторизованных запросов
    const token = getToken();
    if (token) {
      api.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Начальная загрузка
    const loadInitialData = async () => {
      setLoading(true);
      await fetchRequests();
      setLoading(false);
    };
    
    loadInitialData();
    
    // Запуск polling
    const pollingInterval = setInterval(() => {
      fetchRequests((newRequests) => {
        // Обновляем только если данные изменились
        setRequests(prevRequests => {
          // Сравниваем по длине и по ID/status каждой заявки
          if (prevRequests.length !== newRequests.length) {
            return newRequests;
          }
          
          // Проверяем каждую заявку на изменения
          for (let i = 0; i < prevRequests.length; i++) {
            const prev = prevRequests[i];
            const current = newRequests[i];
            
            if (prev.requestShipID !== current.requestShipID || 
                (prev.status || '') !== (current.status || '') ||
                (prev.formationDate || '') !== (current.formationDate || '')) {
              // Найдены изменения
              return newRequests;
            }
          }
          
          // Изменений нет, возвращаем предыдущее состояние
          return prevRequests;
        });
      });
    }, interval);
    
    // Очистка при размонтировании
    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchRequests, interval]);

  return { requests, loading, error, userRole, refetch: fetchRequests };
};