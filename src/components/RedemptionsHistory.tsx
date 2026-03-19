// Component: Redemptions History
// Shows a user's voucher redemption history with live status updates.
// When a redemption is fulfilled the voucher code is displayed inline with a copy button.

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Ticket, CheckCircle, XCircle, Clock, Copy } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Redemption = Database["public"]["Tables"]["redemptions"]["Row"];

interface RedemptionsHistoryProps {
  userId: string;
  limit?: number;
}

export function RedemptionsHistory({
  userId,
  limit = 50,
}: RedemptionsHistoryProps) {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRedemptions();

    const subscription = supabase
      .channel("redemptions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "redemptions",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchRedemptions();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, limit]);

  const fetchRedemptions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("redemptions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setRedemptions(data || []);
    } catch (error) {
      console.error("Error fetching redemptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (pence: number) => `£${(pence / 100).toFixed(2)}`;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd MMM yyyy");
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: "Voucher code copied to clipboard." });
  };

  const getStatusBadge = (status: Redemption["status"]) => {
    switch (status) {
      case "fulfilled":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready to use
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  if (redemptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Redemptions</CardTitle>
          <CardDescription>
            Vouchers you have requested will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No redemptions yet</p>
            <p className="text-sm mt-1">
              Request a voucher above to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Redemptions</CardTitle>
        <CardDescription>
          {redemptions.length}{" "}
          {redemptions.length === 1 ? "redemption" : "redemptions"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Voucher Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redemptions.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {formatDate(redemption.created_at)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {redemption.brand_name}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatAmount(redemption.amount)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(redemption.status)}
                  </TableCell>
                  <TableCell>
                    {redemption.status === "fulfilled" &&
                    redemption.voucher_code ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <code className="bg-purple-50 border border-purple-200 text-purple-800 font-mono font-bold px-3 py-1 rounded text-sm tracking-widest">
                            {redemption.voucher_code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              copyToClipboard(redemption.voucher_code!)
                            }
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {redemption.voucher_instructions && (
                          <p className="text-xs text-muted-foreground">
                            {redemption.voucher_instructions}
                          </p>
                        )}
                      </div>
                    ) : redemption.status === "pending" ? (
                      <span className="text-sm text-muted-foreground">
                        We'll email you when ready
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
