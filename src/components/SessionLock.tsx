import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Lock, Loader2 } from "lucide-react";

// Lock after 10 minutes of inactivity
const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

export function SessionLock({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!user) return;
    timerRef.current = setTimeout(() => {
      setIsLocked(true);
    }, INACTIVITY_TIMEOUT_MS);
  }, [user]);

  useEffect(() => {
    if (!user) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsLocked(false);
      return;
    }

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true }),
    );
    resetTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer),
      );
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, resetTimer]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;

    setIsUnlocking(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (error) {
      setError("Incorrect password. Please try again.");
      setIsUnlocking(false);
    } else {
      setIsLocked(false);
      setPassword("");
      resetTimer();
      setIsUnlocking(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsLocked(false);
    setPassword("");
  };

  return (
    <>
      {children}
      {isLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <div className="w-full max-w-sm px-4">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-primary" />
                <span className="text-xl font-bold text-primary">
                  Treatcode
                </span>
              </div>
              <h2 className="text-xl font-semibold mt-2">
                Your session has been locked
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                You've been away for a while. Enter your password to continue.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="lock-email">Email</Label>
                <Input
                  id="lock-email"
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lock-password">Password</Label>
                <Input
                  id="lock-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  autoFocus
                  required
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isUnlocking || !password}
              >
                {isUnlocking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  "Unlock"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm text-muted-foreground hover:text-primary underline"
              >
                Sign out instead
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
