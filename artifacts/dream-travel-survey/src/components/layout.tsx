import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full relative overflow-x-hidden">
      {/* Background ambient accents */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[20%] -left-[10%] w-[40%] h-[40%] rounded-full bg-accent/40 blur-[100px]" />
      </div>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="w-full py-8 mt-auto border-t border-border/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            Survey by Amanda Williams, BAIS:3300 - Spring 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}
