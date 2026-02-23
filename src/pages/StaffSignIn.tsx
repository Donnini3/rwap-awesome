import { useState } from "react";
import { useEvents } from "@/hooks/useEvents";
import { useStaffSession } from "@/contexts/StaffSessionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const StaffSignIn = () => {
  const { data: events } = useEvents();
  const { signIn } = useStaffSession();
  const [name, setName] = useState("");
  const [eventId, setEventId] = useState("");

  const handleSignIn = () => {
    if (!name.trim()) { toast.error("Enter your name"); return; }
    if (!eventId) { toast.error("Select an event"); return; }
    const event = events?.find((e) => e.id === eventId);
    signIn(name.trim(), eventId, event?.name ?? "");
    toast.success(`Welcome, ${name.trim()}! 🏁`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border glow-magenta">
        <CardHeader className="text-center">
          <h1 className="text-5xl text-gradient mb-2">KEEP IT REET</h1>
          <p className="text-muted-foreground text-sm tracking-wide">PRO RIDES MANAGEMENT</p>
          <CardTitle className="text-xl mt-4">Staff Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Your Name</label>
            <Input
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
              className="text-lg h-12"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Current Event</label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="Select event..." />
              </SelectTrigger>
              <SelectContent>
                {events?.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="w-full gradient-magenta-cyan text-primary-foreground font-bold text-lg h-14 mt-2"
            onClick={handleSignIn}
          >
            🏁 SIGN IN
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffSignIn;
