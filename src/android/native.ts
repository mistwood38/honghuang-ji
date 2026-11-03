import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { pauseAmbience, resumeAmbience } from "@/lib/honghuang/sound";
import { useSave } from "@/lib/honghuang/store";

/** Native chrome only. Story, stats and saves stay in the existing client store. */
export function installAndroidShell() {
  document.documentElement.classList.add("android-app");
  void StatusBar.setOverlaysWebView({ overlay: true }).catch(() => undefined);
  void StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
  void StatusBar.setBackgroundColor({ color: "#0a1718" }).catch(() => undefined);
  void App.addListener("backButton", () => {
    const dialog = document.querySelector<HTMLButtonElement>(".hh-modal-content .hh-modal-close");
    if (dialog) {
      dialog.click();
      return;
    }
    const { screen, started, setScreen } = useSave.getState();
    if (screen !== "title" && screen !== "play") {
      setScreen(started ? "play" : "title");
      return;
    }
    if (screen === "play") {
      setScreen("title");
      return;
    }
    void App.minimizeApp();
  });
  void App.addListener("appStateChange", ({ isActive }) => {
    if (isActive) resumeAmbience();
    else pauseAmbience();
  });
}
