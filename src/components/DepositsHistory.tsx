// Component: Deposit History
// Shows list of Direct Debit deposits

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Deposit = Database["public"]["Tables"]["deposits"]["Row"];

interface DepositsHistoryProps {
  userId: string;
  limit?: number;
}

export function DepositsHistory({ userId, limit = 10 }: DepositsHistoryProps) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeposits();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel("deposits_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "deposits",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchDeposits();
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, limit]);

  const fetchDeposits = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      setDeposits(data || []);
    } catch (error) {
      console.error("Error fetching deposits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd MMM yyyy");
  };

  const getStatusBadge = (status: Deposit["status"]) => {
    switch (status) {
      case "paid_out":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "confirmed":
        return (
          <Badge className="bg-blue-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
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

  if (deposits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deposit History</CardTitle>
          <CardDescription>
            Your Direct Debit deposits will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No deposits yet</p>
            <p className="text-sm mt-1">
              Your first deposit will be collected shortly after setup
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit History</CardTitle>
        <CardDescription>
          {deposits.length} {deposits.length === 1 ? "deposit" : "deposits"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deposits.map((deposit) => (
              <TableRow key={deposit.id}>
                <TableCell className="font-medium">
                  {formatDate(deposit.created_at)}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatAmount(deposit.amount)}
                </TableCell>
                <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {deposit.status === "paid_out" && deposit.paid_out_at
                    ? formatDate(deposit.paid_out_at)
                    : deposit.status === "confirmed" && deposit.confirmed_at
                      ? formatDate(deposit.confirmed_at)
                      : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Show failure reason if any */}
        {deposits.some((d) => d.status === "failed" && d.failure_reason) && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">
                  Recent Failure
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {deposits.find((d) => d.status === "failed")?.failure_reason}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
