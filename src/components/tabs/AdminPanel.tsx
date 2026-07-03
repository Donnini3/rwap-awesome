import { useState } from "react";
import { useDrivers } from "@/hooks/useDrivers";
import { useEvents } from "@/hooks/useEvents";
import { useRides } from "@/hooks/useRides";
import { useCustomers } from "@/hooks/useCustomers";
import { useActiveEvent } from "@/hooks/useActiveEvent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { csvEscape, findColumn, isExcelBinary, isExcelFileName, parseCsv } from "@/lib/csv";

const AdminPanel = () => {
  const { data: drivers, addDriver, deleteDriver } = useDrivers();
  const { data: events, addEvent, deleteEvent } = useEvents();
  const { clearAllRides } = useRides();
  const { addCustomer } = useCustomers();
  const { data: activeEvent, setActiveEvent } = useActiveEvent();
  const activeEventId = activeEvent?.active_event_id ?? "";

  const [driverName, setDriverName] = useState("");
  const [driverCar, setDriverCar] = useState("");
  const [eventName, setEventName] = useState("");

  const handleAddDriver = () => {
    if (!driverName || !driverCar) return;
    addDriver.mutate({ name: driverName, car: driverCar }, {
      onSuccess: () => { setDriverName(""); setDriverCar(""); toast.success("Driver added!"); },
    });
  };

  const handleAddEvent = () => {
    if (!eventName) return;
    addEvent.mutate(eventName, {
      onSuccess: () => { setEventName(""); toast.success("Event added!"); },
    });
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "drivers" | "customers") => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    input.value = "";

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (isExcelFileName(file.name) || isExcelBinary(bytes)) {
        toast.error("Excel files can't be read directly. In Excel, use File → Save As → CSV, then upload that.");
        return;
      }

      const rows = parseCsv(new TextDecoder("utf-8").decode(bytes));
      if (rows.length < 2) {
        toast.error("No data rows found — the file needs a header row plus at least one entry.");
        return;
      }
      const headers = rows[0];

      let imported = 0;
      let skipped = 0;
      let failed = 0;

      if (type === "drivers") {
        const ni = findColumn(headers, "name", "driver", "driver name");
        const ci = findColumn(headers, "car", "vehicle");
        if (ni === -1 || ci === -1) {
          toast.error(`Missing "Name" or "Car" column. Found columns: ${headers.join(", ")}`);
          return;
        }
        for (const cols of rows.slice(1)) {
          const name = cols[ni]?.trim();
          const car = cols[ci]?.trim();
          if (!name || !car) { skipped++; continue; }
          try { await addDriver.mutateAsync({ name, car }); imported++; }
          catch { failed++; }
        }
      } else {
        const fi = findColumn(headers, "first name", "firstname", "first");
        const li = findColumn(headers, "last name", "lastname", "last", "surname");
        if (fi === -1 || li === -1) {
          toast.error(`Missing "First Name" or "Last Name" column. Found columns: ${headers.join(", ")}`);
          return;
        }
        const pi = findColumn(headers, "phone", "mobile", "phone number");
        const ei = findColumn(headers, "email", "email address");
        const ai = findColumn(headers, "age group", "agegroup", "age");
        for (const cols of rows.slice(1)) {
          const first = cols[fi]?.trim();
          const last = cols[li]?.trim();
          if (!first || !last) { skipped++; continue; }
          try {
            await addCustomer.mutateAsync({
              first_name: first, last_name: last,
              phone: pi >= 0 ? cols[pi]?.trim() ?? "" : "",
              email: ei >= 0 ? cols[ei]?.trim() ?? "" : "",
              age_group: ai >= 0 && cols[ai]?.trim() ? cols[ai].trim() : "18-25",
            });
            imported++;
          } catch { failed++; }
        }
      }

      const detail = [skipped ? `${skipped} skipped (missing name)` : "", failed ? `${failed} failed to save` : ""].filter(Boolean).join(", ");
      if (failed > 0) toast.error(`Imported ${imported} ${type}${detail ? ` — ${detail}` : ""}. Check your connection or sign in again, then retry.`);
      else if (imported === 0) toast.error(`No ${type} imported${detail ? ` — ${detail}` : ""}.`);
      else toast.success(`Imported ${imported} ${type}${detail ? ` (${detail})` : ""}.`);
    } catch {
      toast.error("Import failed — the file couldn't be read.");
    }
  };

  const exportRidesCSV = async () => {
    const { data, error } = await supabase.from("rides").select("*, customers(*), drivers(*), events(*)").order("created_at");
    if (error) { toast.error("Export failed — couldn't load rides"); return; }
    if (!data?.length) { toast.error("No rides to export"); return; }
    const csv = "Customer,Driver,Car,Event,Staff,Notes,Date\n" +
      data.map(r => [
        `${r.customers?.first_name ?? ""} ${r.customers?.last_name ?? ""}`.trim(),
        r.drivers?.name, r.drivers?.car, r.events?.name, r.staff_name, r.notes, r.created_at,
      ].map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "rides.csv"; a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-gradient text-3xl font-bold">⚙️ Admin Panel</h2>

      {/* Active Event */}
      <Card className="border-border glow-cyan">
        <CardHeader><CardTitle>Active Event (site-wide)</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This event applies to every staff member. The date of each ride is recorded automatically as the day it was logged.
          </p>
          <Select
            value={activeEventId}
            onValueChange={(v) => setActiveEvent.mutate(v, {
              onSuccess: () => toast.success("Active event updated"),
              onError: () => toast.error("Failed to update active event"),
            })}
          >
            <SelectTrigger className="h-12 text-lg"><SelectValue placeholder="Select active event..." /></SelectTrigger>
            <SelectContent>
              {events?.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>


      {/* Add Driver */}
      <Card className="border-border">
        <CardHeader><CardTitle>Manage Drivers</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input placeholder="Driver Name" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
            <Input placeholder="Car" value={driverCar} onChange={(e) => setDriverCar(e.target.value)} />
            <Button onClick={handleAddDriver} className="sm:w-auto">Add</Button>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Import CSV (Name, Car columns)</label>
            <Input type="file" accept=".csv" onChange={(e) => handleCSVUpload(e, "drivers")} />
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Car</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {drivers?.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{d.name}</TableCell><TableCell>{d.car}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => deleteDriver.mutate(d.id)}>❌</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Event */}
      <Card className="border-border">
        <CardHeader><CardTitle>Manage Events</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input placeholder="Event Name" value={eventName} onChange={(e) => setEventName(e.target.value)} />
            <Button onClick={handleAddEvent} className="sm:w-auto">Add</Button>
          </div>
          <div className="overflow-x-auto -mx-6 px-6">
            <Table>
              <TableHeader><TableRow><TableHead>Event</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {events?.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.name}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={() => deleteEvent.mutate(e.id)}>❌</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Customer CSV Upload */}
      <Card className="border-border">
        <CardHeader><CardTitle>Import Customers</CardTitle></CardHeader>
        <CardContent>
          <label className="text-sm text-muted-foreground">Upload CSV (First Name, Last Name, Phone, Email, Age Group)</label>
          <Input type="file" accept=".csv" onChange={(e) => handleCSVUpload(e, "customers")} />
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-border">
        <CardHeader><CardTitle>Data Management</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" onClick={exportRidesCSV} className="w-full">📥 Export Rides CSV</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">🗑️ Clear All Rides</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all rides?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes every logged ride across all events. Export the rides CSV first if you need a copy. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => clearAllRides.mutate(undefined, {
                    onSuccess: () => toast.success("All rides cleared"),
                    onError: () => toast.error("Failed to clear rides"),
                  })}
                >
                  Delete all rides
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
