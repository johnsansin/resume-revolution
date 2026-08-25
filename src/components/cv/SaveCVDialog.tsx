import React, { useEffect, useState } from 'react';
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
  const { saveCV, updateCV, saving } = useSavedCVs();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [activeCV,setActiveCV]=useState<{id:string;name:string}|null>(()=>{if(typeof window==='undefined')return null;try{const value=localStorage.getItem('career_active_saved_cv');const active=value?JSON.parse(value):null;return active?.id?active:null;}catch{return null;}});

  useEffect(()=>{if(!open)return;try{const value=localStorage.getItem('career_active_saved_cv');const active=value?JSON.parse(value):null;setActiveCV(active?.id?active:null);setName(active?.name||'');}catch{setActiveCV(null);}},[open]);
  useEffect(()=>{const sync=()=>{try{const value=localStorage.getItem('career_active_saved_cv');const active=value?JSON.parse(value):null;setActiveCV(active?.id?active:null);setName(active?.name||'');}catch{setActiveCV(null);}};window.addEventListener('career:active-cv',sync);return()=>window.removeEventListener('career:active-cv',sync);},[]);

  const handleSave = async () => {
    const cvName = name.trim() || `${cvData.personal.fullName || 'Untitled'}'s CV`;
    const saved=await saveCV(cvName, cvData, selectedTemplate);
    if(saved){const active={id:saved.id,name:saved.name};localStorage.setItem('career_active_saved_cv',JSON.stringify(active));setActiveCV(active);}
    setName('');
    setOpen(false);
  };

  const handleUpdate=async()=>{if(!activeCV)return;const cvName=name.trim()||activeCV.name;const updated=await updateCV(activeCV.id,{name:cvName,cvData,templateId:selectedTemplate});if(updated){localStorage.setItem('career_active_saved_cv',JSON.stringify({id:activeCV.id,name:cvName}));setOpen(false);}};

  return (<>
    {activeCV&&<Button onClick={handleUpdate} disabled={saving} size="sm" className="h-8 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-500">{saving?<Loader2 className="h-3.5 w-3.5 animate-spin md:mr-1.5"/>:<Save className="h-3.5 w-3.5 md:mr-1.5"/>}<span className="hidden md:inline">Update CV</span></Button>}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs border-white/25 bg-white/5 text-white hover:text-white hover:bg-white/15 hover:border-white/40 px-2.5">
          <Save className="w-3.5 h-3.5 md:mr-1.5" />
          <span className="hidden md:inline">{activeCV?'Save as new copy':'Save New CV'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activeCV?'Save as new copy':'Save Your CV'}</DialogTitle>
          <DialogDescription>
            {activeCV?`Create a separate copy of “${activeCV.name}”. The original CV will not be overwritten.`:'Give your CV a name to save it to your account.'}
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
          <Button onClick={handleSave} disabled={saving} variant={activeCV?'outline':'default'} className={activeCV?'':'bg-accent hover:bg-accent/90'}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {activeCV?'Save as new copy':'Save'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog></>
  );
};

export default SaveCVDialog;
