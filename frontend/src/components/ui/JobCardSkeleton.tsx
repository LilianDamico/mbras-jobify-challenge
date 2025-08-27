// arquivo: src/components/JobCardSkeleton.tsx
export default function JobCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        <div className="skeleton size-10 rounded-lg" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-5 w-2/3 rounded-md" />
          <div className="skeleton h-4 w-1/2 rounded-md" />
          <div className="skeleton h-4 w-full rounded-md" />
          <div className="skeleton h-4 w-3/4 rounded-md" />
        </div>
      </div>
    </div>
  );
}
