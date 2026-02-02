import WalkthroughClient from './WalkthroughClient'

export const dynamicParams = false

export function generateStaticParams() {
  return [
    { step: '1' },
    { step: '2' },
    { step: '3' },
    { step: '4' },
    { step: '5' },
    { step: '6' },
    { step: '7' }
  ]
}

export default async function WalkthroughPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = await params
  const stepNumber = parseInt(step, 10) || 1
  return <WalkthroughClient initialStep={stepNumber} />
}
