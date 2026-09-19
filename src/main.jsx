import React from "react";
import { createRoot } from "react-dom/client";
import TalismanEngine from "../talisman_engine_v8.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TalismanEngine />
  </React.StrictMode>
);
