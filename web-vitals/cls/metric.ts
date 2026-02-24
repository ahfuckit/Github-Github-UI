import {BaseMetric} from '../base/metric'

export interface CLSAttribution {
  largestShiftTarget?: string
}

const getLargestLayoutShiftEntry = (entries: LayoutShift[]) => {
  return entries.reduce((a, b) => (a.value > b.value ? a : b))
}

export const getLargestLayoutShiftSource = (sources: LayoutShiftAttribution[]) => {
  return sources.find(s => s.node?.nodeType === 1) || sources[0]
}

/*
 * The CLS metric. This class is compatible with web-vitals' CLSMetric interface that we expect to report to DataDog and Hydro.
 */
export class CLSMetric extends BaseMetric<CLSAttribution, LayoutShift> {
  name = 'CLS' as const
  targetMap: Map<LayoutShiftAttribution, string>

  constructor(value: number, entries: LayoutShift[], targetMap: Map<LayoutShiftAttribution, string>) {
    super(value, entries)
    this.targetMap = targetMap
  }

  get attribution(): CLSAttribution {
    if (!this.entries.length) return {}

    const largestEntry = getLargestLayoutShiftEntry(this.entries)
    if (!largestEntry?.sources?.length) return {}

    const largestSource = getLargestLayoutShiftSource(largestEntry.sources)
    if (!largestSource) return {}

    return {
      largestShiftTarget: this.targetMap.get(largestSource),
    }
  }
}
