export interface BidFile<TDocType extends string = string> {
  file: string
  doc_type: TDocType
  bid: number
  id: number
  is_blocked: boolean
}
