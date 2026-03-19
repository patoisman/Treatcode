import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { DepositsHistory } from "@/components/DepositsHistory";
import { getUserFinancialData } from "@/integrations/supabase/db";
import { Header } from "@/components/Header";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const Deposits = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    getUserFinancialData(user.id)
      .then(({ profile: profileData }) => {
        setProfile(profileData as Profile | null);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Header
        userEmail={user?.email}
        userName={profile?.full_name}
        isAdmin={profile?.is_admin === true}
      />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="pl-0 hover:bg-transparent text-primary hover:text-primary/80"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Deposit History</h2>

          <DepositsHistory userId={user?.id || ""} limit={50} />
        </div>
      </main>
    </div>
  );
};

export default Deposits;
