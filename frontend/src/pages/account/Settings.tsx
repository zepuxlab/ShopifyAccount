import { useState, useEffect } from "react";
import { LogOut, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveDialog, ResponsiveDialogHeader, ResponsiveDialogTitle,
  ResponsiveDialogDescription, ResponsiveDialogFooter, ResponsiveDialogClose,
} from "@/components/ui/responsive-dialog";
import { useAuth } from "@/lib/auth/AuthContext";
import { useCustomer, useDeactivateCustomer } from "@/hooks/useAccountApi";

const SettingsSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="mt-2 h-4 w-36" />
    </div>
    <div className="max-w-lg rounded-lg border border-border p-4 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="max-w-lg space-y-2">
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  </div>
);

const AccountSettings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: customerData } = useCustomer();
  const deactivate = useDeactivateCustomer();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, sms: false });

  const loading = !customerData;
  const customerId = (customerData?.customer as { id?: string })?.id;

  const handleToggle = (key: "email" | "sms") => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({ title: "Preferences updated" });
  };

  const handleSignOut = () => {
    setSignOutOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  const handleDeleteAccount = () => {
    if (!customerId) return;
    setDeleteOpen(false);
    deactivate.mutate(customerId, {
      onSuccess: () => {
        logout();
        navigate("/login", { replace: true });
        toast({ title: "Account deactivated" });
      },
      onError: (err) => {
        toast({ title: "Error", description: (err as Error)?.message ?? "Failed to deactivate", variant: "destructive" });
      },
    });
  };

  if (loading) return <SettingsSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Account management</p>
      </div>

      <div className="max-w-lg rounded-lg border border-border p-4 animate-fade-in" style={{ animationDelay: "100ms", opacity: 0 }}>
        <h2 className="mb-3 text-sm font-medium text-foreground">Notifications</h2>
        <div className="space-y-3">
          {([
            { key: "email" as const, label: "Email newsletter", desc: "News, promotions and offers" },
            { key: "sms" as const, label: "SMS notifications", desc: "Order status and promos" },
          ]).map((item) => (
            <label key={item.key} className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={notifications[item.key]} onChange={() => handleToggle(item.key)} className="mt-1 h-4 w-4 rounded border-input accent-foreground" />
              <div>
                <p className="text-sm text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="max-w-lg space-y-2 animate-fade-in" style={{ animationDelay: "200ms", opacity: 0 }}>
        <button onClick={() => setSignOutOpen(true)} className="flex w-full items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm text-foreground notion-transition hover:bg-notion-hover">
          <LogOut className="h-4 w-4 text-muted-foreground" /> Sign out
        </button>
        <button onClick={() => setDeleteOpen(true)} className="flex w-full items-center gap-3 rounded-lg border border-destructive/20 px-4 py-3 text-sm text-destructive notion-transition hover:bg-badge-error-bg">
          <Trash2 className="h-4 w-4" /> Delete account
        </button>
      </div>

      <ResponsiveDialog open={signOutOpen} onOpenChange={setSignOutOpen} className="sm:max-w-sm">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Sign out?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>You will need to sign in again to access your account.</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild><button className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-foreground notion-transition hover:bg-notion-hover">Cancel</button></ResponsiveDialogClose>
          <button onClick={handleSignOut} className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground notion-transition hover:opacity-90">Sign out</button>
        </ResponsiveDialogFooter>
      </ResponsiveDialog>

      <ResponsiveDialog open={deleteOpen} onOpenChange={setDeleteOpen} className="sm:max-w-sm">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Delete account?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>This action is irreversible. All your data, orders, and saved information will be permanently deleted.</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild><button className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-foreground notion-transition hover:bg-notion-hover">Cancel</button></ResponsiveDialogClose>
          <button onClick={handleDeleteAccount} disabled={!customerId || deactivate.isPending} className="w-full rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground notion-transition hover:opacity-90 disabled:opacity-50">Delete permanently</button>
        </ResponsiveDialogFooter>
      </ResponsiveDialog>
    </div>
  );
};

export default AccountSettings;
