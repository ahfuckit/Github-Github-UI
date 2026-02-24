export abstract class BaseMetric<AttributionType, EntryType> {
  value: number
  entries: EntryType[]

  constructor(value: number, entries: EntryType[]) {
    this.value = value
    this.entries = entries
  }

  abstract get attribution(): AttributionType
}
