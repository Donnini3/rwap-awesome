import { useRides } from "@/hooks/useRides";
import { useCustomers } from "@/hooks/useCustomers";
import { useDrivers } from "@/hooks/useDrivers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Stats = () => {
  const { data: rides } = useRides();
  const { data: customers } = useCustomers();
  const { data: drivers } = useDrivers();

  const totalRides = rides?.length ?? 0;
  const uniqueCustomers = new Set(rides?.map((r) => r.customer_id)).size;
  const activeDrivers = new Set(rides?.map((r) => r.driver_id)).size;
  const waitingCount = customers?.filter((c) => c.status === "waiting").length ?? 0;

  const stats = [
    { label: "Total Rides", value: totalRides, emoji: "🏁", color: "text-primary" },
    { label: "Unique Customers", value: uniqueCustomers, emoji: "👥", color: "text-secondary" },
    { label: "Active Drivers", value: activeDrivers, emoji: "🚗", color: "text-primary" },
    { label: "Waiting List", value: waitingCount, emoji: "📋", color: "text-secondary" },
  ];

  return (
    <div>
      <h2 className="text-gradient text-3xl font-bold mb-4">📊 Stats</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border glow-magenta">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">{s.emoji}</div>
              <div className={`text-4xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Stats;
