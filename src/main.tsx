import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import Pages from "./pages/pages"
import "./styles.css"

const container = document.getElementById("root")

if (!container) throw new Error("No #root available")

createRoot(container).render(
  <StrictMode>
    <Pages />
  </StrictMode>,
)
