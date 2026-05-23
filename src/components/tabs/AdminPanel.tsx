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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").filter(Boolean);
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim());
      if (type === "drivers") {
        const ni = headers.indexOf("name");
        const ci = headers.indexOf("car");
        if (ni >= 0 && ci >= 0 && cols[ni] && cols[ci]) {
          await addDriver.mutateAsync({ name: cols[ni], car: cols[ci] });
        }
      } else {
        const fi = headers.indexOf("first name") !== -1 ? headers.indexOf("first name") : headers.indexOf("firstname");
        const li = headers.indexOf("last name") !== -1 ? headers.indexOf("last name") : headers.indexOf("lastname");
        if (fi >= 0 && li >= 0 && cols[fi] && cols[li]) {
          const pi = headers.indexOf("phone");
          const ei = headers.indexOf("email");
          const ai = headers.indexOf("age group") !== -1 ? headers.indexOf("age group") : headers.indexOf("agegroup");
          await addCustomer.mutateAsync({
            first_name: cols[fi], last_name: cols[li],
            phone: pi >= 0 ? cols[pi] : "", email: ei >= 0 ? cols[ei] : "",
            age_group: ai >= 0 ? cols[ai] : "18-25",
          });
        }
      }
    }
    toast.success(`${type} imported!`);
    e.target.value = "";
  };

  const exportRidesCSV = async () => {
    const { data } = await supabase.from("rides").select("*, customers(*), drivers(*), events(*)").order("created_at");
    if (!data?.length) { toast.error("No rides to export"); return; }
    const csv = "Customer,Driver,Car,Event,Staff,Notes,Date\n" +
      data.map(r => `"${r.customers?.first_name} ${r.customers?.last_name}","${r.drivers?.name}","${r.drivers?.car}","${r.events?.name}","${r.staff_name}","${r.notes}","${r.created_at}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "rides.csv"; a.click();
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
          <Button variant="destructive" onClick={() => { clearAllRides.mutate(); toast.success("Rides cleared"); }} className="w-full">🗑️ Clear All Rides</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
