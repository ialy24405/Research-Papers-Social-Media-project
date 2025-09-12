import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainSidebar } from '@/components/main-sidebar';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset className="flex flex-col min-h-svh">
        <Header />
        <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
