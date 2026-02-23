import { useRides } from "@/hooks/useRides";
import { useDrivers } from "@/hooks/useDrivers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Leaderboard = () => {
  const { data: rides } = useRides();
  const { data: drivers } = useDrivers();

  const driverRides = drivers?.map((d) => ({
    ...d,
    rideCount: rides?.filter((r) => r.driver_id === d.id).length ?? 0,
  })).sort((a, b) => b.rideCount - a.rideCount) ?? [];

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-gradient text-3xl">🚗 Driver Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {driverRides.map((d, i) => (
          <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary w-8">#{i + 1}</span>
              <div>
                <p className="font-semibold">{d.name}</p>
                <p className="text-sm text-muted-foreground">{d.car}</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-secondary">{d.rideCount}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
