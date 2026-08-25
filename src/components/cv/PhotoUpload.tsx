import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Photo must be under 5MB', variant: 'destructive' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }

    setUploading(true);

    try {
      // Convert to base64 data URL for storage in the CV data
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onChange(dataUrl);
        setUploading(false);
        toast({ title: 'Photo uploaded' });
      };
      reader.onerror = () => {
        setUploading(false);
        toast({ title: 'Upload failed', description: 'Could not read the file', variant: 'destructive' });
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
      toast({ title: 'Upload failed', description: 'An unexpected error occurred', variant: 'destructive' });
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <Label>Photo</Label>
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-1 -right-1 h-6 w-6"
              onClick={handleRemove}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
            <Camera className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            id="photo-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Camera className="w-4 h-4 mr-2" />
            )}
            {value ? 'Change Photo' : 'Upload Photo'}
          </Button>
          <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
