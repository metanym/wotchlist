import { SearchView } from "./search-view";

export default function SearchPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Search</h1>
      <SearchView />
    </div>
  );
}
