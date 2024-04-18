import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { createLogger } from 'redux-logger';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { NFTsReducer } from 'NFTs/slice/NFTsSlice';
import { messagesReducer } from 'messages/slice/messagesSlice';
import { walletReducer } from 'myAssets/slices/walletSlice';
import { walletSignReducer } from 'walletSign/slices/walletSign';
import { profilesReducer } from 'profiles/slice/profilesSlice';
import { tariffsReducer } from 'tariffs/slice/tariffSlice';
import { accountReducer } from '../account/slice/accountSlice';
import { applicationDataReducer } from './slice/applicationSlice';
import { networkReducer } from '../network/slice';
import rootSaga from './sagas/rootSaga';
import history from './utils/history';

const loggerMiddleware = createLogger({ collapsed: true });
const routeMiddleware = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();

const reducer = {
  router: connectRouter(history),
  account: accountReducer,
  applicationData: applicationDataReducer,
  NFTs: NFTsReducer,
  network: networkReducer,
  messages: messagesReducer,
  profiles: profilesReducer,
  tariffs: tariffsReducer,
  wallet: walletReducer,
  walletSign: walletSignReducer,
};

const middlewares = [sagaMiddleware, routeMiddleware];

if (process.env.NODE_ENV !== 'production') {
  middlewares.push(loggerMiddleware);
}

const store = configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) => (
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(middlewares)
  ),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { store };
