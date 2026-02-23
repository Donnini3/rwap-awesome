import { useCustomers } from "@/hooks/useCustomers";
import { useRides } from "@/hooks/useRides";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CustomerTracker = () => {
  const { data: customers } = useCustomers();
  const { data: rides } = useRides();

  const customerData = customers?.map((c) => ({
    ...c,
    rideCount: rides?.filter((r) => r.customer_id === c.id).length ?? 0,
  })).sort((a, b) => b.rideCount - a.rideCount) ?? [];

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-gradient text-3xl">👥 Customer Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Phone</TableHead>
              <TableHead>Rides</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customerData.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.first_name} {c.last_name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{c.email}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{c.phone}</TableCell>
                <TableCell className="font-bold text-secondary">{c.rideCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CustomerTracker;
