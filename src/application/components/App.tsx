import React from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider as MuiThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { StylesProvider } from '@mui/styles';
import { CssBaseline } from '@mui/material';
import MUITheme from 'application/utils/MUITheme';
import { store } from '../store';
import history from '../utils/history';
import { AppRoutes } from './AppRoutes';
import { ToastNotification } from '../../notification/ToastNotification';

export const isMobile = window.innerWidth < 768;

export const App = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
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
    </ConnectedRouter>
  </Provider>
);
