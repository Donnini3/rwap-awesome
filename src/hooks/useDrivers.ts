import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDrivers = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const addDriver = useMutation({
    mutationFn: async ({ name, car }: { name: string; car: string }) => {
      const { error } = await supabase.from("drivers").insert({ name, car });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });

  const deleteDriver = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("drivers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });

  return { ...query, addDriver, deleteDriver };
};
