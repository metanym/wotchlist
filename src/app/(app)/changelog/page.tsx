const entries = [
  {
    date: "13 July 2026",
    items: [
      "Reminders now also send you an email on the date you set, not just an in-app notification",
      "Wotchlist now fills the screen on tablets and larger displays, with more titles per row",
    ],
  },
  {
    date: "10 July 2026",
    items: [
      "Get notified when someone adds something to a shared list",
      "Set a personal reminder or availability-check alert on any title, with a suggested date for still-airing series",
      "Content ratings now show real UK certificates (12A, 15, U) for movies",
      "Runtime shown on movies",
      "Shared-list cards show who added each title",
      "\"Watching\" items always show first, with your chosen sort order applied within Watching and then the rest — remembered between visits",
      "Jump straight between lists from the list title",
    ],
  },
  {
    date: "9 July 2026",
    items: [
      "HBO Max added as a streaming service option",
      "Create a new list on the fly while adding something from search",
      "Add a personal message when inviting someone to a shared list",
    ],
  },
  {
    date: "8 July 2026",
    items: [
      "See ratings, seasons, and streaming availability on search results before adding",
      "Tap the ⓘ icon to see a title's synopsis, cast, and director",
      "Rate and review anything on a shared list",
      "Filters simplified into a single button",
      "List cards show a cover image and description",
      "Added a Help section",
    ],
  },
  {
    date: "7 July 2026",
    items: [
      "Wotchlist launches — personal and shared watchlists, search, watch status, and sharing",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">What&apos;s new</h1>
        <p className="text-sm text-muted-foreground">Recent updates to Wotchlist.</p>
      </div>

      <div className="flex flex-col gap-6">
        {entries.map(({ date, items }) => (
          <div key={date} className="flex flex-col gap-2">
            <h2 className="text-sm font-medium text-muted-foreground">{date}</h2>
            <ul className="flex flex-col gap-1.5">
              {items.map((item) => (
                <li key={item} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
