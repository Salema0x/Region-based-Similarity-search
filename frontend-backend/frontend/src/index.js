import 'bulma/css/bulma.min.css';
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";


const rootElement = document.getElementById("app");
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
} else {
    console.error('The root element with ID "app" was not found in the DOM.');
}