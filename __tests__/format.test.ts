import { describe, it, expect } from "vitest";
import { timeAgo, formatDate, formatDateTime, getStatusInfo } from "../lib/format";

describe("timeAgo", () => {
  it("returns empty string for null/undefined", () => {
    expect(timeAgo(null)).toBe("");
    expect(timeAgo(undefined)).toBe("");
  });

  it("returns 'just now' for recent dates", () => {
    const now = new Date();
    expect(timeAgo(now)).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinAgo)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(timeAgo(twoHoursAgo)).toBe("2h ago");
  });

  it("returns days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(timeAgo(threeDaysAgo)).toBe("3d ago");
  });

  it("handles string dates", () => {
    const recent = new Date(Date.now() - 60 * 1000).toISOString();
    expect(timeAgo(recent)).toBe("1m ago");
  });
});

describe("formatDate", () => {
  it("returns empty string for null", () => {
    expect(formatDate(null)).toBe("");
  });

  it("formats a date correctly", () => {
    const result = formatDate("2025-03-15T12:00:00Z");
    expect(result).toContain("Mar");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });
});

describe("formatDateTime", () => {
  it("returns empty string for null", () => {
    expect(formatDateTime(null)).toBe("");
  });

  it("formats a date with time", () => {
    const result = formatDateTime("2025-06-20T14:30:00Z");
    expect(result).toContain("Jun");
    expect(result).toContain("20");
  });
});

describe("getStatusInfo", () => {
  it("returns correct info for accepted", () => {
    const info = getStatusInfo("accepted");
    expect(info.label).toBe("Accepted");
    expect(info.variant).toBe("success");
  });

  it("returns correct info for pending", () => {
    const info = getStatusInfo("pending");
    expect(info.label).toBe("Pending");
    expect(info.variant).toBe("warning");
  });

  it("returns correct info for declined", () => {
    const info = getStatusInfo("declined");
    expect(info.label).toBe("Declined");
    expect(info.variant).toBe("error");
  });

  it("returns correct info for cancelled", () => {
    const info = getStatusInfo("cancelled");
    expect(info.label).toBe("Cancelled");
    expect(info.variant).toBe("muted");
  });

  it("returns muted for unknown status", () => {
    const info = getStatusInfo("unknown");
    expect(info.variant).toBe("muted");
  });
});
