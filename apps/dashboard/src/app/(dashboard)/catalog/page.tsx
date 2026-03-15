"use client";
import { useEffect, useState, useRef } from "react";
import { Plus, Upload, ShoppingBag, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, Button, Input, EmptyState, TableSkeleton } from "@/components/shared";
import { formatINR } from "@/lib/utils";
import toast from "react-hot-toast";

interface Product {
  id: string; name: string; description?: string; price?: number;
  currency: string; sku?: string; image_url?: string; is_active: boolean;
  wa_catalog_id?: string;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", sku: "", wa_catalog_id: "" });
  const imgRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Product[] }>("/api/catalog");
      setProducts(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleCreate = async () => {
    if (!form.name) return toast.error("Product name is required");
    try {
      await api.post("/api/catalog", {
        name: form.name,
        description: form.description || undefined,
        price: form.price ? parseFloat(form.price) : undefined,
        sku: form.sku || undefined,
        wa_catalog_id: form.wa_catalog_id || undefined,
      });
      toast.success("Product added");
      setShowForm(false);
      setForm({ name: "", description: "", price: "", sku: "", wa_catalog_id: "" });
      fetchProducts();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.patch(`/api/catalog/${id}/toggle`);
      fetchProducts();
    } catch { toast.error("Failed to toggle"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/catalog/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    try {
      await api.upload(`/api/catalog/${id}/image`, fd);
      toast.success("Image uploaded");
      fetchProducts();
    } catch { toast.error("Image upload failed"); }
    e.target.value = "";
  };

  return (
    <div>
      <PageHeader
        title="Catalog"
        description="Manage products for WhatsApp catalog messages"
        actions={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={13} /> Add Product
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {showForm && (
          <div className="glass-card p-5 space-y-4">
            <p className="text-sm font-semibold">New Product</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs text-muted-foreground">Product Name *</label>
                <Input placeholder="Solar Water Heater 200L" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Price (INR)</label>
                <Input type="number" placeholder="24999" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">SKU</label>
                <Input placeholder="SWH-200L" value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">WA Catalog ID</label>
                <Input placeholder="Optional" value={form.wa_catalog_id}
                  onChange={(e) => setForm({ ...form, wa_catalog_id: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Description</label>
              <Input placeholder="Product description…" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Save Product</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Product grid */}
        {loading ? <TableSkeleton rows={4} cols={5} /> : products.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="No products"
            description="Add products to send in WhatsApp catalog messages." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p.id} className="glass-card overflow-hidden">
                {/* Image */}
                <div className="relative h-36 bg-white/5 flex items-center justify-center">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag size={28} className="text-muted-foreground/30" />
                  )}
                  <button
                    onClick={() => imgRefs.current[p.id]?.click()}
                    className="absolute bottom-2 right-2 p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors"
                    title="Upload image"
                  >
                    <Upload size={11} />
                  </button>
                  <input
                    ref={(el) => { imgRefs.current[p.id] = el; }}
                    type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleImageUpload(p.id, e)}
                  />
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium leading-tight">{p.name}</p>
                    <button onClick={() => handleToggle(p.id)}
                      className={p.is_active ? "text-primary" : "text-muted-foreground"}>
                      {p.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                  </div>
                  {p.price && (
                    <p className="text-sm font-bold text-primary">{formatINR(p.price)}</p>
                  )}
                  {p.sku && (
                    <p className="text-[10px] font-mono text-muted-foreground">SKU: {p.sku}</p>
                  )}
                  <button onClick={() => handleDelete(p.id)}
                    className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1">
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
