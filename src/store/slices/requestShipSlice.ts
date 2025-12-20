// Импортируем необходимые функции из Redux Toolkit
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Импортируем API для взаимодействия с сервером
import { api } from "../../api";
// Импортируем тип контента для указания формата данных
import { ContentType } from "../../api/Api";
import { DsRequestShip } from "../../api/Api";
import axios from "axios";
import { getToken } from "../../auth";

// AsyncThunk для отправки запроса на формирование заявки
export const formRequestShipThunk = createAsyncThunk(
  "requestShip/form",
  async (
    // Определяем тип данных, которые будут передаваться в thunk
    data: {
      id: number;
      containers20: number;
      containers40: number;
      comment: string;
    },
    thunkAPI
  ) => {
    try {
      // Выполняем запрос к API для обновления данных о формировании заявки
      await api.api.requestShipFormationUpdate(
        data.id,
        {
          // Указываем, что запрос защищенный (требует авторизации)
          secure: true,
          // Указываем тип контента как JSON
          type: ContentType.Json,
          // Формируем тело запроса с данными о контейнерах и комментарии
          body: {
            // Передаем количество 20-футовых контейнеров
            containers_20ft: data.containers20,
            // Передаем количество 40-футовых контейнеров
            containers_40ft: data.containers40,
            // Передаем комментарий
            comment: data.comment,
          },
        } as any
      );

      // Возвращаем true в случае успешного выполнения запроса
      return true;
    } catch (e: any) {
      // В случае ошибки возвращаем отклоненное значение с сообщением об ошибке
      return thunkAPI.rejectWithValue(e?.message || "Ошибка формирования");
    }
  }
);

// AsyncThunk для получения корзины заявок
export const getRequestShipBasketThunk = createAsyncThunk(
  "requestShip/basket",
  async (_, thunkAPI) => {
    try {
      // Выполняем запрос к API для получения корзины заявок через кодогенерацию
      const response = await api.api.requestShipBasketList({
        // Указываем, что запрос защищенный (требует авторизации)
        secure: true,
      });

      // Возвращаем данные корзины
      return response.data;
    } catch (e: any) {
      // В случае ошибки возвращаем отклоненное значение с сообщением об ошибке
      return thunkAPI.rejectWithValue(e?.message || "Ошибка получения корзины");
    }
  }
);

// AsyncThunk для получения списка заявок пользователя
export const getUserRequestShipsThunk = createAsyncThunk(
  "requestShip/userRequests",
  async (_, thunkAPI) => {
    try {
      // Получаем данные профиля текущего пользователя
      const userProfileResponse = await api.api.usersProfileList({
        // Указываем, что запрос защищенный (требует авторизации)
        secure: true,
      });
      
      // Получаем все заявки через кодогенерацию API
      const response = await api.api.requestShipList({}, {
        // Указываем, что запрос защищенный (требует авторизации)
        secure: true,
      });
      
      // Фильтруем заявки по текущему пользователю
      const userRequests = response.data.filter(request => {
        // Нормализация названий полей для заявки
        const userId = request.userID || (request as any).UserID || (request as any).user_id || (request as any).userId;
        
        // Проверяем правильное поле для userID в данных профиля (нормализация названий)
        const profileUserId = userProfileResponse.data.userID ||
                              (userProfileResponse.data as any).UserID ||
                              (userProfileResponse.data as any).UserId;
        
        // Возвращаем только заявки текущего пользователя
        return userId === profileUserId;
      });
      
      // Возвращаем список заявок пользователя
      return userRequests;
    } catch (e: any) {
      // В случае ошибки возвращаем отклоненное значение с сообщением об ошибке
      return thunkAPI.rejectWithValue(e?.message || "Ошибка получения заявок");
    }
  }
);

// Определяем интерфейс состояния для слайса заявок на корабли
interface RequestShipState {
  // Флаг загрузки для отслеживания состояния выполнения запроса
  loading: boolean;
  // Сообщение об ошибке
  error: string | null;
  // Данные корзины
  basket: any | null;
  // Список заявок пользователя
  userRequests: DsRequestShip[];
}

