// Component: GoCardless Callback Handler
// Handles the redirect from GoCardless after DD setup

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface GoCardlessCallbackProps {
  onComplete?: () => void;
}

export function GoCardlessCallback({ onComplete }: GoCardlessCallbackProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "processing" | "success" | "error" | "cancelled"
  >("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const ddSetupParam = searchParams.get("dd_setup");

    if (ddSetupParam === "complete") {
      completeSetup();
    } else if (ddSetupParam === "cancelled") {
      setStatus("cancelled");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const completeSetup = async () => {
    try {
      // Get flow ID from session storage
      const flowId = sessionStorage.getItem("gc_flow_id");

      if (!flowId) {
        throw new Error("No flow ID found. Please try setting up again.");
      }

      // Call Edge Function to complete the billing request
      const { data, error } = await supabase.functions.invoke(
        "complete-billing-request",
        {
          body: { flow_id: flowId },
        },
      );

      if (error) throw error;

      if (data.success) {
        setStatus("success");

        // Clear flow ID from session
        sessionStorage.removeItem("gc_flow_id");

        toast({
          title: "Direct Debit Setup Complete!",
          description: `Your monthly deposits of £${data.amount ? (data.amount / 100).toFixed(2) : "..."} are now active`,
        });

        // Call completion callback after a short delay
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      } else {
        throw new Error("Setup completion failed");
      }
    } catch (error) {
      console.error("Error completing DD setup:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to complete setup",
      );

      toast({
        title: "Setup Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to complete Direct Debit setup",
        variant: "destructive",
      });
    }
  };

  const handleRetry = () => {
    // Clear session storage to prevent retry with same flow ID
    sessionStorage.removeItem("gc_flow_id");

    // Navigate to dashboard without URL params (clean slate)
    navigate("/dashboard", { replace: true });
  };

  if (status === "processing") {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">Completing Setup...</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Please wait while we finalize your Direct Debit
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="w-full max-w-md mx-auto border-green-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-900">
                Setup Complete!
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your Direct Debit is now active. Your first deposit will be
                collected shortly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "cancelled") {
    return (
      <Card className="w-full max-w-md mx-auto border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-900">Setup Cancelled</CardTitle>
          <CardDescription>
            You cancelled the Direct Debit setup process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              No changes have been made to your account. You can try setting up
              again whenever you're ready.
            </p>
            <Button onClick={handleRetry} className="w-full">
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-md mx-auto border-red-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="rounded-full bg-red-100 p-3">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-red-900">
                Setup Failed
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {errorMessage || "An error occurred during setup"}
              </p>
            </div>
            <Button onClick={handleRetry} variant="outline" className="w-full">
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
