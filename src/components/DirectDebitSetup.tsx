// Component: Direct Debit Setup Form
// Allows users to initiate Direct Debit setup with GoCardless

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Shield, Clock } from "lucide-react";

const PRESET_AMOUNTS = [
  { value: 1000, label: "£10" },
  { value: 2500, label: "£25" },
  { value: 5000, label: "£50" },
  { value: 10000, label: "£100" },
];

const MIN_AMOUNT = 10;
const MAX_AMOUNT = 500;

interface DirectDebitSetupProps {
  onSuccess?: () => void;
}

export function DirectDebitSetup({ onSuccess }: DirectDebitSetupProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(5000); // Default £50
  const [customAmount, setCustomAmount] = useState<string>("");
  const [useCustomAmount, setUseCustomAmount] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAmountChange = (value: string) => {
    setUseCustomAmount(value === "custom");
    if (value !== "custom") {
      setSelectedAmount(parseInt(value));
      setCustomAmount("");
    }
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);

    const pounds = parseFloat(value);
    if (!isNaN(pounds) && pounds >= MIN_AMOUNT && pounds <= MAX_AMOUNT) {
      setSelectedAmount(Math.round(pounds * 100));
    }
  };

  const getFinalAmount = (): number => {
    if (useCustomAmount && customAmount) {
      const pounds = parseFloat(customAmount);
      return Math.round(pounds * 100);
    }
    return selectedAmount;
  };

  const handleSetupDirectDebit = async () => {
    try {
      setIsLoading(true);

      const finalAmount = getFinalAmount();

      // Validate amount
      if (finalAmount < MIN_AMOUNT * 100 || finalAmount > MAX_AMOUNT * 100) {
        toast({
          title: "Invalid amount",
          description: `Please enter an amount between £${MIN_AMOUNT} and £${MAX_AMOUNT}`,
          variant: "destructive",
        });
        return;
      }

      // Get auth token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Not authenticated",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return;
      }

      // Call Edge Function to create billing request
      const { data, error } = await supabase.functions.invoke(
        "create-billing-request",
        {
          body: { monthly_amount: finalAmount },
        },
      );

      if (error) throw error;

      if (data.authorisation_url) {
        // Store flow ID in session storage for callback
        sessionStorage.setItem("gc_flow_id", data.flow_id);

        // Redirect to GoCardless hosted page
        window.location.href = data.authorisation_url;
      } else {
        throw new Error("No authorisation URL received");
      }
    } catch (error) {
      console.error("Error setting up Direct Debit:", error);
      toast({
        title: "Setup failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to initiate Direct Debit setup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Set Up Monthly Deposits
        </CardTitle>
        <CardDescription>
          Choose how much to save each month. Funds are collected via Direct
          Debit on the 1st.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Selection */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Monthly Amount</Label>
          <RadioGroup
            value={useCustomAmount ? "custom" : selectedAmount.toString()}
            onValueChange={handleAmountChange}
          >
            <div className="grid grid-cols-2 gap-4">
              {PRESET_AMOUNTS.map((amount) => (
                <div key={amount.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={amount.value.toString()}
                    id={`amount-${amount.value}`}
                  />
                  <Label
                    htmlFor={`amount-${amount.value}`}
                    className="flex-1 cursor-pointer rounded-lg border border-gray-200 p-4 hover:border-primary transition-colors"
                  >
                    <span className="text-lg font-semibold">
                      {amount.label}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      / month
                    </span>
                  </Label>
                </div>
              ))}

              {/* Custom Amount Option */}
              <div className="flex items-center space-x-2 col-span-2">
                <RadioGroupItem value="custom" id="amount-custom" />
                <Label
                  htmlFor="amount-custom"
                  className="flex-1 cursor-pointer rounded-lg border border-gray-200 p-4 hover:border-primary transition-colors"
                >
                  <span className="text-lg font-semibold">Custom Amount</span>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {/* Custom Amount Input */}
          {useCustomAmount && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="custom-amount">
                Enter amount (£{MIN_AMOUNT} - £{MAX_AMOUNT})
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  £
                </span>
                <Input
                  id="custom-amount"
                  type="number"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  step="1"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder={`${MIN_AMOUNT} - ${MAX_AMOUNT}`}
                  className="pl-7"
                />
              </div>
            </div>
          )}
        </div>

        {/* Information Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Monthly Collection</p>
              <p className="text-xs text-muted-foreground">1st of each month</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Direct Debit Guarantee</p>
              <p className="text-xs text-muted-foreground">Protected by DDGA</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50">
            <CreditCard className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Secure Setup</p>
              <p className="text-xs text-muted-foreground">Via GoCardless</p>
            </div>
          </div>
        </div>

        {/* Setup Button */}
        <div className="space-y-3">
          <Button
            onClick={handleSetupDirectDebit}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Set Up Direct Debit
                {!useCustomAmount && (
                  <span className="ml-2">
                    -{" "}
                    {
                      PRESET_AMOUNTS.find((a) => a.value === selectedAmount)
                        ?.label
                    }
                    /month
                  </span>
                )}
                {useCustomAmount && customAmount && (
                  <span className="ml-2">- £{customAmount}/month</span>
                )}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You'll be redirected to GoCardless to securely set up your Direct
            Debit
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
