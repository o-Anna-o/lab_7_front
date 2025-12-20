// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import filterReducer from './slices/filterSlice'
import requestShipReducer from './slices/requestShipSlice'   //  для requestShipSlice
import authReducer from './slices/auth/authSlice'

export const store = configureStore({
  reducer: {
    filter: filterReducer,
    requestShip: requestShipReducer,
    auth: authReducer,
  },
})

// Типы для typed hooks
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
