import React, { useEffect } from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import DatePicker from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, MapPin, Globe, Linkedin, FileText, Briefcase, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhotoUpload from './PhotoUpload';

const PersonalInfoForm: React.FC = () => {
  const { cvData, updatePersonal, setCVData } = useCVContext();
  const { user } = useAuth();
  const { personal } = cvData;

  useEffect(() => {
    if (!user) return;
    const reusable = user.profileData || {};
    setCVData((current) => ({
      ...current,
      personal: {
        ...current.personal,
        fullName: current.personal.fullName || user.displayName || '',
        email: current.personal.email || user.email,
        phone: current.personal.phone || user.phone || '',
        jobTitle: current.personal.jobTitle || reusable.jobTitle || '',
        location: current.personal.location || reusable.location || '',
        address: current.personal.address || reusable.address || '',
        website: current.personal.website || reusable.website || '',
        linkedin: current.personal.linkedin || reusable.linkedin || '',
        summary: current.personal.summary || reusable.summary || '',
      },
    }));
  }, [user?.id, user?.displayName, user?.email, user?.phone, user?.profileData, setCVData]);

  const useProfileDetails = () => {
    if (!user) return;
    const reusable = user.profileData || {};
    setCVData((current) => ({ ...current, personal: { ...current.personal, ...reusable, fullName: user.displayName || current.personal.fullName, email: user.email, phone: user.phone || current.personal.phone } }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {user && (
        <div className="flex flex-col gap-3 rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-cyan-900 dark:bg-cyan-950/30">
          <div className="flex items-start gap-2.5"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700 dark:text-cyan-300" /><div><p className="text-xs font-bold text-cyan-900 dark:text-cyan-100">Reusable profile details</p><p className="mt-0.5 text-[11px] text-cyan-800/70 dark:text-cyan-300/70">Name, sign-in email and mobile are prefilled from Account Settings. CV fields remain editable.</p></div></div>
          <Button type="button" variant="outline" size="sm" onClick={useProfileDetails} className="h-8 shrink-0 border-cyan-300 bg-white text-[11px] text-cyan-900 hover:bg-cyan-100 dark:bg-cyan-950 dark:text-cyan-100"><RefreshCw className="mr-1.5 h-3.5 w-3.5" />Use profile details</Button>
        </div>
      )}
      <PhotoUpload value={personal.photo || ''} onChange={(url) => updatePersonal('photo', url)} />
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
          <Label htmlFor="address" className="flex items-center gap-2 text-foreground font-medium">
            <MapPin className="w-4 h-4 text-accent" />
            Street Address <span className="text-muted-foreground">(Europass)</span>
          </Label>
          <Input
            id="address"
            value={personal.address}
            onChange={(e) => updatePersonal('address', e.target.value)}
            placeholder="123 Market Street"
            className="bg-card border-border focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="flex items-center gap-2 text-foreground font-medium">
            <User className="w-4 h-4 text-accent" />
            Date of Birth <span className="text-muted-foreground">(Europass)</span>
          </Label>
          <DatePicker
            id="dateOfBirth"
            value={personal.dateOfBirth}
            onChange={(v) => updatePersonal('dateOfBirth', v)}
            placeholder="Pick your date of birth"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality" className="flex items-center gap-2 text-foreground font-medium">
            <Globe className="w-4 h-4 text-accent" />
            Nationality <span className="text-muted-foreground">(Europass)</span>
          </Label>
          <Input
            id="nationality"
            value={personal.nationality}
            onChange={(e) => updatePersonal('nationality', e.target.value)}
            placeholder="American"
            className="bg-card border-border focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="flex items-center gap-2 text-foreground font-medium">
            <User className="w-4 h-4 text-accent" />
            Gender <span className="text-muted-foreground">(Europass)</span>
          </Label>
          <Select value={personal.gender || ''} onValueChange={(v) => updatePersonal('gender', v)}>
            <SelectTrigger id="gender" className="bg-card border-border focus:border-accent transition-colors">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Non-binary">Non-binary</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="driverLicense" className="flex items-center gap-2 text-foreground font-medium">
            <User className="w-4 h-4 text-accent" />
            Driving Licence <span className="text-muted-foreground">(Europass)</span>
          </Label>
          <Input
            id="driverLicense"
            value={personal.driverLicense}
            onChange={(e) => updatePersonal('driverLicense', e.target.value)}
            placeholder="B, AM"
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
