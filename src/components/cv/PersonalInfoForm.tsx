import React from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, Globe, Linkedin, FileText, Briefcase } from 'lucide-react';

const PersonalInfoForm: React.FC = () => {
  const { cvData, updatePersonal } = useCVContext();
  const { personal } = cvData;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="flex items-center gap-2 text-foreground font-medium">
            <User className="w-4 h-4 text-accent" />
            Full Name
          </Label>
          <Input
            id="fullName"
            value={personal.fullName}
            onChange={(e) => updatePersonal('fullName', e.target.value)}
            placeholder="John Doe"
            className="bg-card border-border focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle" className="flex items-center gap-2 text-foreground font-medium">
            <Briefcase className="w-4 h-4 text-accent" />
            Job Title
          </Label>
          <Input
            id="jobTitle"
            value={personal.jobTitle}
            onChange={(e) => updatePersonal('jobTitle', e.target.value)}
            placeholder="Software Engineer"
            className="bg-card border-border focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2 text-foreground font-medium">
            <Mail className="w-4 h-4 text-accent" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={personal.email}
            onChange={(e) => updatePersonal('email', e.target.value)}
            placeholder="john@example.com"
            className="bg-card border-border focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2 text-foreground font-medium">
            <Phone className="w-4 h-4 text-accent" />
            Phone
          </Label>
          <Input
            id="phone"
            value={personal.phone}
            onChange={(e) => updatePersonal('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="bg-card border-border focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location" className="flex items-center gap-2 text-foreground font-medium">
            <MapPin className="w-4 h-4 text-accent" />
            Location
          </Label>
          <Input
            id="location"
            value={personal.location}
            onChange={(e) => updatePersonal('location', e.target.value)}
            placeholder="San Francisco, CA"
            className="bg-card border-border focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2 text-foreground font-medium">
            <Globe className="w-4 h-4 text-accent" />
            Website (Optional)
          </Label>
          <Input
            id="website"
            value={personal.website}
            onChange={(e) => updatePersonal('website', e.target.value)}
            placeholder="www.johndoe.com"
            className="bg-card border-border focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="linkedin" className="flex items-center gap-2 text-foreground font-medium">
            <Linkedin className="w-4 h-4 text-accent" />
            LinkedIn (Optional)
          </Label>
          <Input
            id="linkedin"
            value={personal.linkedin}
            onChange={(e) => updatePersonal('linkedin', e.target.value)}
            placeholder="linkedin.com/in/johndoe"
            className="bg-card border-border focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="summary" className="flex items-center gap-2 text-foreground font-medium">
            <FileText className="w-4 h-4 text-accent" />
            Professional Summary
          </Label>
          <Textarea
            id="summary"
            value={personal.summary}
            onChange={(e) => updatePersonal('summary', e.target.value)}
            placeholder="Brief overview of your professional background and key achievements..."
            rows={4}
            className="bg-card border-border focus:border-accent transition-colors resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
