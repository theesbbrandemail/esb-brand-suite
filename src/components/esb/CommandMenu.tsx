import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export type CommandEntry = { to: string; label: string; group: string; icon: React.ComponentType<{ className?: string }> };

export function CommandMenu({ entries }: { entries: CommandEntry[] }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = Array.from(new Set(entries.map((e) => e.group)));
  const go = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search pages and tools"
        className="h-9 flex items-center gap-2 px-3 rounded-full border border-border bg-card/60 text-xs text-muted-foreground hover:text-foreground transition"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Search</span>
        <kbd className="hidden lg:inline text-[10px] px-1.5 rounded border border-border">Ctrl K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, brands, AI tools…" />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>
          {groups.map((g) => (
            <CommandGroup key={g} heading={g}>
              {entries
                .filter((e) => e.group === g)
                .map((e) => {
                  const Icon = e.icon;
                  return (
                    <CommandItem key={e.group + e.to} value={`${e.label} ${e.group}`} onSelect={() => go(e.to)}>
                      <Icon className="h-4 w-4 text-gold mr-2" />
                      {e.label}
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
