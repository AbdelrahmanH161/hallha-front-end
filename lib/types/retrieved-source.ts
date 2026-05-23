export type ClientDocumentType = "policies" | "contracts" | "financials" | "other"

export type RetrievedSource = {
  id: number
  type?: "document" | "web"
  source: string
  displayName?: string
  page: number
  url?: string
  /** Namespace scope this source came from. `client` = audited-client doc, `global` = AAOIFI. */
  scope?: "global" | "client"
  /** Audited-client id when scope === "client". */
  clientId?: string
  /** Audited-client document type when known. */
  documentType?: ClientDocumentType
}
