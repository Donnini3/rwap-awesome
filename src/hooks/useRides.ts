import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const useRides = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["rides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rides")
        .select("*, customers(*), drivers(*), events(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("rides-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "rides" }, () => {
        queryClient.invalidateQueries({ queryKey: ["rides"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const addRide = useMutation({
    mutationFn: async (ride: { customer_id: string; driver_id: string; event_id: string; staff_name: string; notes?: string }) => {
      const { error } = await supabase.from("rides").insert(ride);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rides"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const clearAllRides = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("rides").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rides"] }),
  });

  return { ...query, addRide, clearAllRides };
};
