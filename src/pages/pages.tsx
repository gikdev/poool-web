import { BrowserRouter, Route, Routes } from "react-router"
import BaseLayout from "#/BaseLayout"
import Budgets from "./budgets"
import Expenses from "./expenses"
import Home from "./home"
import Income from "./income"
import Networth from "./networth"

export default function Pages() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BaseLayout />}>
          <Route index element={<Home />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="networth" element={<Networth />} />
          <Route path="income" element={<Income />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
