import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import createWebStorage from "redux-persist/es/storage/createWebStorage";

// Reducers
import authReducer from "../features/auth/authSlice";
import vehiclesReducer from "../features/vehicles/vehiclesSlice";
import bookingsReducer from "../features/bookings/bookingsSlice";
import uiReducer from "../features/ui/uiSlice";

const storage = createWebStorage("local");

const rootReducer = combineReducers({
  auth: authReducer,
  vehicles: vehiclesReducer,
  bookings: bookingsReducer,
  ui: uiReducer,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["auth"], // We primarily want to persist authentication state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);