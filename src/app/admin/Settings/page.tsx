"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save, Building2 } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload"; // <-- IMPORT ADDED

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [orgId, setOrgId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "", tagline: "", mission: "", vision: "",
    location: "", contact_email: "", contact_phone: "", whatsapp_number: "",
    mpesa_paybill_number: "", mpesa_account_name: "", logo_url: "" // <-- ADDED logo_url
  });

  useEffect(() => {
    const fetchOrg = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("organization").select("*").limit(1).single();
      
      if (data) {
        setOrgId(data.id);
        setFormData({
          name: data.name || "", tagline: data.tagline || "", mission: data.mission || "", vision: data.vision || "",
          location: data.location || "", contact_email: data.contact_email || "", contact_phone: data.contact_phone || "", 
          whatsapp_number: data.whatsapp_number || "", mpesa_paybill_number: data.mpesa_paybill_number || "", 
          mpesa_account_name: data.mpesa_account_name || "", logo_url: data.logo_url || "" // <-- FETCH logo_url
        });
      }
      setLoading(false);
    };
    fetchOrg();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    const supabase = createClient();

    let error;
    if (orgId) {
      const res = await supabase.from("organization").update({ ...formData, updated_at: new Date().toISOString() }).eq("id", orgId);
      error = res.error;
    } else {
      const res = await supabase.from("organization").insert([formData]).select().single();
      if (res.data) setOrgId(res.data.id);
      error = res.error;
    }

    setSaving(false);
    if (error) {
      alert("Error saving settings: " + error.message);
    } else {
      setSuccess("Organization details updated successfully! Check the public homepage to see changes.");
    }
  };

  if (loading) return <div className="section-padding min-h-screen text-center text-muted-foreground pt-20">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <div className="flex items-center gap-3">
        <Building2 className="w-8 h-8 text-accent" />
        <div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Organization Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage club details, contacts, and M-Pesa donation info.</p>
        </div>
      </div>

      {success && <div className="bg-accent/10 border border-accent text-accent p-4 font-bold uppercase text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-8">
        <div>
          <h3 className="font-heading text-xl font-bold uppercase text-accent mb-4 border-b border-border pb-2">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* NEW: CLUB LOGO UPLOAD */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Club Logo (Max 5MB)</label>
              <FileUpload 
                bucketName="club-media" 
                folder="organization" 
                value={formData.logo_url} 
                onChange={(url) => setFormData({...formData, logo_url: url})} 
                accept="image/*"
                maxSizeMB={5}
              />
            </div>

            <Input label="Club Name *" required value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
            <Input label="Tagline" value={formData.tagline} onChange={(v) => setFormData({...formData, tagline: v})} placeholder="e.g. More than just football" />
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Mission Statement</label>
              <textarea value={formData.mission} onChange={(e) => setFormData({...formData, mission: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent h-24" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Vision</label>
              <textarea value={formData.vision} onChange={(e) => setFormData({...formData, vision: e.target.value})} className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent h-24" />
            </div>
            <Input label="Location" value={formData.location} onChange={(v) => setFormData({...formData, location: v})} />
          </div>
        </div>

        <div>
          <h3 className="font-heading text-xl font-bold uppercase text-accent mb-4 border-b border-border pb-2">Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Email" type="email" value={formData.contact_email} onChange={(v) => setFormData({...formData, contact_email: v})} />
            <Input label="Phone" value={formData.contact_phone} onChange={(v) => setFormData({...formData, contact_phone: v})} />
            <Input label="WhatsApp Number" value={formData.whatsapp_number} onChange={(v) => setFormData({...formData, whatsapp_number: v})} placeholder="e.g. 254700000000" />
          </div>
        </div>

        <div>
          <h3 className="font-heading text-xl font-bold uppercase text-accent mb-4 border-b border-border pb-2">M-Pesa Donation Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Paybill Number *" required value={formData.mpesa_paybill_number} onChange={(v) => setFormData({...formData, mpesa_paybill_number: v})} placeholder="e.g. 123456" />
            <Input label="Account Name *" required value={formData.mpesa_account_name} onChange={(v) => setFormData({...formData, mpesa_account_name: v})} placeholder="e.g. Slum Stars FC" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Settings</>}
        </button>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required = false, placeholder = "" }: InputProps) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <input 
        type={type} 
        required={required} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent transition-colors" 
      />
    </div>
  );
}