"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ImageUploadProps {
    currentImageUrl?: string | null;
    onImageUploaded: (url: string) => void;
    bucketName?: string;
    folder?: string;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function ImageUpload({
    currentImageUrl,
    onImageUploaded,
    bucketName = "images",
    folder = "uploads",
    className = "",
    size = "md"
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const sizeClasses = {
        sm: "w-12 h-12",
        md: "w-20 h-20",
        lg: "w-32 h-32"
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Por favor selecciona una imagen válida");
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("La imagen debe ser menor a 2MB");
            return;
        }

        setUploading(true);

        try {
            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(data.path);

            setPreviewUrl(publicUrl);
            onImageUploaded(publicUrl);
        } catch (error: any) {
            console.error("Upload error:", error);
            alert("Error al subir la imagen: " + (error.message || "Error desconocido"));
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl(null);
        onImageUploaded("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className={`relative ${className}`}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={uploading}
            />

            <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`${sizeClasses[size]} rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/50 flex items-center justify-center cursor-pointer transition-all overflow-hidden group relative`}
            >
                {uploading ? (
                    <Loader2 size={24} className="animate-spin text-primary" />
                ) : previewUrl ? (
                    <>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera size={20} className="text-white" />
                        </div>
                    </>
                ) : (
                    <Camera size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                )}
            </div>

            {previewUrl && !uploading && (
                <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform"
                >
                    <X size={12} />
                </button>
            )}
        </div>
    );
}
