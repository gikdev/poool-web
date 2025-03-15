import { Cube, House, Receipt } from "@phosphor-icons/react"
import { StackHeader, TabBar, type TabBarItem, useSetStackHeaderAtom } from "foree/components"
import { Outlet } from "react-router"

const tabBarItems: TabBarItem[] = [
  { icon: House, path: "/", title: "خانه" },
  { icon: Receipt, path: "/expenses", title: "خرجی‌ها" },
  { icon: Cube, path: "/budgets", title: "بودجه‌ها" },
]

export default function BaseLayout() {
  useSetStackHeaderAtom(() => ({ title: "پوول" }))

  return (
    <div className="flex flex-col min-h-dvh">
      <StackHeader />

      <div className="grow shrink flex flex-col">
        <Outlet />
      </div>

      <TabBar items={tabBarItems} />
    </div>
  )
}
