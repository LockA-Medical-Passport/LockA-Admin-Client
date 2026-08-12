import { Skeleton } from "@/components/ui";

export default function ApplicationsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton shape="text" className="h-5 w-56" />
        <Skeleton shape="text" className="w-80" />
      </div>

      <Skeleton shape="block" className="h-24 w-full" />
      <Skeleton shape="block" className="h-96 w-full" />
    </div>
  );
}
