"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import FileUpload from "@/components/ui/FileUpload";
import { playerSchema, type PlayerFormData } from "@/lib/validations/player";

export default function AddPlayerPage() {
  const router = useRouter();
  const [ageGroups, setAgeGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<PlayerFormData>({
    first_name: "", last_name: "", date_of_birth: "", gender: "male",
    position: "", jersey_number: "", photo_url: "",
    guardian_name: "", guardian_phone: "", guardian_email: "",
    medical_conditions: "", allergies: "", school: "", grade_level: "",
    current_age_group_id: ""
  });

  useEffect(() => {
    const fetchGroups = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("age_groups").select("*").order("display_order");
      if (data) setAgeGroups(data);
    };
    fetchGroups();
  }, []);

  const handleDobChange = (dob: string) => {
    if (!dob) return;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

    const matchedGroup = ageGroups.find(g => age >= g.min_age && age <= g.max_age);
    
    setFormData(prev => ({
      ...prev,
      date_of_birth: dob,
      current_age_group_id: matchedGroup ? matchedGroup.id : ""
    }));

    if (errors.current_age_group_id) {
      setErrors(prev => { const next = { ...prev }; delete next.current_age_group_id; return next; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setErrors({});

    const result = playerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("internal_players").insert([{
      ...result.data,
      jersey_number: result.data.jersey_number ? parseInt(result.data.jersey_number) : null,
    }]);

    setLoading(false);
    if (error) {
      alert("Database error: " + error.message);
    } else {
      setSuccess("Player added successfully!");
      setTimeout(() => router.push("/admin/club/players"), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-8">
      <button onClick={() => router.back()} className="flex items-center text-muted-foreground hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Players
      </button>

      <div>
        <h1 className="font-heading text-3xl font-bold uppercase tracking-tight text-foreground">Register New Player</h1>
        <p className="text-muted-foreground text-sm mt-1">Fill in the details below. The Age Group will be calculated automatically from the Date of Birth.</p>
      </div>

      {success && <div className="bg-accent/10 border border-accent text-accent p-4 font-bold uppercase text-sm">{success}</div>}

      {Object.keys(errors).length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm uppercase">Please fix the following errors:</p>
            <ul className="text-sm list-disc list-inside mt-1">
              {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border p-8 space-y-8">
        <div>
          <h3 className="font-heading text-xl font-bold uppercase text-accent mb-4 border-b border-border pb-2">Player Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="First Name" required value={formData.first_name} error={errors.first_name} onChange={(v) => setFormData({...formData, first_name: v})} />
            <Input label="Last Name" required value={formData.last_name} error={errors.last_name} onChange={(v) => setFormData({...formData, last_name: v})} />
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Date of Birth *</label>
              <input type="date" required value={formData.date_of_birth} onChange={(e) => handleDobChange(e.target.value)}
                className={`w-full bg-background border p-3 text-foreground focus:outline-none focus:border-accent transition-colors ${errors.date_of_birth ? 'border-red-500' : 'border-border'}`} />
              {errors.date_of_birth && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.date_of_birth}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Gender *</label>
              {/* FIXED: Cast to specific union type */}
              <select required value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value as "male" | "female"})}
                className={`w-full bg-background border p-3 text-foreground focus:outline-none focus:border-accent transition-colors ${errors.gender ? 'border-red-500' : 'border-border'}`}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.gender}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Player Photo</label>
              <FileUpload 
                bucketName="club-media" 
                folder="players" 
                value={formData.photo_url || ""} 
                onChange={(url) => setFormData({...formData, photo_url: url})} 
                accept="image/*"
                maxSizeMB={5}
              />
            </div>

            <Input label="Position" value={formData.position || ""} error={errors.position} onChange={(v) => setFormData({...formData, position: v})} placeholder="e.g. Midfielder" />
            <Input label="Jersey Number" value={formData.jersey_number || ""} error={errors.jersey_number} onChange={(v) => setFormData({...formData, jersey_number: v})} type="number" />
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Assigned Age Group (Auto)</label>
              <input type="text" readOnly value={ageGroups.find(g => g.id === formData.current_age_group_id)?.name || "Select DOB to auto-assign"}
                className={`w-full bg-muted border p-3 font-bold focus:outline-none cursor-not-allowed ${errors.current_age_group_id ? 'border-red-500 text-red-500' : 'border-border text-accent'}`} />
              {errors.current_age_group_id && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.current_age_group_id}</p>}
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-heading text-xl font-bold uppercase text-accent mb-4 border-b border-border pb-2">Guardian & Medical (Private)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Guardian Name *" required value={formData.guardian_name} error={errors.guardian_name} onChange={(v) => setFormData({...formData, guardian_name: v})} />
            <Input label="Guardian Phone *" required value={formData.guardian_phone} error={errors.guardian_phone} onChange={(v) => setFormData({...formData, guardian_phone: v})} placeholder="+254 700 000 000" />
            <Input label="Guardian Email" value={formData.guardian_email || ""} error={errors.guardian_email} onChange={(v) => setFormData({...formData, guardian_email: v})} type="email" />
            <Input label="School" value={formData.school || ""} error={errors.school} onChange={(v) => setFormData({...formData, school: v})} />
            <Input label="Grade Level" value={formData.grade_level || ""} error={errors.grade_level} onChange={(v) => setFormData({...formData, grade_level: v})} />
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Medical Conditions / Allergies</label>
              <textarea value={formData.medical_conditions || ""} onChange={(e) => setFormData({...formData, medical_conditions: e.target.value})}
                className="w-full bg-background border border-border p-3 text-foreground focus:outline-none focus:border-accent h-24" 
                placeholder="e.g. Asthma, Peanut allergy..." />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Player"}
        </button>
      </form>
    </div>
  );
}

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

function Input({ label, value, onChange, type = "text", required = false, placeholder = "", error }: InputProps) {
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
        className={`w-full bg-background border p-3 text-foreground focus:outline-none focus:border-accent transition-colors ${
          error ? 'border-red-500 focus:border-red-500' : 'border-border'
        }`} 
      />
      {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
    </div>
  );
}