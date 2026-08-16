import React from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Award } from 'lucide-react';

const CertificationsForm: React.FC = () => {
  const { cvData, addCertification, updateCertification, removeCertification, updateInterests } = useCVContext();
  const certifications = cvData.certifications || [];
  const interests = cvData.interests || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-4">
        <h4 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Award className="w-5 h-5 text-accent" />
          Certifications
        </h4>
        {certifications.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
            <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No certifications added yet</p>
            <Button onClick={addCertification} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert, index) => (
                <div
                  key={cert.id}
                  className="p-4 bg-card border border-border rounded-lg space-y-3 animate-scale-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Certification {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCertification(cert.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Input
                    value={cert.name}
                    onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                    placeholder="Certification name"
                  />
                  <Input
                    value={cert.issuer}
                    onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                    placeholder="Issuing organization"
                  />
                  <Input
                    value={cert.year}
                    onChange={(e) => updateCertification(cert.id, 'year', e.target.value)}
                    placeholder="Year (e.g. 2024)"
                  />
                </div>
              ))}
            </div>
            <Button onClick={addCertification} variant="outline" className="w-full border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Certification
            </Button>
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="interests" className="text-sm font-medium text-foreground">
          Interests / Hobbies
        </Label>
        <Input
          id="interests"
          value={interests.join(', ')}
          onChange={(e) =>
            updateInterests(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
          }
          placeholder="Photography, Hiking, Open source"
        />
        <p className="text-xs text-muted-foreground">Comma-separated. Shown in the Europass &quot;Additional information&quot; section.</p>
      </div>
    </div>
  );
};

export default CertificationsForm;
