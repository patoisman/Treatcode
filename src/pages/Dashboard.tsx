import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getUserFinancialData } from "@/integrations/supabase/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  CreditCard,
  Gift,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Wallet,
  History,
} from "lucide-react";
import { Header } from "@/components/Header";
import { GoCardlessCallback } from "@/components/GoCardlessCallback";
import { useAuth } from "@/hooks/useAuth";

interface Account {
  id: string;
  balance: number;
  created_at: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: "credit" | "debit";
  description: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  is_admin: boolean;
  mandate_status: string | null;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchUserData(user.id);
  }, [user]);

  const fetchUserData = async (userId: string) => {
    setIsLoadingData(true);
    try {
      const {
        profile: profileData,
        account: accountData,
        transactions: transactionsData,
      } = await getUserFinancialData(userId);

      setProfile(profileData || null);
      setAccount(accountData || null);

      const typedTransactions = (transactionsData || []).map((transaction) => ({
        ...transaction,
        type: transaction.type as "credit" | "debit",
      }));
      setTransactions(typedTransactions.slice(0, 10));
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error Loading Data",
        description:
          error?.message ||
          "Failed to load your account data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You've been successfully signed out.",
      });
      navigate("/");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if we're handling a GoCardless callback
  const ddSetupParam = searchParams.get("dd_setup");
  if (ddSetupParam) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
        <Header
          userEmail={user?.email}
          userName={profile?.full_name}
          isAdmin={profile?.is_admin === true}
        />
        <main className="container mx-auto px-4 pt-24 pb-8 flex items-center justify-center min-h-[calc(100vh)]">
          <GoCardlessCallback
            onComplete={() => {
              window.location.href = "/dashboard";
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Header
        userEmail={user?.email}
        userName={profile?.full_name}
        isAdmin={profile?.is_admin === true}
      />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {isLoadingData ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Balance Card */}
            <Card className="lg:col-span-2 shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Treatcode Balance</CardTitle>
                    <CardDescription>
                      Available to spend on vouchers
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                  >
                    {showBalance ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-4">
                  {showBalance
                    ? formatCurrency(account?.balance || 0)
                    : "••••••"}
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Account opened:{" "}
                      {account?.created_at
                        ? formatDate(account.created_at)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate("/dashboard/direct-debit")}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {profile?.mandate_status === "active"
                    ? "Manage Direct Debit"
                    : "Setup Direct Debit"}
                </Button>

                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate("/dashboard/deposits")}
                >
                  <History className="mr-2 h-4 w-4" />
                  Deposit History
                </Button>

                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate("/dashboard/redemptions")}
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Redemption History
                </Button>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="lg:col-span-3 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <CardDescription>Your latest account activity</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm">
                      Your transaction history will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`p-2 rounded-full flex-shrink-0 ${
                              transaction.type === "credit"
                                ? "bg-accent/20 text-accent"
                                : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {transaction.type === "credit" ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {transaction.description || "Transaction"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`font-semibold ${
                            transaction.type === "credit"
                              ? "text-accent"
                              : "text-destructive"
                          }`}
                        >
                          {transaction.type === "credit" ? "+" : "-"}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