// Инициализируем начальное состояние
const initialState: RequestShipState = {
  // По умолчанию загрузка не выполняется
  loading: false,
  // По умолчанию ошибок нет
  error: null,
  // По умолчанию корзина пуста
  basket: null,
  // По умолчанию список заявок пуст
  userRequests: [],
};

// Создаем слайс для управления состоянием заявок на корабли
const requestShipSlice = createSlice({
  // Указываем имя слайса
  name: "requestShip",
  // Передаем начальное состояние
  initialState,
  // Определяем редьюсеры (в данном случае пустой объект, так как все действия асинхронные)
  reducers: {},
  // Определяем обработчики для extraReducers (асинхронных действий)
  extraReducers: (builder) => {
    // Обрабатываем состояние ожидания для thunk формирования заявки
    builder.addCase(formRequestShipThunk.pending, (state) => {
      // Устанавливаем флаг загрузки в true
      state.loading = true;
      // Очищаем ошибки
      state.error = null;
    });
    // Обрабатываем успешное выполнение thunk формирования заявки
    builder.addCase(formRequestShipThunk.fulfilled, (state) => {
      // Сбрасываем флаг загрузки в false
      state.loading = false;
      // Очищаем ошибки
      state.error = null;
    });
    // Обрабатываем ошибку выполнения thunk формирования заявки
    builder.addCase(formRequestShipThunk.rejected, (state, action) => {
      // Сбрасываем флаг загрузки в false
      state.loading = false;
      // Устанавливаем сообщение об ошибке
      state.error = action.payload as string || "Ошибка формирования заявки";
    });
    
    // Обрабатываем состояние ожидания для thunk получения корзины заявок
    builder.addCase(getRequestShipBasketThunk.pending, (state) => {
      // Устанавливаем флаг загрузки в true
      state.loading = true;
      // Очищаем ошибки
      state.error = null;
    });
    // Обрабатываем успешное выполнение thunk получения корзины заявок
    builder.addCase(getRequestShipBasketThunk.fulfilled, (state, action) => {
      // Сбрасываем флаг загрузки в false
      state.loading = false;
      // Очищаем ошибки
      state.error = null;
      // Сохраняем данные корзины в состоянии
      state.basket = action.payload;
    });
    // Обрабатываем ошибку выполнения thunk получения корзины заявок
    builder.addCase(getRequestShipBasketThunk.rejected, (state, action) => {
      // Сбрасываем флаг загрузки в false
      state.loading = false;
      // Устанавливаем сообщение об ошибке
      state.error = action.payload as string || "Ошибка получения корзины";
      // Очищаем данные корзины при ошибке
      state.basket = null;
    });
    
    // Обрабатываем состояние ожидания для thunk получения списка заявок пользователя
    builder.addCase(getUserRequestShipsThunk.pending, (state) => {
      // Устанавливаем флаг загрузки в true
      state.loading = true;
      // Очищаем ошибки
      state.error = null;
    });
    // Обрабатываем успешное выполнение thunk получения списка заявок пользователя
    builder.addCase(getUserRequestShipsThunk.fulfilled, (state, action) => {
      // Сбрасываем флаг загрузки в false
      state.loading = false;
      // Очищаем ошибки
      state.error = null;
      // Сохраняем список заявок пользователя в состоянии
      state.userRequests = action.payload;
    });
    // Обрабатываем ошибку выполнения thunk получения списка заявок пользователя
    builder.addCase(getUserRequestShipsThunk.rejected, (state, action) => {
      // Сбрасываем флаг загрузки в false
      state.loading = false;
      // Устанавливаем сообщение об ошибке
      state.error = action.payload as string || "Ошибка получения заявок";
      // Очищаем список заявок при ошибке
      state.userRequests = [];
    });
  },
});

// Экспортируем редьюсер по умолчанию
export default requestShipSlice.reducer;
