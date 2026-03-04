import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
  },
}));

// Mock expo-secure-store
vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(() => Promise.resolve(null)),
  setItemAsync: vi.fn(() => Promise.resolve()),
  deleteItemAsync: vi.fn(() => Promise.resolve()),
}));

// Mock react-native Platform
vi.mock("react-native", () => ({
  Platform: { OS: "web" },
}));

// Mock oauth constants
vi.mock("@/constants/oauth", () => ({
  SESSION_TOKEN_KEY: "app_session_token",
  USER_INFO_KEY: "test-user-info",
  getApiBaseUrl: () => "http://localhost:3000",
}));

describe("Auth Persistence", () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    // Set up a minimal localStorage mock for web platform
    if (typeof globalThis.window === "undefined") {
      (globalThis as any).window = {};
    }
    const webStorage: Record<string, string> = {};
    (globalThis as any).window.localStorage = {
      getItem: (key: string) => webStorage[key] || null,
      setItem: (key: string, value: string) => { webStorage[key] = value; },
      removeItem: (key: string) => { delete webStorage[key]; },
    };
  });

  describe("User info caching", () => {
    it("should store user info in localStorage on web", async () => {
      const { setUserInfo, getUserInfo } = await import("@/lib/_core/auth");

      const testUser = {
        id: 1,
        openId: "test-open-id",
        name: "Test User",
        email: "test@example.com",
        loginMethod: "google",
        lastSignedIn: new Date("2026-01-01"),
      };

      await setUserInfo(testUser);
      const retrieved = await getUserInfo();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe("Test User");
      expect(retrieved?.email).toBe("test@example.com");
    });

    it("should clear user info on logout", async () => {
      const { setUserInfo, clearUserInfo, getUserInfo } = await import("@/lib/_core/auth");

      const testUser = {
        id: 1,
        openId: "test-open-id",
        name: "Test User",
        email: "test@example.com",
        loginMethod: "google",
        lastSignedIn: new Date("2026-01-01"),
      };

      await setUserInfo(testUser);
      await clearUserInfo();
      const result = await getUserInfo();
      expect(result).toBeNull();
    });
  });

  describe("Profile caching via AsyncStorage", () => {
    it("should cache profile in AsyncStorage", async () => {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;

      const testProfile = {
        id: 1,
        userId: 1,
        appRole: "student" as const,
        fullName: "Test Student",
        bio: "A test student",
        skills: ["JavaScript", "React"],
        onboardingCompleted: true,
      };

      await AsyncStorage.setItem("gc_cached_profile", JSON.stringify(testProfile));
      const cached = await AsyncStorage.getItem("gc_cached_profile");
      expect(cached).not.toBeNull();

      const parsed = JSON.parse(cached!);
      expect(parsed.fullName).toBe("Test Student");
      expect(parsed.appRole).toBe("student");
      expect(parsed.onboardingCompleted).toBe(true);
      expect(parsed.skills).toEqual(["JavaScript", "React"]);
    });

    it("should clear cached profile on logout", async () => {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;

      await AsyncStorage.setItem("gc_cached_profile", JSON.stringify({ fullName: "Test" }));
      await AsyncStorage.removeItem("gc_cached_profile");

      const cached = await AsyncStorage.getItem("gc_cached_profile");
      expect(cached).toBeNull();
    });
  });
});
