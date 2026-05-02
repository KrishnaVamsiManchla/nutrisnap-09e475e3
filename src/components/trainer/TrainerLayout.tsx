import { ReactNode } from "react";
import TrainerBottomNav from "./TrainerBottomNav";

interface Props {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
}

const TrainerLayout = ({ title, right, children }: Props) => {
  return (
    <div className="min-h-screen bg-background pb-28">
      {title && (
        <header className="sticky top-0 z-40 border-b border-border/40 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
            {right}
          </div>
        </header>
      )}
      <main className="mx-auto max-w-lg px-5 pt-4">{children}</main>
      <TrainerBottomNav />
    </div>
  );
};

export default TrainerLayout;
