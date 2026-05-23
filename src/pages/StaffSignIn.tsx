import { useState } from "react";
import { useStaffSession } from "@/contexts/StaffSessionContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const StaffSignIn = () => {
  const { signIn } = useStaffSession();
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!name.trim()) { toast.error("Enter your name"); return; }
    if (!passcode) { toast.error("Enter the staff passcode"); return; }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("staff-login", {
        body: { passcode },
      });
      if (error || !data?.email) {
        toast.error(data?.error ?? "Incorrect passcode");
        setLoading(false);
        return;
      }

      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (authErr) {
        toast.error("Sign-in failed");
        setLoading(false);
        return;
      }

      signIn(name.trim());
      toast.success(`Welcome, ${name.trim()}! 🏁`);
    } catch {
      toast.error("Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border glow-magenta">
        <CardHeader className="text-center">
          <h1 className="text-5xl text-gradient mb-2" style={{ fontFamily: "'Yellowtail', cursive" }}>Keep it Reet</h1>
          <p className="text-muted-foreground text-sm tracking-wide uppercase">KIR Event Management</p>
          <CardTitle className="text-xl mt-4">Staff Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Your Name</label>
            <Input
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg h-12"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Staff Passcode</label>
            <Input
              type="password"
              placeholder="Enter passcode..."
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSignIn()}
              className="text-lg h-12"
            />
          </div>
          <Button
            disabled={loading}
            className="w-full gradient-magenta-cyan text-primary-foreground font-bold text-lg h-14 mt-2"
            onClick={handleSignIn}
          >
            {loading ? "Signing in..." : "🏁 SIGN IN"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            The active event is set by admin and applies to everyone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffSignIn;
