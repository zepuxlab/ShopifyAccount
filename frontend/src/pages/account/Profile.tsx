import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import { useCustomer, useUpdateCustomer } from "@/hooks/useAccountApi";

const Profile = () => {
  const { data, isLoading, isError } = useCustomer();
  const updateCustomer = useUpdateCustomer();
  const customer = data?.customer as Record<string, unknown> | undefined;
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (customer) {
      const emailNode = customer.email as { emailAddress?: string } | string | undefined;
      const emailStr = typeof emailNode === "string" ? emailNode : emailNode?.emailAddress ?? "";
      setForm({
        firstName: (customer.firstName as string) ?? "",
        lastName: (customer.lastName as string) ?? "",
        email: emailStr,
        phone: (customer.phone as string) ?? "",
      });
    }
  }, [customer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomer.mutate(
      {
        input: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || null,
        },
      },
      {
        onSuccess: (res) => {
          const errs = (res as { customerUpdate?: { userErrors: { message: string }[] } })?.customerUpdate?.userErrors;
          if (errs?.length) {
            toast({ title: "Error", description: errs.map((e) => e.message).join(" "), variant: "destructive" });
          } else {
            toast({ title: "Profile updated", description: "Your changes have been saved." });
          }
        },
        onError: (err) => {
          toast({ title: "Error", description: (err as Error)?.message ?? "Failed to update", variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) return <ProfileSkeleton />;
  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="text-sm text-destructive">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal information</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 animate-fade-in" style={{ animationDelay: "100ms", opacity: 0 }}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "First name", key: "firstName" as const },
            { label: "Last name", key: "lastName" as const },
          ].map((field) => (
            <div key={field.key}>
              <label className="mb-1.5 block text-sm font-medium text-foreground">{field.label}</label>
              <input
                type="text"
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                required
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+7 999 000 0000"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input accent-foreground" />
            Receive email newsletter
          </label>
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={updateCustomer.isPending}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground notion-transition hover:opacity-90 disabled:opacity-50"
          >
            {updateCustomer.isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
