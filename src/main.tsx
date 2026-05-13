import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/styles.css";
import RootProvider from "@/providers/root-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootProvider />
  </StrictMode>,
);
