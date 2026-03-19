import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DirectDebitSetup } from "@/components/DirectDebitSetup";
import { DirectDebitStatus } from "@/components/DirectDebitStatus";
import { getUserFinancialData } from "@/integrations/supabase/db";
import { Header } from "@/components/Header";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const DirectDebit = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchUserData(user.id);
  }, [user]);

  const fetchUserData = async (userId: string) => {
    try {
      const { profile: profileData } = await getUserFinancialData(userId);
      setProfile(profileData as Profile | null);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header
        userEmail={user?.email}
        userName={profile?.full_name}
        isAdmin={profile?.is_admin === true}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
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
