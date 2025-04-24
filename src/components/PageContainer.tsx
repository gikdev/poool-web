import styled from "@master/styled.react"

interface PageContainerProps {
  className?: string
  children?: React.ReactNode
}

export default function PageContainer({ children, className = "" }: PageContainerProps) {
  const Container = styled.div("grow shrink", className)

  return <Container>{children}</Container>
}
