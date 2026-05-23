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
      <header className="border-b border-border p-3 sm:p-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl text-gradient leading-tight" style={{ fontFamily: "'Yellowtail', cursive" }}>Keep it Reet</h1>
            <p className="text-muted-foreground text-xs sm:text-sm font-sans tracking-wide uppercase">KIR Event Management</p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="text-xs sm:text-sm leading-tight">
              <div><span className="text-muted-foreground">Staff:</span>{" "}<span className="text-foreground font-semibold">{session.staffName}</span></div>
              <div><span className="text-muted-foreground">Event:</span>{" "}<span className="text-foreground font-semibold">{session.eventName}</span></div>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-3 sm:p-4 pb-20">
        <Tabs defaultValue="book" className="w-full">
          <TabsList className="w-full grid grid-cols-4 sm:grid-cols-7 h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="book" className="flex-col gap-0.5 py-2 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><span className="text-base sm:hidden">🏁</span><span>Book</span></TabsTrigger>
            <TabsTrigger value="waitlist" className="flex-col gap-0.5 py-2 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><span className="text-base sm:hidden">📋</span><span>Waitlist</span></TabsTrigger>
            <TabsTrigger value="feed" className="flex-col gap-0.5 py-2 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><span className="text-base sm:hidden">📡</span><span>Feed</span></TabsTrigger>
            <TabsTrigger value="stats" className="flex-col gap-0.5 py-2 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><span className="text-base sm:hidden">📊</span><span>Stats</span></TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex-col gap-0.5 py-2 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><span className="text-base sm:hidden">🚗</span><span>Drivers</span></TabsTrigger>
            <TabsTrigger value="customers" className="flex-col gap-0.5 py-2 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><span className="text-base sm:hidden">👥</span><span>People</span></TabsTrigger>
            <TabsTrigger value="admin" className="flex-col gap-0.5 py-2 text-[10px] sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground col-span-4 sm:col-span-1"><span className="text-base sm:hidden">⚙️</span><span>Admin</span></TabsTrigger>
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
