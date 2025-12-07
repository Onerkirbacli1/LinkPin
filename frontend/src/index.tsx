import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/index.css";

const config = {
  initialColorMode: localStorage.getItem("chakra-ui-color-mode") || "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#f0e6ff",
      100: "#d4b3ff",
      200: "#b880ff",
      300: "#9c4dff",
      400: "#801aff",
      500: "#6b00e6",
      600: "#5500b3",
      700: "#400080",
      800: "#2a004d",
      900: "#15001a",
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === "dark" ? "gray.900" : "gray.50",
        transition: "background-color 0.2s",
      },
    }),
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "purple",
      },
      baseStyle: {
        fontWeight: "semibold",
        borderRadius: "lg",
        transition: "all 0.2s",
        _hover: {
          transform: "translateY(-2px)",
          boxShadow: "lg",
        },
      },
    },
    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: props.colorMode === "dark" ? "gray.800" : "white",
          transition: "all 0.2s",
          _hover: {
            boxShadow: "xl",
          },
        },
      }),
    },
    Input: {
      baseStyle: {
        field: {
          _focus: {
            borderColor: "purple.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)",
          },
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ErrorBoundary>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <App />
        </ChakraProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
