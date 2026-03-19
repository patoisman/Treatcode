type ToastFn = (input: {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}) => unknown;

const SESSION_EXPIRED_TOAST_KEY = "session-expired-toast-ts";
const SESSION_EXPIRED_TOAST_COOLDOWN_MS = 5000;

export function showSessionExpiredToastOnce(toast: ToastFn) {
  if (typeof window === "undefined") {
    return;
  }

  const now = Date.now();

  try {
    const lastShown = Number(
      window.sessionStorage.getItem(SESSION_EXPIRED_TOAST_KEY) || 0,
    );

    if (now - lastShown < SESSION_EXPIRED_TOAST_COOLDOWN_MS) {
      return;
    }

    window.sessionStorage.setItem(SESSION_EXPIRED_TOAST_KEY, String(now));
  } catch {
    // Continue and show toast even if sessionStorage is unavailable
  }

  toast({
    title: "Session expired",
    description: "Please sign in again to continue.",
    variant: "destructive",
  });
}
