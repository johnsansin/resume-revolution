import React from 'react';
import { TemplateId } from '@/types/cv';
import { useCVContext } from '@/contexts/CVContext';
import { Check, ShieldCheck, FileBadge, Camera } from 'lucide-react';

const templateData: { id: TemplateId; name: string; description: string; color: string; badge?: string }[] = [
  { id: 'europass', name: 'Europass CV', description: 'Official EU format', color: 'bg-[#1e4e79]', badge: 'EU' },
  { id: 'ats', name: 'ATS Friendly', description: 'Parses cleanly in ATS', color: 'bg-[#0f766e]', badge: 'ATS' },
  { id: 'photo-modern', name: 'Photo Modern', description: 'Sidebar with large photo', color: 'bg-[#0f172a]', badge: 'Photo' },
  { id: 'photo-classic', name: 'Photo Classic', description: 'Large header photo', color: 'bg-[#1a365d]', badge: 'Photo' },
  { id: 'photo-creative', name: 'Photo Creative', description: 'Colorful photo band', color: 'bg-[#7c3aed]', badge: 'Photo' },
  { id: 'classic', name: 'Classic', description: 'Traditional & clean', color: 'bg-[#1a365d]' },
  { id: 'modern', name: 'Modern', description: 'Contemporary sidebar', color: 'bg-[#1a365d]' },
  { id: 'minimal', name: 'Minimal', description: 'Simple elegance', color: 'bg-[#1a1a1a]' },
  { id: 'professional', name: 'Professional', description: 'Corporate style', color: 'bg-[#2b6cb0]' },
  { id: 'executive', name: 'Executive', description: 'Senior-level', color: 'bg-[#c9a227]' },
  { id: 'tech', name: 'Tech', description: 'Developer-focused', color: 'bg-[#0d1117]' },
  { id: 'compact', name: 'Compact', description: 'One-page dense', color: 'bg-[#2563eb]' },
  { id: 'corporate', name: 'Corporate', description: 'Business formal', color: 'bg-[#1e3a5f]' },
  { id: 'academic', name: 'Academic', description: 'Educational focus', color: 'bg-[#2c5282]' },
  { id: 'startup', name: 'Startup', description: 'Innovative vibe', color: 'bg-[#6b46c1]' },
  { id: 'consultant', name: 'Consultant', description: 'Professional edge', color: 'bg-[#2f855a]' },
  { id: 'finance', name: 'Finance', description: 'Executive polish', color: 'bg-[#1a365d]' },
  { id: 'healthcare', name: 'Healthcare', description: 'Medical field', color: 'bg-[#38a169]' },
  { id: 'legal', name: 'Legal', description: 'Law profession', color: 'bg-[#742a2a]' },
  { id: 'creative', name: 'Creative', description: 'Bold & unique', color: 'bg-[#319795]' },
];

const TemplateSelector: React.FC = () => {
  const { selectedTemplate, setSelectedTemplate } = useCVContext();

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-sm text-muted-foreground mb-4">A curated set of 20 professional templates — including Europass, ATS-friendly and photo styles</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-[500px] overflow-y-auto pr-2">
        {templateData.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`relative p-3 rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${
              selectedTemplate === template.id
                ? 'border-accent bg-accent/5 shadow-md'
                : 'border-border hover:border-accent/50'
            }`}
          >
            {selectedTemplate === template.id && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center z-10">
                <Check className="w-3 h-3 text-accent-foreground" />
              </div>
            )}
            {template.badge && (
              <div className="absolute -top-2 -left-2 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-navy to-teal text-white text-[9px] font-bold px-2 py-0.5 shadow">
                {template.id === 'ats' ? <ShieldCheck className="w-3 h-3" /> : template.id === 'europass' ? <FileBadge className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                {template.badge}
              </div>
            )}
            <div className={`w-full h-12 ${template.color} rounded mb-2 flex items-center justify-center`}>
              <div className="w-6 h-8 bg-card/90 rounded-sm flex flex-col p-0.5 gap-0.5">
                <div className="w-full h-0.5 bg-muted-foreground/30 rounded-full" />
                <div className="w-3/4 h-0.5 bg-muted-foreground/20 rounded-full" />
                <div className="w-full h-0.5 bg-muted-foreground/10 rounded-full" />
              </div>
            </div>
            <h4 className="font-semibold text-xs text-foreground">{template.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
