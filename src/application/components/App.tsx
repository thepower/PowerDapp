import React from 'react';
import { CssBaseline } from '@mui/material';
import {
  ThemeProvider as MuiThemeProvider,
  StyledEngineProvider
} from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import MUITheme from 'application/utils/MUITheme';
import { ToastNotification } from 'notification/ToastNotification';
import { AppRoutes } from './AppRoutes';
import { store } from '../store';

export const isMobile = window.innerWidth < 768;

export const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <StylesProvider injectFirst>
        <StyledEngineProvider injectFirst>
          <MuiThemeProvider theme={MUITheme}>
            <CssBaseline>
              <ToastNotification />
              <AppRoutes />
            </CssBaseline>
          </MuiThemeProvider>
        </StyledEngineProvider>
      </StylesProvider>
    </BrowserRouter>
  </Provider>
);
