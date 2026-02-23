import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useStaffSession } from "@/contexts/StaffSessionContext";
import StaffSignIn from "@/pages/StaffSignIn";
import BookRide from "@/components/tabs/BookRide";
import WaitingList from "@/components/tabs/WaitingList";
import LiveFeed from "@/components/tabs/LiveFeed";
import Stats from "@/components/tabs/Stats";
import Leaderboard from "@/components/tabs/Leaderboard";
import CustomerTracker from "@/components/tabs/CustomerTracker";
import AdminPanel from "@/components/tabs/AdminPanel";

const Index = () => {
  const { session, signOut } = useStaffSession();

  if (!session) return <StaffSignIn />;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl text-gradient">KEEP IT REET</h1>
            <p className="text-muted-foreground text-sm font-sans tracking-wide">PRO RIDES MANAGEMENT</p>
          </div>
          <div className="text-right flex items-center gap-3">
            <div className="text-sm">
              <span className="text-muted-foreground">Staff:</span>{" "}
              <span className="text-foreground font-semibold">{session.staffName}</span>
              <br />
              <span className="text-muted-foreground">Event:</span>{" "}
              <span className="text-foreground font-semibold">{session.eventName}</span>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <Tabs defaultValue="book" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="book" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">🏁 Book</TabsTrigger>
            <TabsTrigger value="waitlist" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">📋 Waitlist</TabsTrigger>
            <TabsTrigger value="feed" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">📡 Feed</TabsTrigger>
            <TabsTrigger value="stats" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">📊 Stats</TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">🚗 Drivers</TabsTrigger>
            <TabsTrigger value="customers" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">👥 Customers</TabsTrigger>
            <TabsTrigger value="admin" className="text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">⚙️ Admin</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="book"><BookRide /></TabsContent>
            <TabsContent value="waitlist"><WaitingList /></TabsContent>
            <TabsContent value="feed"><LiveFeed /></TabsContent>
            <TabsContent value="stats"><Stats /></TabsContent>
            <TabsContent value="leaderboard"><Leaderboard /></TabsContent>
            <TabsContent value="customers"><CustomerTracker /></TabsContent>
            <TabsContent value="admin"><AdminPanel /></TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
