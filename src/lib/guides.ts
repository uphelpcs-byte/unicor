import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type QuickCell = { k: string; v: string };

export type Guide = {
  id: string;
  model_code: string;
  series: string;
  eyebrow: string;
  kind: string;
  description: string;
  quick_card: QuickCell[];
  quick_note: string;
  sort_order: number;
};

export type GuideSection = {
  id: string;
  guide_id: string;
  label: string;
  title: string;
  body_html: string;
  sort_order: number;
};

export function useGuides() {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel(`guides-realtime-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guides" },
        () => {
          qc.invalidateQueries({ queryKey: ["guides"] });
          qc.invalidateQueries({ queryKey: ["guide"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guide_sections" },
        () => {
          qc.invalidateQueries({ queryKey: ["guide"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["guides"],
    queryFn: async (): Promise<Guide[]> => {
      const { data, error } = await supabase
        .from("guides")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Guide[];
    },
  });
}

export function useGuide(modelCode: string) {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel(`guide-${modelCode}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guides" },
        () => qc.invalidateQueries({ queryKey: ["guide", modelCode] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "guide_sections" },
        () => qc.invalidateQueries({ queryKey: ["guide", modelCode] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [modelCode, qc]);

  return useQuery({
    queryKey: ["guide", modelCode],
    queryFn: async () => {
      const { data: g, error: ge } = await supabase
        .from("guides")
        .select("*")
        .eq("model_code", modelCode)
        .maybeSingle();
      if (ge) throw ge;
      if (!g) return null;
      const { data: s, error: se } = await supabase
        .from("guide_sections")
        .select("*")
        .eq("guide_id", (g as { id: string }).id)
        .order("sort_order", { ascending: true });
      if (se) throw se;
      return {
        guide: g as unknown as Guide,
        sections: (s ?? []) as unknown as GuideSection[],
      };
    },
  });
}