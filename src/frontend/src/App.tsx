import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { Header } from "./components/layout/Header";
import { AdminDashboard } from "./components/pages/AdminDashboard";
import { JobBoard } from "./components/pages/JobBoard";
import { LandingPage } from "./components/pages/LandingPage";
import { MyApplications } from "./components/pages/MyApplications";
import { ProfilePage } from "./components/pages/ProfilePage";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerRole } from "./hooks/useQueries";
import { UserRole } from "./hooks/useQueries";

type Page = "home" | "applications" | "admin" | "profile";

function AppLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
        <Briefcase className="h-6 w-6 text-primary-foreground" />
      </div>
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-4 w-32" />
        <p className="text-sm text-muted-foreground">Loading JobPortal...</p>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-4 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}

function AuthenticatedApp() {
  const { data: role, isLoading: roleLoading } = useCallerRole();
  const [currentPage, setCurrentPage] = useState<Page>("home");

  // Default page for admin is admin dashboard
  useEffect(() => {
    if (!roleLoading && role === UserRole.admin) {
      setCurrentPage("admin");
    }
  }, [role, roleLoading]);

  if (roleLoading) {
    return <AppLoader />;
  }

  const resolvedRole = role ?? UserRole.guest;

  const handleNavigate = (page: Page) => {
    // Guard: non-admins can't access admin page
    if (page === "admin" && resolvedRole !== UserRole.admin) return;
    // Guard: guests can't access applications
    if (page === "applications" && resolvedRole === UserRole.guest) return;
    setCurrentPage(page);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        role={resolvedRole}
      />
      <main className="flex-1">
        {currentPage === "home" && <JobBoard />}
        {currentPage === "applications" && resolvedRole !== UserRole.admin && (
          <MyApplications />
        )}
        {currentPage === "admin" && resolvedRole === UserRole.admin && (
          <AdminDashboard />
        )}
        {currentPage === "profile" && <ProfilePage />}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <>
        <AppLoader />
        <Toaster />
      </>
    );
  }

  return (
    <>
      {identity ? <AuthenticatedApp /> : <LandingPage />}
      <Toaster />
    </>
  );
}
