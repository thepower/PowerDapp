import { createTheme, Theme } from '@mui/material/styles';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

declare module '@mui/material/Button' {
  interface ButtonPropsSizeOverrides {
    extraSmall: true;
  }
}

export const MUITheme = createTheme({
  typography: {
    fontFamily: 'Ubuntu, sans-serif'
  },
  spacing: 4,
  transitions: {
    duration: {
      standard: 300
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 360,
      md: 768,
      lg: 1280,
      xl: 1600
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#F9F9FA',
          color: '#1D1D1F'
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: '#1D1D1F',
          borderRadius: 5,
          background: '#FFF',
          '&:hover': {
            background: '#FFF'
          },
          '.MuiOutlinedInput-input::placeholder': {
            color: '#1D1D1F'
          },
          '&:hover .MuiOutlinedInput-input::placeholder': {
            color: '#1D1D1F'
          },
          '&.Mui-focused': {
            background: '#FFF',
            '.MuiOutlinedInput-notchedOutline': {
              border: 0
            },
            '.MuiOutlinedInput-input::placeholder': {
              color: 'transparent'
            }
          },
          '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
            border: 0
          },
          '&.Mui-disabled': {
            background: '#CDDDE5',
            pointerEvents: 'none'
          },
          '&.Mui-disabled .MuiOutlinedInput-input': {
            WebkitTextFillColor: 'unset'
          }
        },
        colorSecondary: {
          color: '#6b798f',
          borderRadius: 5,
          background: '#dfebfb',
          '&:hover': {
            background: '#DBEAFF'
          },
          '.MuiOutlinedInput-input::placeholder': {
            color: '#8895AA'
          },
          '&:hover .MuiOutlinedInput-input::placeholder': {
            color: '#98A6BC'
          },
          '&.Mui-focused': {
            background: '#DBEAFF',
            '.MuiOutlinedInput-notchedOutline': {
              border: 0
            },
            '.MuiOutlinedInput-input::placeholder': {
              color: 'transparent'
            }
          },
          '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
            border: 0
          },
          '&.Mui-disabled': {
            background: '#EBF3FF',
            pointerEvents: 'none'
          },
          '&.Mui-disabled .MuiOutlinedInput-input': {
            WebkitTextFillColor: 'unset'
          }
        },
        notchedOutline: {
          border: 0
        }
      }
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          position: 'absolute',
          bottom: '-24px',
          fontSize: '14px',
          lineHeight: '16px',
          margin: '0 4px 0 0'
        }
      }
    }
  }
});

export default MUITheme;
