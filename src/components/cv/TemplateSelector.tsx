import React from 'react';
import { TemplateId } from '@/types/cv';
import { useCVContext } from '@/contexts/CVContext';
import { Check } from 'lucide-react';

const templateData = [
  { id: 'classic' as TemplateId, name: 'Classic', description: 'Traditional and clean', color: 'bg-navy' },
  { id: 'modern' as TemplateId, name: 'Modern', description: 'Contemporary sidebar', color: 'bg-navy' },
  { id: 'minimal' as TemplateId, name: 'Minimal', description: 'Simple elegance', color: 'bg-foreground' },
  { id: 'creative' as TemplateId, name: 'Creative', description: 'Bold and unique', color: 'bg-teal' },
  { id: 'professional' as TemplateId, name: 'Professional', description: 'Corporate style', color: 'bg-blue-600' },
  { id: 'executive' as TemplateId, name: 'Executive', description: 'Senior-level elegance', color: 'bg-amber-600' },
  { id: 'tech' as TemplateId, name: 'Tech', description: 'Developer-focused', color: 'bg-green-600' },
  { id: 'compact' as TemplateId, name: 'Compact', description: 'One-page dense', color: 'bg-blue-500' },
  { id: 'elegant' as TemplateId, name: 'Elegant', description: 'Sophisticated style', color: 'bg-amber-700' },
  { id: 'bold' as TemplateId, name: 'Bold', description: 'Strong typography', color: 'bg-red-500' },
];

const TemplateSelector: React.FC = () => {
  const { selectedTemplate, setSelectedTemplate } = useCVContext();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {templateData.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`relative p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg ${
              selectedTemplate === template.id
                ? 'border-accent bg-accent/5 shadow-md'
                : 'border-border hover:border-accent/50'
            }`}
          >
            {selectedTemplate === template.id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-accent-foreground" />
              </div>
            )}
            <div className={`w-full h-16 ${template.color} rounded mb-3 flex items-center justify-center`}>
              <div className="w-8 h-10 bg-card/90 rounded-sm flex flex-col p-1 gap-0.5">
                <div className="w-full h-1 bg-muted-foreground/30 rounded-full" />
                <div className="w-3/4 h-0.5 bg-muted-foreground/20 rounded-full" />
                <div className="w-full h-0.5 bg-muted-foreground/10 rounded-full" />
                <div className="w-2/3 h-0.5 bg-muted-foreground/10 rounded-full" />
              </div>
            </div>
            <h4 className="font-semibold text-sm text-foreground">{template.name}</h4>
            <p className="text-xs text-muted-foreground">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
