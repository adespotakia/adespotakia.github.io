
import { Outlet } from "@/lib/router-compat";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useViewMode } from "@/contexts/ViewModeContext";

const Layout = () => {
  const isMobile = useIsMobile();
  const { isMobileView } = useViewMode();

  // Use mobile view if either device is mobile OR user toggled mobile view
  const shouldUseMobileLayout = isMobile || isMobileView;

  return (
    <div className={`min-h-screen flex flex-col ${isMobileView ? 'max-w-md mx-auto border-x border-gray-200' : ''}`}>
      <Navbar />
      <main className={`flex-grow ${shouldUseMobileLayout ? 'px-4 py-4' : 'container py-6'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
