// Импортируем необходимые функции из Redux Toolkit
import { createAsyncThunk } from "@reduxjs/toolkit";
// Импортируем API для взаимодействия с сервером
import { api } from "../../api";

// Thunk для получения списка кораблей
export const fetchShipsThunk = createAsyncThunk(
  'ships/fetchShips',
  async (params: any, { rejectWithValue }) => {
    try {
      // Реализация через API сервера
      const response = await api.api.shipsList(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка загрузки кораблей');
    }
  }
);

// Thunk для добавления корабля в заявку
export const addShipToRequestThunk = createAsyncThunk(
  'ships/addShipToRequest',
  async (shipId: number, { rejectWithValue }) => {
    try {
      // Реализация через API сервера
      const response = await api.api.shipsAddToShipBucketCreate(shipId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка добавления корабля в заявку');
    }
  }
);

// Thunk для удаления корабля из заявки
export const removeShipFromRequestThunk = createAsyncThunk(
  'ships/removeShipFromRequest',
  async ({ requestId, shipId }: { requestId: number | string; shipId: number | string }, { rejectWithValue }) => {
    try {
      // Реализация через API сервера
      const response = await api.api.requestShipShipsDelete(Number(requestId), Number(shipId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка удаления корабля из заявки');
    }
  }
);
