export default function ChatDateDivider({ date }: { date: string }) {
  return (
    <div className="my-4 flex items-center justify-center">
      <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
        {date}
      </span>
    </div>
  );
}
