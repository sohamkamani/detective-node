import { hrtime } from 'process'

const timer = (): (() => number) => {
  const then = hrtime()
  return () => {
    const now = hrtime()
    const secDiff = now[0] - then[0]
    const nsecDiff = now[1] - then[1]
    return secDiff * 1e9 + nsecDiff
  }
}

export default timer
