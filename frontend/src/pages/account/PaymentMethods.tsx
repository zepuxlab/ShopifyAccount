import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PaymentMethodsSkeleton from "@/components/skeletons/PaymentMethodsSkeleton";
import {
  ResponsiveDialog, ResponsiveDialogHeader, ResponsiveDialogTitle,
  ResponsiveDialogDescription, ResponsiveDialogFooter, ResponsiveDialogClose,
} from "@/components/ui/responsive-dialog";
import { usePaymentMethods, useRevokePaymentMethod } from "@/hooks/useAccountApi";

function mapPaymentMethods(data: {
  customer?: { paymentMethods?: { edges: { node: Record<string, unknown> }[] } };
}): { id: string; brand: string; lastFour: string; expiryMonth: number; expiryYear: number; isDefault: boolean }[] {
  const edges = data?.customer?.paymentMethods?.edges ?? [];
  return edges.map((e: { node: Record<string, unknown> }, i: number) => {
    const inst = (e.node.instrument as Record<string, unknown>) ?? {};
    return {
      id: e.node.id as string,
      brand: (inst.brand as string) ?? "Card",
      lastFour: (inst.lastDigits as string) ?? (inst.lastDigits as string) ?? "****",
      expiryMonth: (inst.expiryMonth as number) ?? 0,
      expiryYear: (inst.expiryYear as number) ?? 0,
      isDefault: i === 0,
    };
  });
}

const PaymentMethods = () => {
  const { data, isLoading, isError } = usePaymentMethods();
  const revoke = useRevokePaymentMethod();
  const [removeId, setRemoveId] = useState<string | null>(null);

  const methods = mapPaymentMethods(data ?? {});

  const confirmRemove = () => {
    if (!removeId) return;
    revoke.mutate(removeId, {
      onSuccess: (res) => {
        const errs = (res as { customerPaymentMethodRevoke?: { userErrors: { message: string }[] } })?.customerPaymentMethodRevoke?.userErrors;
        if (errs?.length) toast({ title: "Error", description: errs.map((x) => x.message).join(" "), variant: "destructive" });
        else { toast({ title: "Payment method removed" }); setRemoveId(null); }
      },
      onError: (err) => toast({ title: "Error", description: (err as Error)?.message, variant: "destructive" }),
    });
  };

  if (isLoading) return <PaymentMethodsSkeleton />;
  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Payment methods</h1>
        <p className="text-sm text-destructive">Failed to load payment methods.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Payment methods</h1>
        <p className="mt-1 text-sm text-muted-foreground">Saved cards and payment methods</p>
      </div>

      {methods.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved payment methods. Add one at checkout.</p>
      ) : (
        <div className="space-y-3">
          {methods.map((pm, index) => (
            <div key={pm.id} className={`flex items-center justify-between rounded-lg border p-4 animate-fade-in ${pm.isDefault ? "border-foreground/20 bg-notion-hover" : "border-border"}`} style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-lg">💳</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{pm.brand} •••• {pm.lastFour}</span>
                    {pm.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-badge-info-bg px-2 py-0.5 text-xs font-medium text-badge-info-fg"><Star className="h-3 w-3" /> Default</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Expires {String(pm.expiryMonth).padStart(2, "0")}/{pm.expiryYear}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setRemoveId(pm.id)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-destructive notion-transition hover:bg-badge-error-bg">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResponsiveDialog open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)} className="sm:max-w-sm">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Remove payment method?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>This card will be removed from your account.</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild><button className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-foreground notion-transition hover:bg-notion-hover">Cancel</button></ResponsiveDialogClose>
          <button onClick={confirmRemove} disabled={revoke.isPending} className="w-full rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground notion-transition hover:opacity-90 disabled:opacity-50">Remove</button>
        </ResponsiveDialogFooter>
      </ResponsiveDialog>
    </div>
  );
};

export default PaymentMethods;
