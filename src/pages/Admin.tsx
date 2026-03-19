import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/integrations/supabase/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

type Redemption = Database["public"]["Tables"]["redemptions"]["Row"];

interface AdminRedemption extends Redemption {
  user_name: string | null;
  user_email: string | null;
}

type StatusFilter = "pending" | "fulfilled" | "cancelled" | "all";

const Admin = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [redemptions, setRedemptions] = useState<AdminRedemption[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");

  // Fulfill modal state
  const [fulfillTarget, setFulfillTarget] = useState<AdminRedemption | null>(
    null,
  );
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherInstructions, setVoucherInstructions] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Cancel modal state
  const [cancelTarget, setCancelTarget] = useState<AdminRedemption | null>(
    null,
  );
  const [cancellationReason, setCancellationReason] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    checkIsAdmin(user.id)
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false));
  }, [user]);

  useEffect(() => {
    if (isAdmin) fetchRedemptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, statusFilter]);

  const fetchRedemptions = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "get-redemptions",
        {
          body: { mode: "admin", status: statusFilter },
        },
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setRedemptions(data.redemptions || []);
    } catch (err) {
      console.error("Error fetching redemptions:", err);
      toast({
        title: "Error loading redemptions",
        description:
          err instanceof Error ? err.message : "Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleFulfill = async () => {
    if (!fulfillTarget || !voucherCode.trim()) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "fulfill-redemption",
        {
          body: {
            redemption_id: fulfillTarget.id,
            voucher_code: voucherCode.trim(),
            voucher_instructions: voucherInstructions.trim() || undefined,
            admin_notes: adminNotes.trim() || undefined,
          },
        },
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Fulfilled!",
        description: "The user has been emailed their voucher code.",
      });

      setFulfillTarget(null);
      setVoucherCode("");
      setVoucherInstructions("");
      setAdminNotes("");
      fetchRedemptions();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "cancel-redemption",
        {
          body: {
            redemption_id: cancelTarget.id,
            cancellation_reason: cancellationReason.trim() || undefined,
          },
        },
      );

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Cancelled & refunded",
        description: `£${(cancelTarget.amount / 100).toFixed(2)} has been returned to the user's balance.`,
      });

      setCancelTarget(null);
      setCancellationReason("");
      fetchRedemptions();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (pence: number) => `£${(pence / 100).toFixed(2)}`;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd MMM yyyy, HH:mm");
  };

  const getStatusBadge = (status: Redemption["status"]) => {
    switch (status) {
      case "fulfilled":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Fulfilled
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

  const statusFilters: { label: string; value: StatusFilter }[] = [
    { label: "Pending", value: "pending" },
    { label: "Fulfilled", value: "fulfilled" },
    { label: "Cancelled", value: "cancelled" },
    { label: "All", value: "all" },
  ];

  // Still checking admin status
  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header userEmail={user?.email} isAdmin={true} />
        <div className="flex-1 flex items-center justify-center pt-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header userEmail={user?.email} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8 flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-slate-900">
            Admin — Redemptions
          </h1>
        </div>

        {/* Status filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {statusFilters.map(({ label, value }) => (
            <Button
              key={value}
              size="sm"
              variant={statusFilter === value ? "default" : "outline"}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={fetchRedemptions}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>

        {/* Redemptions table */}
        <Card className="shadow-sm border border-slate-100">
          <CardHeader>
            <CardTitle>
              {statusFilter === "all"
                ? "All Redemptions"
                : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Redemptions`}
            </CardTitle>
            <CardDescription>
              {redemptions.length}{" "}
              {redemptions.length === 1 ? "request" : "requests"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFetching && redemptions.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : redemptions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>
                  No {statusFilter !== "all" ? statusFilter : ""} redemptions
                  found.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requested</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {redemptions.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(r.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {r.user_name || "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {r.user_email || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {r.brand_name}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatAmount(r.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(r.status)}</TableCell>
                        <TableCell className="text-right">
                          {r.status === "pending" && (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                onClick={() => setFulfillTarget(r)}
                              >
                                Fulfill
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/40 hover:bg-destructive hover:text-white"
                                onClick={() => setCancelTarget(r)}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                          {r.status === "fulfilled" && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(r.fulfilled_at)}
                            </span>
                          )}
                          {r.status === "cancelled" && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(r.cancelled_at)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Fulfill modal */}
      <Dialog
        open={!!fulfillTarget}
        onOpenChange={(open) => {
          if (!open) {
            setFulfillTarget(null);
            setVoucherCode("");
            setVoucherInstructions("");
            setAdminNotes("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fulfill Redemption</DialogTitle>
            <DialogDescription>
              Enter the voucher code for{" "}
              <strong>
                {fulfillTarget?.user_name || fulfillTarget?.user_email}
              </strong>
              's{" "}
              <strong>
                {fulfillTarget
                  ? `${formatAmount(fulfillTarget.amount)} ${fulfillTarget.brand_name}`
                  : ""}
              </strong>{" "}
              request. The user will be emailed automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="voucher-code">
                Voucher Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="voucher-code"
                placeholder="e.g. ASOS-XXXX-XXXX"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="voucher-instructions">
                Instructions{" "}
                <span className="text-muted-foreground text-xs">
                  (optional — shown to user)
                </span>
              </Label>
              <Textarea
                id="voucher-instructions"
                placeholder="e.g. Valid for online purchases only. Expires Dec 2026."
                value={voucherInstructions}
                onChange={(e) => setVoucherInstructions(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-notes">
                Admin Notes{" "}
                <span className="text-muted-foreground text-xs">
                  (optional — internal only)
                </span>
              </Label>
              <Textarea
                id="admin-notes"
                placeholder="Internal reference, supplier info, etc."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFulfillTarget(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFulfill}
              disabled={isSubmitting || !voucherCode.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Fulfill & Send Email"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) {
            setCancelTarget(null);
            setCancellationReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Redemption Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel{" "}
              <strong>
                {cancelTarget?.user_name || cancelTarget?.user_email}
              </strong>
              's{" "}
              <strong>
                {cancelTarget
                  ? `${formatAmount(cancelTarget.amount)} ${cancelTarget.brand_name}`
                  : ""}
              </strong>{" "}
              request and refund{" "}
              <strong>
                {cancelTarget ? formatAmount(cancelTarget.amount) : ""}
              </strong>{" "}
              to their balance. The user will be notified by email.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <Label htmlFor="cancel-reason">
              Reason{" "}
              <span className="text-muted-foreground text-xs">
                (optional — shown to user)
              </span>
            </Label>
            <Input
              id="cancel-reason"
              placeholder="e.g. Voucher currently unavailable"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Keep Request
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Request & Refund"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
