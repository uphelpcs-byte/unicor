CREATE TABLE public.guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_code text UNIQUE NOT NULL,
  series text NOT NULL DEFAULT 'MASTERS',
  eyebrow text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  quick_card jsonb NOT NULL DEFAULT '[]'::jsonb,
  quick_note text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.guide_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id uuid NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  body_html text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX guide_sections_guide_id_idx ON public.guide_sections(guide_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.guides TO anon, authenticated;
GRANT ALL ON public.guides TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guide_sections TO anon, authenticated;
GRANT ALL ON public.guide_sections TO service_role;

ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read guides" ON public.guides FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public insert guides" ON public.guides FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update guides" ON public.guides FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public delete guides" ON public.guides FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public read sections" ON public.guide_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public insert sections" ON public.guide_sections FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update sections" ON public.guide_sections FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public delete sections" ON public.guide_sections FOR DELETE TO anon, authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.guides;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guide_sections;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER guides_updated_at BEFORE UPDATE ON public.guides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER guide_sections_updated_at BEFORE UPDATE ON public.guide_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();