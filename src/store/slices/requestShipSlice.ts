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
