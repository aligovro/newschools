import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import sitesSlice from './slices/sitesSlice';
import usersSlice from './slices/usersSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice,
        app: appSlice,
        sites: sitesSlice,
        users: usersSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Типизированные хуки для использования в компонентах
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
