import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getUserFinancialData } from "@/integrations/supabase/db";
import { Header } from "@/components/Header";
import { RedemptionsHistory } from "@/components/RedemptionsHistory";
import { BRANDS, type Brand } from "@/lib/brands";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Account = Database["public"]["Tables"]["accounts"]["Row"];

const Redemptions = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    fetchUserData(user.id);
  }, [user]);

  const fetchUserData = async (userId: string) => {
    try {
      const { profile: profileData, account: accountData } =
        await getUserFinancialData(userId);
      setProfile(profileData as Profile | null);
      setAccount(accountData as Account | null);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSelectDenomination = (brand: Brand, amount: number) => {
    if (!account || amount > Number(account.balance)) {
      toast({
        title: "Insufficient balance",
        description: `You need £${(amount / 100).toFixed(2)} but your balance is £${(Number(account?.balance ?? 0) / 100).toFixed(2)}.`,
        variant: "destructive",
      });
      return;
    }
    setSelectedBrand(brand);
    setSelectedAmount(amount);
    setIsConfirmOpen(true);
  };

  const handleRedeem = async () => {
    if (!selectedBrand || !selectedAmount || !user) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "request-redemption",
        {
          body: {
            brand_name: selectedBrand.name,
            brand_slug: selectedBrand.slug,
            amount: selectedAmount,
          },
        },
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Voucher requested!",
        description: `Your ${selectedBrand.name} voucher request has been submitted. We'll email you when it's ready.`,
      });

      setIsConfirmOpen(false);
      setSelectedBrand(null);
      setSelectedAmount(null);

      await fetchUserData(user.id);
    } catch (err: unknown) {
      toast({
        title: "Request failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (pence: number) => `£${(pence / 100).toFixed(2)}`;
  const balance = Number(account?.balance ?? 0);

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
            Redeem Vouchers
          </h1>
        </div>

        <div className="space-y-8">
          {/* Balance card */}
          <Card className="shadow-sm border border-slate-100">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Available balance</p>
              <p className="text-4xl font-bold text-primary mt-1">
                {formatAmount(balance)}
              </p>
            </CardContent>
          </Card>

          {/* Brand catalog */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Choose a Voucher
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {BRANDS.map((brand) => (
                <Card
                  key={brand.slug}
                  className="shadow-sm border border-slate-100 hover:border-primary/30 transition-colors"
                >
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{brand.logo}</span>
                      <div>
                        <CardTitle className="text-sm font-semibold">
                          {brand.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {brand.category}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {brand.denominations.map((amount) => {
                        const canAfford = balance >= amount;
                        return (
                          <Button
                            key={amount}
                            size="sm"
                            variant={canAfford ? "outline" : "ghost"}
                            disabled={!canAfford}
                            className={
                              canAfford
                                ? "h-7 px-2 text-xs border-primary/40 text-primary hover:bg-primary hover:text-white"
                                : "h-7 px-2 text-xs opacity-40 cursor-not-allowed"
                            }
                            onClick={() =>
                              handleSelectDenomination(brand, amount)
                            }
                          >
                            {formatAmount(amount)}
                          </Button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Redemption history */}
          {user && <RedemptionsHistory userId={user.id} />}
        </div>
      </main>

      {/* Confirm dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Voucher Request</DialogTitle>
            <DialogDescription>
              Review the details before submitting your request.
            </DialogDescription>
          </DialogHeader>

          {selectedBrand && selectedAmount !== null && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <span className="text-3xl">{selectedBrand.logo}</span>
                <div>
                  <p className="font-semibold text-slate-900">
                    {selectedBrand.name}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatAmount(selectedAmount)}
                  </p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Current balance</span>
                  <span className="font-medium text-slate-700">
                    {formatAmount(balance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>After redemption</span>
                  <span className="font-medium text-slate-700">
                    {formatAmount(balance - selectedAmount)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                We'll source your voucher code and email you when it's ready —
                usually within 1 business day.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleRedeem} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting...
                </>
              ) : (
                "Confirm Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Redemptions;
