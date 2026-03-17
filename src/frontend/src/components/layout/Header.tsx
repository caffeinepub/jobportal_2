import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  FileText,
  Home,
  LogOut,
  Menu,
  Shield,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { UserRole } from "../../hooks/useQueries";

type Page = "home" | "applications" | "admin" | "profile";

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  role: UserRole;
}

export function Header({ currentPage, onNavigate, role }: HeaderProps) {
  const { clear } = useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = role === UserRole.admin;
  const isUser = role === UserRole.user || role === UserRole.admin;

  const navItems = [
    {
      id: "home" as Page,
      label: "Home",
      icon: Home,
      ocid: "nav.home_link",
      show: true,
    },
    {
      id: "applications" as Page,
      label: "My Applications",
      icon: FileText,
      ocid: "nav.applications_link",
      show: isUser && !isAdmin,
    },
    {
      id: "admin" as Page,
      label: "Admin",
      icon: Shield,
      ocid: "nav.admin_link",
      show: isAdmin,
    },
    {
      id: "profile" as Page,
      label: "Profile",
      icon: User,
      ocid: "nav.profile_link",
      show: true,
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          data-ocid="nav.home_link"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-700 tracking-tight">
            JobPortal
          </span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-ocid={item.ocid}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-500 transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Badge
              variant="secondary"
              className="hidden text-xs sm:inline-flex"
            >
              Admin
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => clear()}
            data-ocid="nav.logout_button"
            className="hidden gap-2 md:flex"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-border/50 bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-ocid={item.ocid}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-500 transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            <button
              type="button"
              data-ocid="nav.logout_button"
              onClick={() => clear()}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-500 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
