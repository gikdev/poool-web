import { Coins, GridFour, HandCoins, House, Receipt } from "@phosphor-icons/react"
import { TabBar, type TabBarItem } from "foree/components"
import { Outlet } from "react-router"

const tabBarItems: TabBarItem[] = [
  { icon: Receipt, path: "/expenses", title: "خرجی‌ها" },
  { icon: HandCoins, path: "/income", title: "ورودی‌ها" },
  { icon: House, path: "/", title: "خانه" },
  { icon: Coins, path: "/networth", title: "ثروت" },
  { icon: GridFour, path: "/budgets", title: "بودجه‌ها" },
]

export default function BaseLayout() {
  return (
    <div className="flex flex-col min-h-dvh">
      <Outlet />
      {/* <StaticStackHeader title="پول‌ایت" />

      <div className="grow shrink flex flex-col">
        <Outlet />
      </div> */}

      <TabBar items={tabBarItems} />
    </div>
  )
}
