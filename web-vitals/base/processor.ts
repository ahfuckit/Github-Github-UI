export abstract class BaseProcessor<MetricType, EntryType> {
  abstract processEntries(entries: EntryType[]): void
  abstract get metric(): MetricType | null

  teardown() {}
}
