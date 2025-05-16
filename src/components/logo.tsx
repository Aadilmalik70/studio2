import { Eye } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-3xl font-bold text-primary">
      <Eye className="h-8 w-8 stroke-[2.5]" />
      <h1>SERP Eye</h1>
    </div>
  );
}
