import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from  "@clerk/react"
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import { clerkPublishableKey } from "./lib/clerk";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={{
        variables: {
          colorPrimary: "#2563eb",
          fontFamily: "Inter, system-ui, sans-serif",
        },
      }}
    >
      <BrowserRouter>
        <App />
        <Toaster position="top-center" richColors closeButton />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);