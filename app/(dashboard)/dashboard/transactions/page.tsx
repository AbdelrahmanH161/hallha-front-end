import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TransactionsPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Manage Zakat and purification workflows for flagged transactions.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Zakat & Purification Queue</CardTitle>
          <CardDescription>
            Review flagged transactions and trigger purification flows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Transaction table placeholder
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
