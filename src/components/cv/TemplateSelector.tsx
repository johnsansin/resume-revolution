import React from 'react';
import { TemplateId } from '@/types/cv';
import { useCVContext } from '@/contexts/CVContext';
import { Check } from 'lucide-react';

const templateData: { id: TemplateId; name: string; description: string; color: string }[] = [
  { id: 'classic', name: 'Classic', description: 'Traditional & clean', color: 'bg-[#1a365d]' },
  { id: 'modern', name: 'Modern', description: 'Contemporary sidebar', color: 'bg-[#1a365d]' },
  { id: 'minimal', name: 'Minimal', description: 'Simple elegance', color: 'bg-[#1a1a1a]' },
  { id: 'creative', name: 'Creative', description: 'Bold & unique', color: 'bg-[#319795]' },
  { id: 'professional', name: 'Professional', description: 'Corporate style', color: 'bg-[#2b6cb0]' },
  { id: 'executive', name: 'Executive', description: 'Senior-level', color: 'bg-[#c9a227]' },
  { id: 'tech', name: 'Tech', description: 'Developer-focused', color: 'bg-[#0d1117]' },
  { id: 'compact', name: 'Compact', description: 'One-page dense', color: 'bg-[#2563eb]' },
  { id: 'elegant', name: 'Elegant', description: 'Sophisticated', color: 'bg-[#744210]' },
  { id: 'bold', name: 'Bold', description: 'Strong typography', color: 'bg-[#e53e3e]' },
  { id: 'corporate', name: 'Corporate', description: 'Business formal', color: 'bg-[#1e3a5f]' },
  { id: 'academic', name: 'Academic', description: 'Educational focus', color: 'bg-[#2c5282]' },
  { id: 'startup', name: 'Startup', description: 'Innovative vibe', color: 'bg-[#6b46c1]' },
  { id: 'designer', name: 'Designer', description: 'Creative flair', color: 'bg-[#d53f8c]' },
  { id: 'consultant', name: 'Consultant', description: 'Professional edge', color: 'bg-[#2f855a]' },
  { id: 'engineer', name: 'Engineer', description: 'Technical precision', color: 'bg-[#3182ce]' },
  { id: 'marketing', name: 'Marketing', description: 'Brand-focused', color: 'bg-[#dd6b20]' },
  { id: 'finance', name: 'Finance', description: 'Executive polish', color: 'bg-[#1a365d]' },
  { id: 'healthcare', name: 'Healthcare', description: 'Medical field', color: 'bg-[#38a169]' },
  { id: 'legal', name: 'Legal', description: 'Law profession', color: 'bg-[#742a2a]' },
  { id: 'artistic', name: 'Artistic', description: 'Creative industries', color: 'bg-[#9f7aea]' },
  { id: 'gradient', name: 'Gradient', description: 'Modern gradient', color: 'bg-gradient-to-r from-[#667eea] to-[#805ad5]' },
  { id: 'timeline', name: 'Timeline', description: 'Chronological focus', color: 'bg-[#4299e1]' },
  { id: 'infographic', name: 'Infographic', description: 'Visual data', color: 'bg-[#ed8936]' },
  { id: 'simple', name: 'Simple', description: 'No-frills clean', color: 'bg-[#4a5568]' },
  { id: 'clean', name: 'Clean', description: 'Fresh & clear', color: 'bg-[#38b2ac]' },
  { id: 'formal', name: 'Formal', description: 'Traditional formal', color: 'bg-[#2d3748]' },
  { id: 'casual', name: 'Casual', description: 'Relaxed style', color: 'bg-[#ed64a6]' },
  { id: 'contemporary', name: 'Contemporary', description: 'Current trends', color: 'bg-[#00b5d8]' },
  { id: 'traditional', name: 'Traditional', description: 'Classic approach', color: 'bg-[#744210]' },
  { id: 'sleek', name: 'Sleek', description: 'Streamlined look', color: 'bg-[#1a202c]' },
  { id: 'vibrant', name: 'Vibrant', description: 'Energetic colors', color: 'bg-[#f56565]' },
  { id: 'monochrome', name: 'Monochrome', description: 'Black & white', color: 'bg-[#1a1a1a]' },
  { id: 'pastel', name: 'Pastel', description: 'Soft colors', color: 'bg-[#b794f4]' },
  { id: 'dark', name: 'Dark', description: 'Dark theme', color: 'bg-[#1a202c]' },
  { id: 'light', name: 'Light', description: 'Light theme', color: 'bg-[#667eea]' },
  { id: 'accent', name: 'Accent', description: 'Accent colors', color: 'bg-[#48bb78]' },
  { id: 'iconic', name: 'Iconic', description: 'Standout design', color: 'bg-[#e53e3e]' },
  { id: 'geometric', name: 'Geometric', description: 'Sharp shapes', color: 'bg-[#3182ce]' },
  { id: 'organic', name: 'Organic', description: 'Natural feel', color: 'bg-[#68d391]' },
  { id: 'modular', name: 'Modular', description: 'Block layout', color: 'bg-[#9f7aea]' },
  { id: 'structured', name: 'Structured', description: 'Organized layout', color: 'bg-[#2b6cb0]' },
  { id: 'flowing', name: 'Flowing', description: 'Smooth transitions', color: 'bg-[#4fd1c5]' },
  { id: 'metro', name: 'Metro', description: 'Windows-inspired', color: 'bg-[#00a4ef]' },
  { id: 'swiss', name: 'Swiss', description: 'Helvetica style', color: 'bg-[#e53e3e]' },
  { id: 'nordic', name: 'Nordic', description: 'Scandinavian', color: 'bg-[#4a5568]' },
  { id: 'retro', name: 'Retro', description: 'Vintage feel', color: 'bg-[#d69e2e]' },
  { id: 'futuristic', name: 'Futuristic', description: 'Sci-fi inspired', color: 'bg-[#00d9ff]' },
  { id: 'premium', name: 'Premium', description: 'Luxury gold', color: 'bg-gradient-to-r from-[#1a1a1a] to-[#c9a227]' },
  { id: 'luxe', name: 'Luxe', description: 'Ultimate elegance', color: 'bg-gradient-to-r from-[#0d0d0d] to-[#d4af37]' },
];

const TemplateSelector: React.FC = () => {
  const { selectedTemplate, setSelectedTemplate } = useCVContext();

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-sm text-muted-foreground mb-4">Choose from 50 professional templates</p>
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
