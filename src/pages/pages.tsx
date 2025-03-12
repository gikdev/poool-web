import { BrowserRouter, Route, Routes } from "react-router"
import BaseLayout from "#/BaseLayout"
import Home from "./home"
import Budgets from "./budgets"
import Expenses from "./expenses"

export default function Pages() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BaseLayout />}>
          <Route index element={<Home />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="budgets" element={<Budgets />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
