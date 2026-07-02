import { useCustomers } from "@/hooks/useCustomers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const WaitingList = () => {
  const { data: customers, updateCustomerStatus, deleteCustomer } = useCustomers();
  const joinUrl = `${window.location.origin}/join`;

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    toast.success("Link copied!");
  };

  return (
    <div className="space-y-4">
      <Card className="border-border glow-cyan">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <p className="text-sm text-muted-foreground">Customer Sign-Up Link</p>
            <p className="text-secondary font-mono text-sm break-all">{joinUrl}</p>
          </div>
          <Button variant="outline" onClick={copyLink}>📋 Copy</Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-gradient text-3xl">📋 Waiting List</CardTitle>
          <p className="text-muted-foreground text-sm">{customers?.filter(c => c.status === "waiting").length ?? 0} waiting</p>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Phone</TableHead>
                  <TableHead className="hidden sm:table-cell">Age</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers?.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.first_name} {c.last_name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{c.phone}</TableCell>
                    <TableCell className="hidden sm:table-cell">{c.age_group}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "waiting" ? "default" : "secondary"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-1 whitespace-nowrap">
                      {c.status === "waiting" && (
                        <Button size="sm" variant="outline" onClick={() => updateCustomerStatus.mutate({ id: c.id, status: "booked" })}>
                          ✅
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost">❌</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove {c.first_name} {c.last_name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This deletes the customer and any rides logged for them. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteCustomer.mutate(c.id, {
                                onSuccess: () => toast.success("Removed"),
                                onError: () => toast.error("Failed to remove customer"),
                              })}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitingList;
