import { Skeleton } from "@/components/ui";

export default function ProviderApplicationLoading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton shape="text" className="w-40" />
      <Skeleton shape="block" className="h-24 w-full" />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Skeleton shape="block" className="h-64 w-full" />
          <Skeleton shape="block" className="h-80 w-full" />
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton shape="block" className="h-44 w-full" />
          <Skeleton shape="block" className="h-72 w-full" />
        </div>
      </div>
    </div>
  );
}
