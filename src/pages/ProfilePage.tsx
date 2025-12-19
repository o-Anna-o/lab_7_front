// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { isLoggedIn } from '../auth'
import Navbar from '../components/Navbar'
import Breadcrumbs from '../components/Breadcrumbs'
import { useNavigate } from 'react-router-dom'
import '../../resources/request_ship_style.css'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // перенаправление на авторизацию
    if (!isLoggedIn()) {
      navigate('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        
        const res = await api.api.usersProfileList()
        
        // Детальная нормализация полей данных пользователя
        const userData = res.data;
        
        const fio = userData?.fio ||
                  (userData as any)?.FIO ||
                  (userData as any)?.fullName ||
                  (userData as any)?.full_name ||
                  (userData as any)?.firstName ||
                  (userData as any)?.first_name ||
                  '';
                  
        const login = userData?.login ||
                    (userData as any)?.Login ||
                    (userData as any)?.userLogin ||
                    (userData as any)?.username ||
                    (userData as any)?.userName ||
                    '';
                    
        const role = userData?.role ||
                   (userData as any)?.Role ||
                   (userData as any)?.userRole ||
                   (userData as any)?.user_role ||
                   '';
                   
        const contacts = userData?.contacts ||
                        (userData as any)?.Contacts ||
                        (userData as any)?.contact ||
                        (userData as any)?.contactInfo ||
                        (userData as any)?.contact_info ||
                        '';
                        
        const cargoWeight = userData?.cargoWeight ||
                             (userData as any)?.CargoWeight ||
                             (userData as any)?.cargo_weight ||
                             (userData as any)?.weight ||
                             (userData as any)?.cargo ||
                             0;
                             
        const containers20ftCount = userData?.containers20ftCount ||
                                    (userData as any)?.Containers20ftCount ||
                                    (userData as any)?.containers_20ft_count ||
                                    (userData as any)?.count20 ||
                                    (userData as any)?.container20Count ||
                                    0;
                                    
        const containers40ftCount = userData?.containers40ftCount ||
                                    (userData as any)?.Containers40ftCount ||
                                    (userData as any)?.containers_40ft_count ||
                                    (userData as any)?.count40 ||
                                    (userData as any)?.container40Count ||
                                    0;
        
        const normalizedUser = {
          fio,
          login,
          role,
          contacts,
          cargoWeight,
          containers20ftCount,
          containers40ftCount,
        };
        
        
        setUser(normalizedUser)
      } catch (err: any) {
        
        setError(err?.message || 'Ошибка при загрузке профиля')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [navigate])

  const handleSave = async () => {
    try {
      
      
      // Подготавливаем данные для отправки в формате API
      const userDataToSend = {
        fio: user?.fio || '',
        login: user?.login || '',
        role: user?.role || '',
        contacts: user?.contacts || '',
        cargoWeight: user?.cargoWeight || 0,
        containers20ftCount: user?.containers20ftCount || 0,
        containers40ftCount: user?.containers40ftCount || 0,
      };
      
      
      
      // Используем кодогенерацию для обновления профиля
      const response = await api.api.usersProfileUpdate(userDataToSend);
      
      
      // После сохранения выходим из режима редактирования
      setIsEditing(false);
      
      // Показываем сообщение об успешном сохранении
      alert('Данные успешно сохранены!');
    } catch (err: any) {
      
      if (err.response) {
        
        
      }
      alert('Ошибка при сохранении данных: ' + (err?.message || 'Неизвестная ошибка'));
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setUser((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return <div>Загрузка профиля...</div>
  if (error) return <div style={{ color: 'red' }}>{error}</div>

  return (
    <>
      <Navbar />
      <Breadcrumbs />

      <div className="request" style={{ width: '1200px', padding: '30px' }}>
        <h2>Личный кабинет</h2>
        
        <div className="request__cnt">
          <div className="fields_item">
            <p><strong>ФИО:</strong></p>
            {isEditing ? (
              <input
                className="request__cnt-input"
                value={user?.fio || ''}
                onChange={(e) => handleInputChange('fio', e.target.value)}
              />
            ) : (
              <p>{user?.fio || 'Не указано'}</p>
            )}
          </div>
          
          <div className="fields_item">
            <p><strong>Логин:</strong></p>
            {isEditing ? (
              <input
                className="request__cnt-input"
                value={user?.login || ''}
                onChange={(e) => handleInputChange('login', e.target.value)}
              />
            ) : (
              <p>{user?.login || 'Не указано'}</p>
            )}
          </div>
          
          <div className="fields_item">
            <p><strong>Роль:</strong></p>
            {isEditing ? (
              <input
                className="request__cnt-input"
                value={user?.role || ''}
                onChange={(e) => handleInputChange('role', e.target.value)}
              />
            ) : (
              <p>{user?.role || 'Не указана'}</p>
            )}
          </div>
          
          <div className="fields_item">
            <p><strong>Контакты:</strong></p>
            {isEditing ? (
              <input
                className="request__cnt-input"
                value={user?.contacts || ''}
                onChange={(e) => handleInputChange('contacts', e.target.value)}
              />
            ) : (
              <p>{user?.contacts || 'Не указаны'}</p>
            )}
          </div>
          
          <div className="fields_item">
            <p><strong>Вес груза:</strong></p>
            {isEditing ? (
              <input
                className="request__cnt-input"
                type="number"
                value={user?.cargoWeight || 0}
                onChange={(e) => handleInputChange('cargoWeight', Number(e.target.value))}
              />
            ) : (
              <p>{user?.cargoWeight || 0}</p>
            )}
          </div>
          
          <div className="fields_item">
            <p><strong>Контейнеры 20ft:</strong></p>
            {isEditing ? (
              <input
                className="request__cnt-input"
                type="number"
                value={user?.containers20ftCount || 0}
                onChange={(e) => handleInputChange('containers20ftCount', Number(e.target.value))}
              />
            ) : (
              <p>{user?.containers20ftCount || 0}</p>
            )}
          </div>
          
          <div className="fields_item">
            <p><strong>Контейнеры 40ft:</strong></p>
            {isEditing ? (
              <input
                className="request__cnt-input"
                type="number"
                value={user?.containers40ftCount || 0}
                onChange={(e) => handleInputChange('containers40ftCount', Number(e.target.value))}
              />
            ) : (
              <p>{user?.containers40ftCount || 0}</p>
            )}
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
          {isEditing ? (
            <>
              <button className="btn btn-active" onClick={handleSave} style={{ marginRight: '20px' }}>
                Сохранить
              </button>
              <button
                className="btn btn-inactive"
                onClick={() => setIsEditing(false)}
                style={{ backgroundColor: '#3A3A3A', border: '2px solid #AA9B7D' }}
              >
                Отмена
              </button>
            </>
          ) : (
            <button
              className="btn btn-active"
              onClick={() => setIsEditing(true)}
            >
              Редактировать
            </button>
          )}
        </div>
      </div>
    </>
  )
}
