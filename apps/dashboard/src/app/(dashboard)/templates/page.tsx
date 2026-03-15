"use client";
import { useEffect, useState } from "react";
import { Plus, Eye, Send, Trash2, FileText, Check } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeader, StatusBadge, Button, Input, Textarea, EmptyState, TableSkeleton } from "@/components/shared";
import { formatRelativeTime } from "@/lib/utils";
import toast from "react-hot-toast";

interface Template {
  id: string; name: string; category: string; status: string;
  body: string; footer?: string; language: string;
  created_at: string; variables?: { key: string; example: string }[];
}

const VARS = ["{{name}}", "{{product}}", "{{phone}}", "{{stage}}"];
const VAR_MAP: Record<string, string> = {
  "{{name}}": "{{1}}", "{{product}}": "{{2}}",
  "{{phone}}": "{{3}}", "{{stage}}": "{{4}}",
};

function TemplatePreview({ body, footer }: { body: string; footer?: string }) {
  const rendered = body
    .replace(/\{\{name\}\}/g, "Rahul Sharma")
    .replace(/\{\{product\}\}/g, "Solar Panel")
    .replace(/\{\{phone\}\}/g, "+91 98765 43210")
    .replace(/\{\{stage\}\}/g, "Qualified");

  return (
    <div className="bg-[#0a1628] rounded-xl p-4 max-w-xs">
      <div className="bg-[#1a2b45] rounded-lg p-3 relative">
        <div className="absolute -left-2 top-3 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-[#1a2b45] border-b-0" />
        <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">{rendered}</p>
        {footer && <p className="text-xs text-white/40 mt-2 border-t border-white/10 pt-2">{footer}</p>}
        <p className="text-[10px] text-white/30 text-right mt-1">12:34 PM ✓✓</p>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "MARKETING" as const,
    language: "en", body: "", footer: "",
  });
  const [activePreview, setActivePreview] = useState<Template | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Template[] }>("/api/templates");
      setTemplates(res.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const insertVar = (variable: string) => {
    const waVar = VAR_MAP[variable] ?? variable;
    setForm((f) => ({ ...f, body: f.body + variable }));
  };

  const handleCreate = async () => {
    if (!form.name || !form.body) return toast.error("Name and body are required");
    setSubmitting(true);
    try {
      // Convert {{name}} → {{1}} etc for WA format
      const waBody = form.body
        .replace(/\{\{name\}\}/g, "{{1}}")
        .replace(/\{\{product\}\}/g, "{{2}}")
        .replace(/\{\{phone\}\}/g, "{{3}}")
        .replace(/\{\{stage\}\}/g, "{{4}}");

      const variables = [];
      if (form.body.includes("{{name}}")) variables.push({ key: "1", example: "Rahul" });
      if (form.body.includes("{{product}}")) variables.push({ key: "2", example: "Solar Panel" });

      await api.post("/api/templates", {
        name: form.name,
        category: form.category,
        language: form.language,
        body: waBody,
        footer: form.footer || undefined,
        variables: variables.length > 0 ? variables : undefined,
      });
      toast.success("Template saved as draft");
      setShowForm(false);
      setForm({ name: "", category: "MARKETING", language: "en", body: "", footer: "" });
      fetchTemplates();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setSubmitting(false); }
  };

  const handleSubmitForApproval = async (id: string) => {
    try {
      await api.post(`/api/templates/${id}/submit`);
      toast.success("Submitted for WhatsApp approval");
      fetchTemplates();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/templates/${id}`);
      toast.success("Template deleted");
      fetchTemplates();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  return (
    <div>
      <PageHeader
        title="Templates"
        description="WhatsApp message templates"
        actions={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus size={13} /> New Template
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Create form */}
        {showForm && (
          <div className="glass-card p-5 space-y-4">
            <p className="text-sm font-semibold">Create Template</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Template Name</label>
                <Input placeholder="welcome_message" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value.toLowerCase().replace(/\s+/g, "_") })} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Category</label>
                <select className="h-8 w-full rounded-md border border-border bg-input px-2 text-sm"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as "MARKETING" })}>
                  <option value="MARKETING">Marketing</option>
                  <option value="UTILITY">Utility</option>
                  <option value="AUTHENTICATION">Authentication</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Language</label>
                <select className="h-8 w-full rounded-md border border-border bg-input px-2 text-sm"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                  <option value="gu">Gujarati</option>
                  <option value="ta">Tamil</option>
                </select>
              </div>
            </div>

            {/* Variable buttons */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Insert Variable</label>
              <div className="flex gap-2 flex-wrap">
                {VARS.map((v) => (
                  <button key={v} onClick={() => insertVar(v)}
                    className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors font-mono">
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Message Body *</label>
                <Textarea
                  rows={6}
                  placeholder="Hi {{name}}, we have an offer on {{product}}..."
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                />
                <p className="text-[10px] text-muted-foreground">{form.body.length}/1024 chars</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Footer (optional)</label>
                  <Input placeholder="Reply STOP to unsubscribe" value={form.footer}
                    onChange={(e) => setForm({ ...form, footer: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">Preview</label>
                  <TemplatePreview body={form.body || "Your message preview will appear here..."} footer={form.footer} />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button loading={submitting} onClick={handleCreate}>Save Draft</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Templates list */}
        <div className="glass-card overflow-hidden">
          {loading ? <TableSkeleton rows={4} cols={5} /> : templates.length === 0 ? (
            <EmptyState icon={FileText} title="No templates"
              description="Create your first message template above." />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  {["Name", "Category", "Status", "Created", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 table-row-hover">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-foreground">{t.name}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatRelativeTime(t.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setActivePreview(t === activePreview ? null : t)}
                          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-primary">
                          <Eye size={13} />
                        </button>
                        {t.status === "DRAFT" && (
                          <button onClick={() => handleSubmitForApproval(t.id)}
                            className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-blue-400"
                            title="Submit for approval">
                            <Send size={13} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-red-400">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Inline preview panel */}
        {activePreview && (
          <div className="glass-card p-5 flex gap-6 items-start">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Body</p>
              <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {activePreview.body}
              </pre>
              {activePreview.footer && (
                <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                  {activePreview.footer}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Preview</p>
              <TemplatePreview body={activePreview.body} footer={activePreview.footer} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
