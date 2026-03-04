import { Users } from "lucide-react";

const Groups = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 pb-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Users className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-1">Groups</h2>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Join or create groups to track nutrition goals together. Coming soon.
      </p>
    </div>
  );
};

export default Groups;
