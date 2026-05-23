import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useActiveEvent = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["active-event"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("active_event_id, updated_at, events:active_event_id(id, name)")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("app-settings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings" },
        () => queryClient.invalidateQueries({ queryKey: ["active-event"] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const setActiveEvent = useMutation({
    mutationFn: async (eventId: string | null) => {
      const { error } = await supabase
        .from("app_settings")
        .upsert({ id: 1, active_event_id: eventId, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["active-event"] }),
  });

  return { ...query, setActiveEvent };
};
