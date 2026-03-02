import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export type AppRole = "student" | "mentor";

export type UserProfile = {
  id: number;
  userId: number;
  appRole: AppRole;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  fieldOfInterest: string | null;
  skills: string[] | null;
  careerGoals: string | null;
  graduationYear: number | null;
  educationStatus: string | null;
  jobTitle: string | null;
  company: string | null;
  industry: string | null;
  location: string | null;
  yearsExperience: number | null;
  mentoringAreas: string[] | null;
  availabilityPreference: string | null;
  openToStudents: boolean | null;
  isVerified: boolean | null;
  onboardingCompleted: boolean | null;
};

type AppContextValue = {
  profile: UserProfile | null;
  isProfileLoading: boolean;
  refreshProfile: () => void;
  role: AppRole | null;
  isOnboarded: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const profileQuery = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: 1,
  });

  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data as UserProfile);
      setIsProfileLoading(false);
    } else if (profileQuery.isError || !isAuthenticated) {
      setProfile(null);
      setIsProfileLoading(false);
    }
  }, [profileQuery.data, profileQuery.isError, isAuthenticated]);

  const refreshProfile = useCallback(() => {
    profileQuery.refetch();
  }, [profileQuery]);

  const role = profile?.appRole || null;
  const isOnboarded = profile?.onboardingCompleted === true;

  return (
    <AppContext.Provider value={{ profile, isProfileLoading, refreshProfile, role, isOnboarded }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
