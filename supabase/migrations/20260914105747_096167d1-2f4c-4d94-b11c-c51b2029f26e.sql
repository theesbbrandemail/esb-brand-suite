CREATE TABLE public.content_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  image_url text,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_posts TO authenticated;
GRANT ALL ON public.content_posts TO service_role;

ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content staff manage" ON public.content_posts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "content published readable" ON public.content_posts FOR SELECT TO authenticated
  USING (status = 'published');

CREATE INDEX content_posts_branch_idx ON public.content_posts(branch_id);

CREATE TRIGGER content_posts_touch BEFORE UPDATE ON public.content_posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();