import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { User, Session } from "@supabase/supabase-js";
import { DirectDebitSetup } from "@/components/DirectDebitSetup";
import { DirectDebitStatus } from "@/components/DirectDebitStatus";
import { getUserFinancialData } from "@/integrations/supabase/db";
import { Header } from "@/components/Header";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const DirectDebit = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchUserData(session.user.id);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        navigate("/auth");
      } else {
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    try {
      const { profile: profileData } = await getUserFinancialData(userId);
      setProfile(profileData as Profile | null);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header userEmail={user?.email} userName={profile?.full_name} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header userEmail={user?.email} userName={profile?.full_name} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="pl-0 hover:bg-transparent text-primary hover:text-primary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">
            Direct Debit Management
          </h1>
          <p className="text-slate-600 mt-2">
            Set up and manage your Direct Debit payments
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Payment Setup
            </h2>
            {profile?.mandate_status === "active" ? (
              <DirectDebitStatus
                userId={user?.id || ""}
                onCancelled={() => {
                  fetchUserData(user?.id || "");
                }}
              />
            ) : (
              <DirectDebitSetup
                onSuccess={() => {
                  fetchUserData(user?.id || "");
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DirectDebit;
