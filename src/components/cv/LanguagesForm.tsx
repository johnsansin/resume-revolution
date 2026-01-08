import React from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Languages } from 'lucide-react';

const LanguagesForm: React.FC = () => {
  const { cvData, addLanguage, updateLanguage, removeLanguage } = useCVContext();

  const proficiencyLevels = [
    { value: 'basic', label: 'Basic' },
    { value: 'conversational', label: 'Conversational' },
    { value: 'fluent', label: 'Fluent' },
    { value: 'native', label: 'Native' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {cvData.languages.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <Languages className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No languages added yet</p>
          <Button onClick={addLanguage} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Language
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cvData.languages.map((lang, index) => (
              <div
                key={lang.id}
                className="p-4 bg-card border border-border rounded-lg space-y-3 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Language {index + 1}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(lang.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  value={lang.name}
                  onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                  placeholder="Language name"
                />
                <Select
                  value={lang.proficiency}
                  onValueChange={(value) => updateLanguage(lang.id, 'proficiency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select proficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    {proficiencyLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <Button onClick={addLanguage} variant="outline" className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Language
          </Button>
        </>
      )}
    </div>
  );
};

export default LanguagesForm;
