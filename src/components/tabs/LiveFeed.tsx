import { useRides } from "@/hooks/useRides";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

const LiveFeed = () => {
  const { data: rides } = useRides();

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-gradient text-3xl">📡 Live Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rides?.length === 0 && <p className="text-muted-foreground">No rides yet.</p>}
        {rides?.map((r) => (
          <div key={r.id} className="p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-primary">{r.customers?.first_name} {r.customers?.last_name}</span>
                <span className="text-muted-foreground mx-2">→</span>
                <span className="font-semibold text-secondary">{r.drivers?.name}</span>
                <span className="text-muted-foreground text-sm ml-1">({r.drivers?.car})</span>
              </div>
              <span className="text-xs text-muted-foreground">{format(new Date(r.created_at), "HH:mm")}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {r.events?.name} · Staff: {r.staff_name}
              {r.notes && <span> · {r.notes}</span>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LiveFeed;
