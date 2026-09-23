"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Loader2, X } from "lucide-react";

interface FileUploadProps {
  bucketName: string;
  folder: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSizeMB?: number; // New prop to enforce size limits
}

export default function FileUpload({ 
  bucketName, 
  folder, 
  value, 
  onChange, 
  accept = "image/*", 
  maxSizeMB = 5 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. ENFORCE FILE SIZE LIMIT
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    
    // 2. Create a unique file name to prevent overwriting
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // 3. Upload to Supabase Storage
    const { error } = await supabase.storage.from(bucketName).upload(filePath, file);

    if (error) {
      alert("Error uploading file: " + error.message);
      setUploading(false);
    } else {
      // 4. Get the public URL and pass it back to the form
      const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      onChange(data.publicUrl);
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {/* Preview Area */}
      {value ? (
        <div className="relative w-full aspect-video bg-muted border border-border rounded-sm overflow-hidden group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-video bg-muted border-2 border-dashed border-border rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-accent transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-xs font-bold uppercase text-muted-foreground">Click to Upload (Max {maxSizeMB}MB)</p>
            </>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}