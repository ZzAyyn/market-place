import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./App.tsx";
import "./index.css";

const apiUrl = import.meta.env.VITE_API_URL;

if (apiUrl === undefined || apiUrl.length === 0) {
  throw new Error("VITE_API_URL must be set in client/.env");
}

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Root element #root was not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
