import Header from "@/components/Header";

type LoginPageShellProps = {
  children: React.ReactNode;
};

export default function LoginPageShell({ children }: LoginPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-cream">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}
