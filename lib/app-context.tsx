import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const PROFILE_CACHE_KEY = "gc_cached_profile";

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
  const [restoredFromCache, setRestoredFromCache] = useState(false);

  // Restore cached profile on mount for instant display
  useEffect(() => {
    AsyncStorage.getItem(PROFILE_CACHE_KEY)
      .then((cached) => {
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as UserProfile;
            console.log("[AppContext] Restored cached profile:", parsed.fullName);
            setProfile(parsed);
          } catch (e) {
            console.warn("[AppContext] Failed to parse cached profile");
          }
        }
        setRestoredFromCache(true);
      })
      .catch(() => setRestoredFromCache(true));
  }, []);

  const profileQuery = trpc.profile.get.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: 1,
  });

  useEffect(() => {
    if (profileQuery.data) {
      const freshProfile = profileQuery.data as UserProfile;
      setProfile(freshProfile);
      setIsProfileLoading(false);
      // Cache the profile for next app launch
      AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(freshProfile)).catch(() => {});
    } else if (profileQuery.isError) {
      // If API fails but we have a cached profile, keep using it
      if (!profile) {
        setIsProfileLoading(false);
      } else {
        setIsProfileLoading(false);
      }
    } else if (!isAuthenticated && restoredFromCache) {
      // Not authenticated and no cache restore pending
      if (!profile) {
        setIsProfileLoading(false);
      }
    }
  }, [profileQuery.data, profileQuery.isError, isAuthenticated, restoredFromCache]);

  // When cache is restored and we have a profile, stop loading
  useEffect(() => {
    if (restoredFromCache && profile) {
      setIsProfileLoading(false);
    }
  }, [restoredFromCache, profile]);

  const refreshProfile = useCallback(() => {
    profileQuery.refetch();
  }, [profileQuery]);

  const role = profile?.appRole || null;
  const isOnboarded = profile?.onboardingCompleted === true;

  // Clear cached profile on logout
  useEffect(() => {
    if (!isAuthenticated && restoredFromCache && !profile) {
      AsyncStorage.removeItem(PROFILE_CACHE_KEY).catch(() => {});
    }
  }, [isAuthenticated, restoredFromCache, profile]);

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
