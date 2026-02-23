import { useState } from "react";
import { useDrivers } from "@/hooks/useDrivers";
import { useEvents } from "@/hooks/useEvents";
import { useCustomers } from "@/hooks/useCustomers";
import { useRides } from "@/hooks/useRides";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const BookRide = () => {
  const { data: drivers } = useDrivers();
  const { data: events } = useEvents();
  const { data: customers } = useCustomers();
  const { addRide } = useRides();
  const { addCustomer, updateCustomerStatus } = useCustomers();

  const [eventId, setEventId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [staffName, setStaffName] = useState("");
  const [notes, setNotes] = useState("");
  const [useNew, setUseNew] = useState(false);
  const [newFirst, setNewFirst] = useState("");
  const [newLast, setNewLast] = useState("");

  const waitingCustomers = customers?.filter((c) => c.status === "waiting") ?? [];

  const handleSubmit = async () => {
    if (!eventId || !driverId || !staffName) {
      toast.error("Please fill in event, driver, and staff name");
      return;
    }

    let cid = customerId;
    if (useNew) {
      if (!newFirst || !newLast) { toast.error("Enter customer name"); return; }
      try {
        const { data, error } = await (await import("@/integrations/supabase/client")).supabase
          .from("customers")
          .insert({ first_name: newFirst, last_name: newLast, age_group: "18-25", status: "booked" })
          .select("id")
          .single();
        if (error) throw error;
        cid = data.id;
      } catch { toast.error("Failed to add customer"); return; }
    } else {
      if (!customerId) { toast.error("Select a customer"); return; }
      await updateCustomerStatus.mutateAsync({ id: customerId, status: "booked" });
    }

    try {
      await addRide.mutateAsync({ customer_id: cid, driver_id: driverId, event_id: eventId, staff_name: staffName, notes });
      toast.success("Ride booked! 🏁");
      setCustomerId(""); setDriverId(""); setNotes(""); setNewFirst(""); setNewLast("");
    } catch { toast.error("Failed to book ride"); }
  };

  return (
    <Card className="border-border glow-magenta">
      <CardHeader>
        <CardTitle className="text-gradient text-3xl">🏁 Book a Ride</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Event</label>
          <Select value={eventId} onValueChange={setEventId}>
            <SelectTrigger><SelectValue placeholder="Select event..." /></SelectTrigger>
            <SelectContent>{events?.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Customer</label>
          <div className="flex gap-2 mb-2">
            <Button size="sm" variant={!useNew ? "default" : "outline"} onClick={() => setUseNew(false)}>From Waitlist</Button>
            <Button size="sm" variant={useNew ? "default" : "outline"} onClick={() => setUseNew(true)}>New Customer</Button>
          </div>
          {useNew ? (
            <div className="flex gap-2">
              <Input placeholder="First Name" value={newFirst} onChange={(e) => setNewFirst(e.target.value)} />
              <Input placeholder="Last Name" value={newLast} onChange={(e) => setNewLast(e.target.value)} />
            </div>
          ) : (
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger><SelectValue placeholder="Select customer..." /></SelectTrigger>
              <SelectContent>{waitingCustomers.map((c) => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Driver</label>
          <Select value={driverId} onValueChange={setDriverId}>
            <SelectTrigger><SelectValue placeholder="Select driver..." /></SelectTrigger>
            <SelectContent>{drivers?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} — {d.car}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Staff Name</label>
          <Input placeholder="Your name" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
        </div>

        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Notes (optional)</label>
          <Input placeholder="Any notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <Button className="w-full gradient-magenta-cyan text-primary-foreground font-bold text-lg h-12" onClick={handleSubmit}>
          🏁 LOG RIDE
        </Button>
      </CardContent>
    </Card>
  );
};

export default BookRide;
