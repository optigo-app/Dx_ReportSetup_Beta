"use client";

import { RecoilRoot } from "recoil";
import { DeviceStatusProvider } from "@/Components/DeviceStatusContext/DeviceStatusContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const theme = createTheme({
  typography: {
    fontFamily: "'Poppins', sans-serif",
    allVariants: {
      fontFamily: "'Poppins', sans-serif",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "'Poppins', sans-serif",
          textTransform: "none",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: "'Poppins', sans-serif",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: "'Poppins', sans-serif",
        },
      },
    },
  },
});

export default function Providers({ children }) {
  return (
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DeviceStatusProvider>
          {children}
          <ToastContainer />
        </DeviceStatusProvider>
      </ThemeProvider>
    </RecoilRoot>
  );
}