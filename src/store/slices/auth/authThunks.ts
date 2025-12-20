import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../../api';
import { saveToken, clearToken } from '../../../auth';
import { loginSuccess, loginFailure, registerFailure } from './authSlice';

// Асинхронный thunk для входа пользователя
export const loginUserShipThunk = createAsyncThunk(
  'auth/login',
  async (
    credentials: { login: string; password: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.api.usersLoginCreate(credentials);
      
      const token =
        (response.data as any)?.token ||
        (response.data as any)?.access_token ||
        (response.data as any)?.jwt;

      if (!token) {
        throw new Error('Токен не получен');
      }

      // Сохраняем токен в localStorage
      saveToken(token);

      // Получаем данные пользователя
      const profileResponse = await api.api.usersProfileList();
      const user = profileResponse.data;

      // Диспатчим успешный вход с пользователем и токеном
      dispatch(loginSuccess({ user, token }));
      
      return { user, token };
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        'Ошибка входа';
      
      // Диспатчим ошибку входа
      dispatch(loginFailure(errorMessage));
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Асинхронный thunk для регистрации пользователя
export const registerUserShipThunk = createAsyncThunk(
  'auth/register',
  async (
    userData: { fio: string; login: string; password: string; role: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await api.api.usersRegisterCreate(userData);
      
      // При успешной регистрации возвращаем данные пользователя
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        'Ошибка регистрации';
      
      // Диспатчим ошибку регистрации
      dispatch(registerFailure(errorMessage));
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Асинхронный thunk для выхода пользователя
export const logoutUserShipThunk = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Вызываем API для выхода
      await api.api.usersLogoutCreate();
    } catch (error) {
      // Даже если API вызов не удался, мы все равно очищаем токен
      console.error('Ошибка при выходе:', error);
    } finally {
      // Очищаем токен из localStorage
      clearToken();
      
      // Здесь нет необходимости диспатчить logout, так как это будет сделано в компоненте
    }
  }
);