import React, { useState, useRef } from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Trash2, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PhotoUpload: React.FC = () => {
  const { cvData, updatePersonal } = useCVContext();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    if (!user) {
      // For non-authenticated users, use local file URL
      const localUrl = URL.createObjectURL(file);
      updatePersonal('photo', localUrl);
      toast.success('Photo added (sign in to save permanently)');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Delete old photo if exists
      if (cvData.personal.photo) {
        const oldPath = cvData.personal.photo.split('/profile-photos/')[1];
        if (oldPath) {
          await supabase.storage.from('profile-photos').remove([oldPath]);
        }
      }

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      updatePersonal('photo', publicUrl);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!cvData.personal.photo) return;

    if (user && cvData.personal.photo.includes('profile-photos')) {
      try {
        const oldPath = cvData.personal.photo.split('/profile-photos/')[1];
        if (oldPath) {
          await supabase.storage.from('profile-photos').remove([oldPath]);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }

    updatePersonal('photo', '');
    toast.success('Photo removed');
  };

  const initials = cvData.personal.fullName
    ? cvData.personal.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CV';

  return (
    <div className="flex flex-col items-center gap-4 p-4 border border-border rounded-lg bg-card/50">
      <div className="relative group">
        <Avatar className="w-32 h-32 border-4 border-accent/20">
          <AvatarImage src={cvData.personal.photo} alt="Profile photo" />
          <AvatarFallback className="text-2xl bg-accent/10 text-accent">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        {!uploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="w-8 h-8 text-white" />
          </button>
        )}
        
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {cvData.personal.photo ? 'Change' : 'Upload'}
        </Button>
        
        {cvData.personal.photo && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemovePhoto}
            disabled={uploading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Upload a professional photo (max 5MB)
      </p>
    </div>
  );
};

export default PhotoUpload;
