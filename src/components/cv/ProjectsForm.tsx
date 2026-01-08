import React from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FolderKanban, Link, Code } from 'lucide-react';

const ProjectsForm: React.FC = () => {
  const { cvData, addProject, updateProject, removeProject } = useCVContext();

  const handleTechnologiesChange = (id: string, value: string) => {
    const technologies = value.split(',').map(t => t.trim()).filter(Boolean);
    updateProject(id, 'technologies', technologies);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {cvData.projects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No projects added yet</p>
          <Button onClick={addProject} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>
      ) : (
        <>
          {cvData.projects.map((project, index) => (
            <div
              key={project.id}
              className="p-6 bg-card border border-border rounded-lg space-y-4 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-accent" />
                  Project {index + 1}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(project.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-accent" />
                    Project Name
                  </Label>
                  <Input
                    value={project.name}
                    onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                    placeholder="Project Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-accent" />
                    Project URL (Optional)
                  </Label>
                  <Input
                    value={project.url || ''}
                    onChange={(e) => updateProject(project.id, 'url', e.target.value)}
                    placeholder="github.com/yourproject"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-accent" />
                    Technologies (comma-separated)
                  </Label>
                  <Input
                    value={project.technologies.join(', ')}
                    onChange={(e) => handleTechnologiesChange(project.id, e.target.value)}
                    placeholder="React, Node.js, PostgreSQL"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={project.description}
                    onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                    placeholder="Describe your project and its impact..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
          <Button onClick={addProject} variant="outline" className="w-full border-dashed">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Project
          </Button>
        </>
      )}
    </div>
  );
};

export default ProjectsForm;
