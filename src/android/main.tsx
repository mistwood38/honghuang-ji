import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GameApp } from "@/components/honghuang/game-app";
import { installAndroidShell } from "./native";
import "@/styles.css";
import "./android.css";

installAndroidShell();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GameApp />
  </StrictMode>,
);
