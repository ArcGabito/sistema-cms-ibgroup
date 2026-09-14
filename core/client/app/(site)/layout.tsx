import TopBar from "@/app/components/layout/TopBar";
import Navbar from "@/app/components/layout/Navbar";
import Footer from "@/app/components/layout/Footer";
import FloatingContact from "@/app/components/ui/FloatingContact";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingContact />
    </>
  );
}
