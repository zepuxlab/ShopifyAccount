import { useState, useEffect } from "react";
import type { Address } from "@/types/account";
import { MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddressesSkeleton from "@/components/skeletons/AddressesSkeleton";
import {
  ResponsiveDialog, ResponsiveDialogHeader, ResponsiveDialogTitle,
  ResponsiveDialogDescription, ResponsiveDialogFooter, ResponsiveDialogClose,
} from "@/components/ui/responsive-dialog";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/hooks/useAccountApi";

const emptyAddress: Omit<Address, "id"> = {
  firstName: "", lastName: "", address1: "", address2: "", city: "", province: "", zip: "", country: "", phone: "", isDefault: false,
};

const inputCls = "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-ring";

function mapAddresses(data: {
  customer?: {
    defaultAddress?: { id: string } | null;
    addresses?: { edges: { node: Record<string, unknown> }[] };
  };
}): Address[] {
  const defaultId = data?.customer?.defaultAddress?.id ?? null;
  const edges = data?.customer?.addresses?.edges ?? [];
  return edges.map((e: { node: Record<string, unknown> }) => {
    const n = e.node;
    return {
      id: n.id as string,
      firstName: (n.firstName as string) ?? "",
      lastName: (n.lastName as string) ?? "",
      address1: (n.address1 as string) ?? "",
      address2: (n.address2 as string) ?? "",
      city: (n.city as string) ?? "",
      province: (n.province as string) ?? "",
      zip: (n.zip as string) ?? "",
      country: (n.country as string) ?? "",
      phone: (n.phone as string) ?? "",
      isDefault: defaultId === n.id,
    };
  });
}

const Addresses = () => {
  const { data, isLoading, isError } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefaultAddress = useSetDefaultAddress();

  const addresses = mapAddresses(data ?? {});
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAddress);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyAddress);
    setFormOpen(true);
  };
  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({ ...addr });
    setFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      address1: form.address1,
      address2: form.address2 || undefined,
      city: form.city,
      province: form.province || undefined,
      country: form.country,
      zip: form.zip,
      phone: form.phone || undefined,
    };
    if (editingId) {
      updateAddress.mutate(
        { id: editingId, address: payload },
        {
          onSuccess: (res) => {
            const errs = (res as { customerAddressUpdate?: { userErrors: { message: string }[] } })?.customerAddressUpdate?.userErrors;
            if (errs?.length) toast({ title: "Error", description: errs.map((x) => x.message).join(" "), variant: "destructive" });
            else { toast({ title: "Address updated" }); setFormOpen(false); }
          },
          onError: (err) => toast({ title: "Error", description: (err as Error)?.message, variant: "destructive" }),
        }
      );
    } else {
      createAddress.mutate(payload, {
        onSuccess: (res) => {
          const errs = (res as { customerAddressCreate?: { userErrors: { message: string }[] } })?.customerAddressCreate?.userErrors;
          if (errs?.length) toast({ title: "Error", description: errs.map((x) => x.message).join(" "), variant: "destructive" });
          else { toast({ title: "Address added" }); setFormOpen(false); }
        },
        onError: (err) => toast({ title: "Error", description: (err as Error)?.message, variant: "destructive" }),
      });
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultAddress.mutate(id, {
      onSuccess: (res) => {
        const errs = (res as { customerDefaultAddressUpdate?: { userErrors: { message: string }[] } })?.customerDefaultAddressUpdate?.userErrors;
        if (errs?.length) toast({ title: "Error", description: errs.map((x) => x.message).join(" "), variant: "destructive" });
        else toast({ title: "Default address updated" });
      },
    });
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteAddress.mutate(deleteId, {
      onSuccess: (res) => {
        const errs = (res as { customerAddressDelete?: { userErrors: { message: string }[] } })?.customerAddressDelete?.userErrors;
        if (errs?.length) toast({ title: "Error", description: errs.map((x) => x.message).join(" "), variant: "destructive" });
        else { toast({ title: "Address removed" }); setDeleteId(null); }
      },
      onError: (err) => toast({ title: "Error", description: (err as Error)?.message, variant: "destructive" }),
    });
  };

  const set = (key: string, val: string) => setForm((prev) => ({ ...prev, [key]: val }));

  if (isLoading) return <AddressesSkeleton />;
  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Addresses</h1>
        <p className="text-sm text-destructive">Failed to load addresses.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Addresses</h1>
          <p className="mt-1 text-sm text-muted-foreground">{addresses.length} saved addresses</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground notion-transition hover:opacity-90">
          <Plus className="h-4 w-4" /> Add new
        </button>
      </div>

      <div className="space-y-3">
        {addresses.map((addr, index) => (
          <div key={addr.id} className={`rounded-lg border p-4 animate-fade-in ${addr.isDefault ? "border-foreground/20 bg-notion-hover" : "border-border"}`} style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{addr.firstName} {addr.lastName}</span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-badge-info-bg px-2 py-0.5 text-xs font-medium text-badge-info-fg">
                        <Star className="h-3 w-3" /> Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {addr.address1}{addr.address2 ? `, ${addr.address2}` : ""}<br />
                    {addr.city}{addr.province ? `, ${addr.province}` : ""}, {addr.zip}<br />
                    {addr.country}
                  </p>
                  {addr.phone && <p className="mt-1 text-xs text-muted-foreground">{addr.phone}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="rounded p-1.5 text-muted-foreground notion-transition hover:bg-notion-hover hover:text-foreground" title="Set as default">
                    <Star className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => openEdit(addr)} className="rounded p-1.5 text-muted-foreground notion-transition hover:bg-notion-hover hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => setDeleteId(addr.id)} className="rounded p-1.5 text-muted-foreground notion-transition hover:bg-notion-hover hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ResponsiveDialog open={formOpen} onOpenChange={setFormOpen} className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{editingId ? "Edit address" : "New address"}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{editingId ? "Update your address details." : "Add a new shipping address."}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1.5 block text-xs font-medium text-foreground">First name</label><input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required className={inputCls} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-foreground">Last name</label><input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required className={inputCls} /></div>
          </div>
          <div><label className="mb-1.5 block text-xs font-medium text-foreground">Address line 1</label><input value={form.address1} onChange={(e) => set("address1", e.target.value)} required className={inputCls} /></div>
          <div><label className="mb-1.5 block text-xs font-medium text-foreground">Address line 2</label><input value={form.address2 || ""} onChange={(e) => set("address2", e.target.value)} className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1.5 block text-xs font-medium text-foreground">City</label><input value={form.city} onChange={(e) => set("city", e.target.value)} required className={inputCls} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-foreground">Province / State</label><input value={form.province || ""} onChange={(e) => set("province", e.target.value)} className={inputCls} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1.5 block text-xs font-medium text-foreground">ZIP / Postal code</label><input value={form.zip} onChange={(e) => set("zip", e.target.value)} required className={inputCls} /></div>
            <div><label className="mb-1.5 block text-xs font-medium text-foreground">Country</label><input value={form.country} onChange={(e) => set("country", e.target.value)} required className={inputCls} /></div>
          </div>
          <div><label className="mb-1.5 block text-xs font-medium text-foreground">Phone</label><input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} className={inputCls} /></div>
          <ResponsiveDialogFooter className="pt-2">
            <ResponsiveDialogClose asChild><button type="button" className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-foreground notion-transition hover:bg-notion-hover">Cancel</button></ResponsiveDialogClose>
            <button type="submit" disabled={createAddress.isPending || updateAddress.isPending} className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground notion-transition hover:opacity-90 disabled:opacity-50">{editingId ? "Save" : "Add address"}</button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)} className="sm:max-w-sm">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Delete address?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>This address will be permanently removed.</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild><button className="w-full rounded-xl border border-border px-4 py-2.5 text-sm text-foreground notion-transition hover:bg-notion-hover">Cancel</button></ResponsiveDialogClose>
          <button onClick={confirmDelete} disabled={deleteAddress.isPending} className="w-full rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground notion-transition hover:opacity-90 disabled:opacity-50">Delete</button>
        </ResponsiveDialogFooter>
      </ResponsiveDialog>
    </div>
  );
};

export default Addresses;
