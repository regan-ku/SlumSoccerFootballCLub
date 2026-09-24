"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Loader2, X } from "lucide-react";

interface MultiFileUploadProps {
  bucketName: string;
  folder: string;
  values: string[];
  onChange: (urls: string[]) => void;
  accept?: string;
  maxSizeMB?: number;
  maxFiles?: number;
}

export default function MultiFileUpload({ 
  bucketName, 
  folder, 
  values = [], 
  onChange, 
  accept = "image/*", 
  maxSizeMB = 5,
  maxFiles = 15
}: MultiFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 1. Enforce Max Files Limit
    if (values.length + files.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} files.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // 2. Enforce File Size Limit
    const oversizedFiles = files.filter(f => f.size > maxSizeMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`${oversizedFiles.length} file(s) exceed the ${maxSizeMB}MB limit.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const newUrls: string[] = [];
    const storage = supabase.storage.from(bucketName);

    // 3. Upload files sequentially to prevent browser/network overload
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error } = await storage.upload(filePath, file);
      
      if (error) {
        console.error("Error uploading file:", error.message);
        alert(`Failed to upload ${file.name}: ${error.message}`);
      } else {
        const { data } = storage.getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      }
      
      // Update progress bar
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));
    }

    // 4. Append new URLs to existing ones
    onChange([...values, ...newUrls]);
    
    setUploading(false);
    setUploadProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(values.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Previews Grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {values.map((url, index) => (
            <div key={index} className="relative aspect-square bg-muted border border-border rounded-sm overflow-hidden group">
              <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {values.length < maxFiles && (
        <div 
          onClick={() => !uploading && inputRef.current?.click()}
          className={`w-full aspect-video border-2 border-dashed rounded-sm flex flex-col items-center justify-center cursor-pointer transition-colors ${
            uploading ? 'border-accent bg-accent/5' : 'border-border hover:border-accent bg-muted/50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-xs font-bold uppercase text-accent">Uploading... {uploadProgress}%</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-xs font-bold uppercase text-muted-foreground text-center px-4">
                Click to Upload (Max {maxFiles} files, {maxSizeMB}MB each)
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {values.length} / {maxFiles} files selected
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading || values.length >= maxFiles}
      />
    </div>
  );
}