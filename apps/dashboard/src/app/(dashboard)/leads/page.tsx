"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Upload, Plus, Filter, Download, RefreshCw, Search,
  Tag, MoreHorizontal, ChevronLeft, ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, StatusBadge, TableSkeleton, EmptyState, Button, Input, Select } from "@/components/shared";
import { formatRelativeTime, truncate, downloadCSV, debounce } from "@/lib/utils";
import toast from "react-hot-toast";
import { useSocket } from "@/lib/socket";

interface Lead {
  id: string; name: string; phone: string; products: string[];
  status: string; stage: string | null; label: string | null;
  last_contacted_at: string | null; created_at: string;
  tags: { tag: { id: string; name: string; color: string } }[];
}

interface UploadProgress { uploadId: string; progress: number; imported: number; total: number; }

const STATUSES = ["", "PENDING", "LIVE", "DEAD", "COOLING"];
const PAGE_SIZE = 50;

export default function LeadsPage() {
  const socket = useSocket();
  const fileRef = useRef<HTMLInputElement>(null);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{
        data: Lead[];
        pagination: { total: number };
      }>("/api/leads", {
        page,
        limit: PAGE_SIZE,
        ...(statusFilter && { status: statusFilter }),
        ...(search && { search }),
      });
      setLeads(res.data);
      setTotal(res.pagination.total);
    } catch (e) {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Socket: import progress
  useEffect(() => {
    if (!socket) return;
    socket.on("lead_import:progress", (data: UploadProgress) => setUploadProgress(data));
    socket.on("lead_import:complete", () => {
      setUploadProgress(null);
      fetchLeads();
      toast.success("Import complete!");
    });
    socket.on("lead_import:failed", ({ error }: { error: string }) => {
      setUploadProgress(null);
      toast.error(`Import failed: ${error}`);
    });
    return () => {
      socket.off("lead_import:progress");
      socket.off("lead_import:complete");
      socket.off("lead_import:failed");
    };
  }, [socket, fetchLeads]);

  const handleSearch = debounce((val: string) => {
    setSearch(val);
    setPage(1);
  }, 400);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.upload("/api/leads/upload", fd);
      toast.success("File uploaded! Processing in background…");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === leads.length ? new Set() : new Set(leads.map((l) => l.id))
    );
  };

  const handleBulkStatus = async (status: string) => {
    if (selected.size === 0) return;
    try {
      await api.put("/api/leads/bulk", { lead_ids: Array.from(selected), status });
      toast.success(`${selected.size} leads updated`);
      setSelected(new Set());
      fetchLeads();
    } catch {
      toast.error("Bulk update failed");
    }
  };

  const handleExport = () => {
    downloadCSV(
      leads.map((l) => ({
        Name: l.name, Phone: l.phone,
        Products: l.products.join("; "),
        Status: l.status, Stage: l.stage ?? "",
        Label: l.label ?? "",
        "Last Contact": l.last_contacted_at ?? "",
      })),
      "leads-export.csv"
    );
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Leads"
        description={`${total} total leads`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download size={13} /> Export
            </Button>
            <Button
              variant="secondary" size="sm"
              onClick={() => fileRef.current?.click()}
              loading={uploading}
            >
              <Upload size={13} /> Import Excel
            </Button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv"
              className="hidden" onChange={handleFileUpload} />
            <Button size="sm">
              <Plus size={13} /> Add Lead
            </Button>
          </div>
        }
      />

      {/* Upload progress */}
      {uploadProgress && (
        <div className="mx-6 mt-4 glass-card p-3">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-muted-foreground">Importing leads…</span>
            <span className="font-medium">{uploadProgress.imported} / {uploadProgress.total}</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-border">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, phone…"
            className="pl-8"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            <Button variant="secondary" size="sm" onClick={() => handleBulkStatus("COOLING")}>
              Set Cooling
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleBulkStatus("DEAD")}>
              Mark Dead
            </Button>
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={fetchLeads}>
          <RefreshCw size={13} />
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-background border-b border-border z-10">
            <tr>
              <th className="w-8 px-4 py-2.5">
                <input type="checkbox" className="accent-primary"
                  checked={selected.size === leads.length && leads.length > 0}
                  onChange={toggleAll} />
              </th>
              {["Name", "Phone", "Product", "Status", "Stage", "Label", "Last Message"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
              <th className="w-8 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9}><TableSkeleton /></td></tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState icon={Filter} title="No leads found"
                    description="Try adjusting your filters or import leads from Excel." />
                </td>
              </tr>
            ) : leads.map((lead) => (
              <tr key={lead.id} className="table-row-hover border-b border-border/50">
                <td className="px-4 py-2.5">
                  <input type="checkbox" className="accent-primary"
                    checked={selected.has(lead.id)}
                    onChange={() => toggleSelect(lead.id)} />
                </td>
                <td className="px-3 py-2.5">
                  <span className="font-medium text-foreground">{lead.name}</span>
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                  {lead.phone}
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-xs text-muted-foreground">
                    {lead.products.length > 0 ? truncate(lead.products.join(", "), 25) : "—"}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">{lead.stage ?? "—"}</td>
                <td className="px-3 py-2.5">
                  {lead.label ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                      {lead.label}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-3 py-2.5 text-xs text-muted-foreground">
                  {formatRelativeTime(lead.last_contacted_at)}
                </td>
                <td className="px-3 py-2.5">
                  <button className="p-1 rounded hover:bg-accent text-muted-foreground">
                    <MoreHorizontal size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-border text-xs text-muted-foreground">
          <span>Page {page} of {totalPages} · {total} total</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded hover:bg-accent disabled:opacity-30"
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-6 h-6 rounded text-xs ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded hover:bg-accent disabled:opacity-30"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
