export type RetrievedSource = {
  id: number
  type?: "document" | "web"
  source: string
  displayName?: string
  page: number
  url?: string
}
