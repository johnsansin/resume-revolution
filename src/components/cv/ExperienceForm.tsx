import React from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Building2, Briefcase, MapPin, Calendar } from 'lucide-react';

const ExperienceForm: React.FC = () => {
  const { cvData, addExperience, updateExperience, removeExperience } = useCVContext();

  return (
    <div className="space-y-6 animate-fade-in">
      {cvData.experience.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No work experience added yet</p>
          <Button onClick={addExperience} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </div>
      ) : (
        <>
          {cvData.experience.map((exp, index) => (
            <div
              key={exp.id}
              className="p-6 bg-card border border-border rounded-lg space-y-4 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-accent" />
                  Experience {index + 1}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(exp.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-accent" />
                    Company
                  </Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    placeholder="Company Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-accent" />
                    Position
                  </Label>
                  <Input
                    value={exp.position}
                    onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                    placeholder="Job Title"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    Location
                  </Label>
                  <Input
                    value={exp.location}
                    onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                    placeholder="City, Country"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    Start Date
                  </Label>
                  <Input
                    type="month"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`current-${exp.id}`}
                      checked={exp.current}
                      onCheckedChange={(checked) => updateExperience(exp.id, 'current', checked as boolean)}
                    />
                    <label htmlFor={`current-${exp.id}`} className="text-sm text-muted-foreground">
                      Currently working here
                    </label>
                  </div>
                  {!exp.current && (
                    <>
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        End Date
                      </Label>
                      <Input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                      />
                    </>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    placeholder="Describe your responsibilities and achievements..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button onClick={addExperience} variant="outline" className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Experience
          </Button>
        </>
      )}
    </div>
  );
};

export default ExperienceForm;
