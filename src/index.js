import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  StyledEngineProvider,
} from "@mui/material";

import "./global.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { PopupProvider } from "./components/Popup";

const muiTheme = createTheme({
  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
      },
    },
  },
});

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GAUTH_CLIENT_ID}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          <PopupProvider>
            <App />
          </PopupProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
