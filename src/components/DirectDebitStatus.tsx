// Component: Direct Debit Status Display
// Shows current DD mandate status and allows management

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Loader2, Calendar, Coins } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type DirectDebitSettings =
  Database["public"]["Tables"]["direct_debit_settings"]["Row"];
type MandateStatus =
  Database["public"]["Tables"]["profiles"]["Row"]["mandate_status"];

interface DirectDebitStatusProps {
  userId: string;
  onCancelled?: () => void;
}

export function DirectDebitStatus({
  userId,
  onCancelled,
}: DirectDebitStatusProps) {
  const [settings, setSettings] = useState<DirectDebitSettings | null>(null);
  const [mandateStatus, setMandateStatus] = useState<MandateStatus>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchDirectDebitInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchDirectDebitInfo = async () => {
    try {
      setIsLoading(true);

      // Get DD settings
      const { data: ddData, error: ddError } = await supabase
        .from("direct_debit_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (ddError && ddError.code !== "PGRST116") {
        throw ddError;
      }

      setSettings(ddData);

      // Get mandate status from profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("mandate_status")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      setMandateStatus(profileData.mandate_status);
    } catch (error) {
      console.error("Error fetching DD info:", error);
      toast({
        title: "Error",
        description: "Failed to load Direct Debit information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDirectDebit = async () => {
    try {
      setIsCancelling(true);

      const { data, error } = await supabase.functions.invoke(
        "manage-subscription",
        {
          body: { action: "cancel" },
        },
      );

      if (error) throw error;

      toast({
        title: "Direct Debit Cancelled",
        description: "Your Direct Debit has been successfully cancelled",
      });

      // Refresh data
      await fetchDirectDebitInfo();

      onCancelled?.();
    } catch (error) {
      console.error("Error cancelling DD:", error);
      toast({
        title: "Cancellation failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to cancel Direct Debit",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (
    !settings ||
    !mandateStatus ||
    mandateStatus === "cancelled" ||
    mandateStatus === "expired"
  ) {
    return null; // Show setup form instead
  }

  const getStatusBadge = () => {
    if (mandateStatus === "active") {
      return (
        <Badge className="bg-green-500">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    if (mandateStatus === "pending") {
      return (
        <Badge className="bg-yellow-500">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Pending
        </Badge>
      );
    }
    if (mandateStatus === "cancelled" || mandateStatus === "expired") {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      );
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const formatAmount = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Direct Debit
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>Your monthly Treatcode deposits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Settings */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Monthly Amount</p>
            <p className="text-2xl font-bold">
              {formatAmount(settings.monthly_amount)}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Collection Day
            </p>
            <p className="text-2xl font-bold">
              {settings.collection_day}
              {getOrdinalSuffix(settings.collection_day)}
            </p>
            <p className="text-xs text-muted-foreground">of each month</p>
          </div>
        </div>

        {/* Status Info */}
        {mandateStatus === "pending" && (
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-sm font-medium text-yellow-900">
              Setup In Progress
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Please complete the GoCardless setup process to activate your
              Direct Debit
            </p>
          </div>
        )}

        {mandateStatus === "active" && settings.active && (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm font-medium text-green-900">
              ✓ Direct Debit Active
            </p>
            <p className="text-xs text-green-700 mt-1">
              Your next deposit of {formatAmount(settings.monthly_amount)} will
              be collected on the {settings.collection_day}
              {getOrdinalSuffix(settings.collection_day)}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Cancel DD Dialog */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1"
                disabled={isCancelling}
              >
                Cancel Direct Debit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Direct Debit?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>This will stop all future monthly deposits.</p>
                  <p className="font-medium">
                    Your current Treatcode balance will remain available.
                  </p>
                  <p>You can set up Direct Debit again at any time.</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Active</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelDirectDebit}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Yes, Cancel"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
