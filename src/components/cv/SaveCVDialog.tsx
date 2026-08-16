import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Save, Loader2 } from 'lucide-react';
import { useCVContext } from '@/contexts/CVContext';
import { useSavedCVs } from '@/hooks/useSavedCVs';

const SaveCVDialog: React.FC = () => {
  const { cvData, selectedTemplate } = useCVContext();
  const { saveCV, saving } = useSavedCVs();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const handleSave = async () => {
    const cvName = name.trim() || `${cvData.personal.fullName || 'Untitled'}'s CV`;
    await saveCV(cvName, cvData, selectedTemplate);
    setName('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-white/25 bg-white/5 text-white hover:text-white hover:bg-white/15 hover:border-white/40">
          <Save className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Save CV</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Your CV</DialogTitle>
          <DialogDescription>
            Give your CV a name to save it to your account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="cv-name">CV Name</Label>
          <Input
            id="cv-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`${cvData.personal.fullName || 'My'}'s CV`}
            className="mt-2"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveCVDialog;
