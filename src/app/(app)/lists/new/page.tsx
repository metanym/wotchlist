import { NewListForm } from "./new-list-form";

export default function NewListPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">New list</h1>
      <NewListForm />
    </div>
  );
}
