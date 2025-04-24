import { StaticStackHeader } from "foree/components"
import PageContainer from "#/components/PageContainer"
import WIP from "#/components/WIP"

export default function Home() {
  return (
    <>
      <StaticStackHeader title="پول‌ایت" />

      <PageContainer className="">
        <h1>صفحه اصلی</h1>
        <WIP />
      </PageContainer>
    </>
  )
}
