import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const ageGroups = ["Under 18", "18-25", "26-35", "36-45", "46-55", "56+"];

const JoinPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [ageGroup, setAgeGroup] = useState("18-25");

  const handleSubmit = async () => {
    if (!firstName || !lastName) {
      toast.error("Please enter your name");
      return;
    }
    const { error } = await supabase.from("customers").insert({
      first_name: firstName, last_name: lastName, phone, email, age_group: ageGroup,
    });
    if (error) { toast.error("Something went wrong"); return; }
    setSubmitted(true);
  };

  const reset = () => {
    setSubmitted(false);
    setFirstName(""); setLastName(""); setPhone(""); setEmail(""); setAgeGroup("18-25");
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border glow-cyan text-center">
          <CardContent className="p-8 space-y-4">
            <div className="text-6xl">✅</div>
            <h2 className="text-3xl text-gradient">YOU'RE ON THE LIST!</h2>
            <p className="text-muted-foreground">Sit tight — we'll call you when it's your turn for a ride!</p>
            <Button className="gradient-magenta-cyan text-primary-foreground w-full" onClick={reset}>
              ➕ Add Another Person
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border glow-magenta">
        <CardHeader className="text-center">
          <h1 className="text-4xl text-gradient">KEEP IT REET</h1>
          <CardTitle className="text-xl text-foreground">Join the Waiting List</CardTitle>
          <p className="text-muted-foreground text-sm">Sign up for a pro ride experience!</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="First Name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-12 text-lg" />
          <Input placeholder="Last Name *" value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-12 text-lg" />
          <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 text-lg" />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 text-lg" />
          <Select value={ageGroup} onValueChange={setAgeGroup}>
            <SelectTrigger className="h-12 text-lg"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ageGroups.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="w-full h-14 text-lg font-bold gradient-magenta-cyan text-primary-foreground" onClick={handleSubmit}>
            🏁 JOIN WAITING LIST
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinPage;
