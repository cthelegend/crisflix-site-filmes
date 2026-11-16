import { useEffect, useState } from "react";
import MovieRow from "./MovieRow";
import { useSiteContent } from "@/contexts/SiteContentContext";
import { resolveMedia } from "@/lib/siteContent";
import type { Movie } from "@/lib/tmdb";
export default function EditorialRows() {
  const { content } = useSiteContent();
  const [rows, setRows] = useState<{ id: string; title: string; items: Movie[] }[]>([]);
  useEffect(() => {
    let cancelled = false;
    Promise.all(content.collections.filter(c => c.enabled && c.items.length).map(async c => ({ id: c.id, title: c.title, items: await resolveMedia(c.items) })))
      .then(rows => { if (!cancelled) setRows(rows); });
    return () => { cancelled = true; };
  }, [content.collections]);
  return <>{rows.filter(r => r.items.length).map(r => <MovieRow key={r.id} title={r.title} items={r.items} />)}</>;
}
