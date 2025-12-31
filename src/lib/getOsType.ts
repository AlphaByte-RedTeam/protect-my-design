export const getOsType = () => {
  if (typeof window === "undefined") return "server";
  const userAgent = navigator.userAgent;
  if (userAgent.includes("Mac")) return "mac";
  if (userAgent.includes("Windows")) return "windows";
  if (userAgent.includes("Linux")) return "linux";
  return "unknown";
};
