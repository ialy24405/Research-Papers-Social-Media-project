export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
       <div
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 30%, hsl(var(--primary) / 0.1), transparent 40%), radial-gradient(circle at 75% 70%, hsl(var(--accent) / 0.1), transparent 40%)',
        }}
      ></div>
      {children}
    </div>
  );
}
