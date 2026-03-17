import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  UserRole,
  useCallerProfile,
  useCallerRole,
  useSaveProfile,
} from "../../hooks/useQueries";

function roleBadge(role: UserRole) {
  switch (role) {
    case UserRole.admin:
      return (
        <Badge className="border-primary/20 bg-primary/10 text-primary text-xs">
          Admin
        </Badge>
      );
    case UserRole.user:
      return (
        <Badge className="border-success/20 bg-success/10 text-success text-xs">
          Job Seeker
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-xs">
          Guest
        </Badge>
      );
  }
}

export function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: role, isLoading: roleLoading } = useCallerRole();
  const saveProfile = useSaveProfile();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  // Populate from loaded profile
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setEmail(profile.email ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
        role: role ?? UserRole.guest,
      });
      toast.success("Profile saved successfully!");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  const isLoading = profileLoading || roleLoading;
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const principalStr = identity?.getPrincipal().toString();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display mb-1 text-2xl font-700 tracking-tight">
          Profile
        </h1>
        <p className="text-muted-foreground">
          Manage your personal information
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        {/* Avatar + role */}
        <div className="mb-8 flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary font-display font-700 text-lg">
              {isLoading ? <User className="h-6 w-6" /> : initials}
            </AvatarFallback>
          </Avatar>
          <div>
            {isLoading ? (
              <>
                <Skeleton className="mb-2 h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <p className="font-display font-700 text-lg">
                  {name || "Anonymous"}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  {roleBadge(role ?? UserRole.guest)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Principal ID */}
        {principalStr && (
          <div className="mb-6 rounded-lg bg-muted/40 p-3">
            <p className="mb-0.5 text-xs font-600 text-muted-foreground uppercase tracking-wide">
              Principal ID
            </p>
            <p className="font-mono text-xs text-foreground break-all">
              {principalStr}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full Name *</Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input
                id="profile-name"
                data-ocid="profile.name_input"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email">Email Address</Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Input
                id="profile-email"
                data-ocid="profile.email_input"
                type="email"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-bio">Bio</Label>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <Textarea
                id="profile-bio"
                data-ocid="profile.bio_textarea"
                placeholder="Tell us a bit about yourself, your skills, and career goals..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="resize-none"
              />
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={saveProfile.isPending || isLoading}
            data-ocid="profile.save_button"
            className="w-full gap-2"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
