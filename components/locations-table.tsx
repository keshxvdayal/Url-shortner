import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface LocationsTableProps {
  data: Array<{
    country: string
    clicks: number
  }>
}

export function LocationsTable({ data }: LocationsTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">No location data available</p>
      </div>
    )
  }

  // Calculate total clicks for percentage
  const totalClicks = data.reduce((sum, item) => sum + item.clicks, 0)

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Country</TableHead>
            <TableHead className="text-right">Clicks</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.country}</TableCell>
              <TableCell className="text-right">{item.clicks}</TableCell>
              <TableCell className="text-right">{((item.clicks / totalClicks) * 100).toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
