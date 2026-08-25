import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { api } from '@/integrations/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ThemePicker from '@/components/ThemePicker';
import { User, Lock, Loader2, Save, ShieldCheck, CheckCircle2, Palette, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SettingsProps {
  embedded?: boolean;
}

const Settings: React.FC<SettingsProps> = ({ embedded = false }) => {
  const { user, updateProfile } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();

  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileDetails, setProfileDetails] = useState({
    jobTitle: user?.profileData?.jobTitle || '', location: user?.profileData?.location || '',
    address: user?.profileData?.address || '', website: user?.profileData?.website || '',
    linkedin: user?.profileData?.linkedin || '', summary: user?.profileData?.summary || '',
  });
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    const cleanPhone = phone.trim();
    if (cleanPhone && !/^\+?[0-9()\-\s.]{7,25}$/.test(cleanPhone)) {
      setSavingName(false);
      toast({ title: 'Invalid mobile number', description: 'Use 7–25 digits with an optional country code.', variant: 'destructive' });
      return;
    }
    const { error } = await updateProfile({ displayName: name.trim() || user?.email?.split('@')[0] || 'User', phone: cleanPhone, profileData: profileDetails });
    setSavingName(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile updated', description: 'Your reusable contact details have been saved.' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast({ title: 'Current password required', description: 'Please enter your current password.', variant: 'destructive' });
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 128) {
      toast({ title: 'Validation Error', description: 'New password must be between 6 and 128 characters.', variant: 'destructive' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'New password and confirmation must match.', variant: 'destructive' });
      return;
    }

    setChangingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast({ title: 'Password changed', description: 'Your password has been updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className={embedded ? 'w-full' : 'min-h-screen bg-gradient-to-br from-background via-background to-secondary flex flex-col'}>
      <main className={`w-full max-w-2xl mx-auto px-4 pb-10 ${embedded ? 'py-0' : 'flex-1 py-6'}`}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Account</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile and password
            {isAdmin && (
              <Badge className="ml-2 bg-accent/15 text-accent border-accent/30">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Superadmin
              </Badge>
            )}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                Profile
              </CardTitle>
              <CardDescription>These verified account details can be reused in every new CV.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveName} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-email" className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" />Email</Label>
                  <Input id="settings-email" value={user?.email || ''} disabled />
                  <p className="text-xs text-muted-foreground">Your sign-in email is reused in CV contact details.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="settings-job-title">Professional Title</Label><Input id="settings-job-title" value={profileDetails.jobTitle} onChange={(e) => setProfileDetails((p) => ({ ...p, jobTitle: e.target.value }))} placeholder="Software Engineer" /></div>
                  <div className="space-y-2"><Label htmlFor="settings-location">City / Location</Label><Input id="settings-location" value={profileDetails.location} onChange={(e) => setProfileDetails((p) => ({ ...p, location: e.target.value }))} placeholder="London, UK" /></div>
                  <div className="space-y-2 sm:col-span-2"><Label htmlFor="settings-address">Address</Label><Input id="settings-address" value={profileDetails.address} onChange={(e) => setProfileDetails((p) => ({ ...p, address: e.target.value }))} placeholder="Street and postal address" /></div>
                  <div className="space-y-2"><Label htmlFor="settings-website">Website</Label><Input id="settings-website" value={profileDetails.website} onChange={(e) => setProfileDetails((p) => ({ ...p, website: e.target.value }))} placeholder="portfolio.example.com" /></div>
                  <div className="space-y-2"><Label htmlFor="settings-linkedin">LinkedIn</Label><Input id="settings-linkedin" value={profileDetails.linkedin} onChange={(e) => setProfileDetails((p) => ({ ...p, linkedin: e.target.value }))} placeholder="linkedin.com/in/yourname" /></div>
                  <div className="space-y-2 sm:col-span-2"><Label htmlFor="settings-summary">Professional Summary</Label><textarea id="settings-summary" value={profileDetails.summary} onChange={(e) => setProfileDetails((p) => ({ ...p, summary: e.target.value }))} rows={4} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="A reusable professional introduction…" /></div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-phone" className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" />Mobile Number</Label>
                  <Input id="settings-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" autoComplete="tel" />
                  <p className="text-xs text-muted-foreground">Include the country code so employers can reach you internationally.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-name">Display Name</Label>
                  <Input
                    id="settings-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <Button type="submit" disabled={savingName} className="bg-accent hover:bg-accent/90">
                  {savingName ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-accent" />
                Color Theme
              </CardTitle>
              <CardDescription>Pick an accent color for the entire interface. Light and dark mode are controlled by the toggle in the top bar.</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemePicker />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-accent" />
                Change Password
              </CardTitle>
              <CardDescription>Enter your current password, then choose a new one (min 6 characters).</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-current-password">Current Password</Label>
                  <Input
                    id="settings-current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-new-password">New Password</Label>
                  <Input
                    id="settings-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-confirm-password">Confirm New Password</Label>
                  <Input
                    id="settings-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" disabled={changingPassword} variant="outline">
                  {changingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2 text-accent" />}
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
