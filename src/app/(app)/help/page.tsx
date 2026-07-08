import {
  Search,
  ListPlus,
  Users,
  Star,
  SlidersHorizontal,
  Archive,
  Info,
} from "lucide-react";

const sections = [
  {
    icon: ListPlus,
    title: "Create a list",
    body: "Go to Lists → New list. Give it a name and pick Personal or Shared — you can always turn a personal list into a shared one later from its settings.",
  },
  {
    icon: Search,
    title: "Find and add something to watch",
    body: "Use Search to look up a film or series. Ratings, seasons, and where it's streaming show right on the result. Tap a result to add it to one of your lists, choosing a streaming service, priority, and notes.",
  },
  {
    icon: Info,
    title: "See the synopsis",
    body: "Tap the ⓘ icon on any poster to see the plot, cast, and director without opening the add/edit panel.",
  },
  {
    icon: SlidersHorizontal,
    title: "Filter and sort a list",
    body: "Inside a list, tap Filters to narrow by status, streaming service, priority, type, or episode availability, and to change the sort order. Tap the grid/list icons to switch views — your choice is remembered.",
  },
  {
    icon: Archive,
    title: "Track watch status",
    body: "Use the ⋮ menu on a card to mark something Watching, Watched, or Dropped. Watched and Dropped titles move to the Archive tab automatically, or archive something manually without changing its status.",
  },
  {
    icon: Star,
    title: "Rate and review",
    body: "Tap the review line under any title to leave a star rating and comment. You can edit or delete your own review any time; everyone with access to the list can see all reviews.",
  },
  {
    icon: Users,
    title: "Share a list",
    body: "Open a list's Settings and invite someone by email — this also turns a personal list into a shared one. Choose Editor (can add/edit items) or Viewer (read-only), and change or remove members any time.",
  },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Help</h1>
        <p className="text-sm text-muted-foreground">
          A quick guide to what you can do in Wotchlist.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3 rounded-lg border border-border p-3">
            <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
