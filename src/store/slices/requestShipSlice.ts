// Импортируем необходимые функции из Redux Toolkit
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Импортируем API для взаимодействия с сервером
import { api } from "../../api";
// Импортируем тип контента для указания формата данных
import { ContentType } from "../../api/Api";

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

// AsyncThunk для получения корзины заявок
export const getRequestShipBasketThunk = createAsyncThunk(
  "requestShip/basket",
  async (_, thunkAPI) => {
    try {
      // Выполняем запрос к API для получения корзины заявок через кодогенерацию
      const response = await api.api.requestsBasketList({
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

// Thunk для получения данных заявки
export const fetchRequestShipThunk = createAsyncThunk(
  'ships/fetchRequestShip',
  async (id: number | string, { rejectWithValue }) => {
    try {
      // Реализация через API сервера
      const response = await api.api.requestShipDetail(Number(id));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка загрузки заявки');
    }
  }
);

// Thunk для удаления всей заявки
export const removeRequestShipThunk = createAsyncThunk(
  'ships/removeRequestShip',
  async (requestId: number | string, { rejectWithValue }) => {
    try {
      // Реализация через API сервера
      const response = await api.api.requestShipDelete(Number(requestId));
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка удаления заявки');
    }
  }
);

// Thunk для расчета времени погрузки
export const calculateLoadingTimeThunk = createAsyncThunk(
  'ships/calculateLoadingTime',
  async ({ requestId, payload }: {
    requestId: number | string;
    payload: { containers_20ft?: number; containers_40ft?: number; comment?: string }
  }, { rejectWithValue }) => {
    try {
      // Реализация через API сервера
      const response = await api.api.requestShipsUpdate(Number(requestId), payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Ошибка расчета времени погрузки');
    }
  }
);


// Определяем интерфейс состояния для слайса заявок на корабли
interface RequestShipState {
  // Флаг загрузки для отслеживания состояния выполнения запроса
  loading: boolean;
}

// Инициализируем начальное состояние
const initialState: RequestShipState = {
  // По умолчанию загрузка не выполняется
  loading: false,
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
    });
    // Обрабатываем успешное выполнение thunk формирования заявки
    builder.addCase(formRequestShipThunk.fulfilled, (state) => {
      // Сбрасываем флаг загрузки в false
      state.loading = false;
    });
    // Обрабатываем ошибку выполнения thunk формирования заявки
    builder.addCase(formRequestShipThunk.rejected, (state) => {
      // Сбрасываем флаг загрузки в false
      state.loading = false;
    });
  },
});

// Экспортируем редьюсер по умолчанию
export default requestShipSlice.reducer;