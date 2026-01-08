import React from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GraduationCap, School, BookOpen, Calendar } from 'lucide-react';

const EducationForm: React.FC = () => {
  const { cvData, addEducation, updateEducation, removeEducation } = useCVContext();

  return (
    <div className="space-y-6 animate-fade-in">
      {cvData.education.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No education added yet</p>
          <Button onClick={addEducation} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Education
          </Button>
        </div>
      ) : (
        <>
          {cvData.education.map((edu, index) => (
            <div
              key={edu.id}
              className="p-6 bg-card border border-border rounded-lg space-y-4 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <School className="w-5 h-5 text-accent" />
                  Education {index + 1}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(edu.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <School className="w-4 h-4 text-accent" />
                    Institution
                  </Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    placeholder="University Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-accent" />
                    Degree
                  </Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    placeholder="Bachelor of Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                    Field of Study
                  </Label>
                  <Input
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                    placeholder="Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <Label>GPA (Optional)</Label>
                  <Input
                    value={edu.gpa || ''}
                    onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                    placeholder="3.8"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    Start Date
                  </Label>
                  <Input
                    type="month"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    End Date
                  </Label>
                  <Input
                    type="month"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Additional Info (Optional)</Label>
                  <Textarea
                    value={edu.description || ''}
                    onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                    placeholder="Honors, achievements, relevant coursework..."
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button onClick={addEducation} variant="outline" className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Education
          </Button>
        </>
      )}
    </div>
  );
};

export default EducationForm;
