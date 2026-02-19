import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseRealtimeCreatorsOptions {
  onNewCreator?: () => void;
}

export function useRealtimeCreators({ onNewCreator }: UseRealtimeCreatorsOptions = {}) {
  const onNewCreatorRef = useRef(onNewCreator);
  onNewCreatorRef.current = onNewCreator;

  useEffect(() => {
    const channel = supabase
      .channel("creators-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "creators" },
        (payload) => {
          const newCreator = payload.new as { username?: string; full_name?: string };
          toast.success("New creator scraped", {
            description: `@${newCreator.username || "unknown"}${newCreator.full_name ? ` — ${newCreator.full_name}` : ""}`,
          });
          onNewCreatorRef.current?.();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "creators" },
        () => {
          onNewCreatorRef.current?.();
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "creators" },
        () => {
          toast.info("Creator removed");
          onNewCreatorRef.current?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
