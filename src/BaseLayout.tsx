import { StackHeader, useSetStackHeaderAtom } from "foree/components"
import { Outlet } from "react-router"

export default function BaseLayout() {
  useSetStackHeaderAtom(() => ({ title: "پوول" }))

  return (
    <div className="flex flex-col min-h-dvh">
      <StackHeader />
      <div className="grow shrink flex flex-col">
        <Outlet />
      </div>
    </div>
  )
}
