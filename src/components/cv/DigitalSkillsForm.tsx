import React from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Cpu } from 'lucide-react';

const DigitalSkillsForm: React.FC = () => {
  const { cvData, addDigitalSkill, updateDigitalSkill, removeDigitalSkill } = useCVContext();
  const digitalSkills = cvData.digitalSkills || [];

  const levels = [
    { value: 'basic', label: 'Basic user' },
    { value: 'independent', label: 'Independent user' },
    { value: 'proficient', label: 'Proficient user' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <p className="text-sm text-muted-foreground">
        Used in the Europass CV template. Self-assess how well you can perform tasks in each digital area.
      </p>
      {digitalSkills.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <Cpu className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No digital skills added yet</p>
          <Button onClick={addDigitalSkill} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Digital Skill
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {digitalSkills.map((skill, index) => (
              <div
                key={skill.id}
                className="p-4 bg-card border border-border rounded-lg space-y-3 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Digital skill {index + 1}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDigitalSkill(skill.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Input
                  value={skill.name}
                  onChange={(e) => updateDigitalSkill(skill.id, 'name', e.target.value)}
                  placeholder="e.g. Information processing, Content creation"
                />
                <Select
                  value={skill.level}
                  onValueChange={(value) => updateDigitalSkill(skill.id, 'level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <Button onClick={addDigitalSkill} variant="outline" className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Digital Skill
          </Button>
        </>
      )}
    </div>
  );
};

export default DigitalSkillsForm;
