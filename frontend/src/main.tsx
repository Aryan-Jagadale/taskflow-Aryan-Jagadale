import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const ENABLE_MSW = import.meta.env.VITE_ENABLE_MSW !== "false";

async function enableMocking() {
  if (!ENABLE_MSW) {
    return;
  }
  const { worker } = await import("./mocks/browser");
  return worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
