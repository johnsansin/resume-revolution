import React, { useState } from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { Download, FileSignature, Mail, Sparkles, Building2, User, Calendar } from 'lucide-react';
import { LetterData, LetterStyle } from '@/types/letter';
import { defaultLetterData, buildLetterFromCV } from '@/data/defaultLetter';
import LetterPdf from './templates/LetterTemplates';
import LetterPreview from './LetterPreview';

const LetterBuilder: React.FC = () => {
  const { cvData } = useCVContext();
  const { user } = useAuth();
  const [letter, setLetter] = useState<LetterData>(defaultLetterData);
  const [isDownloading, setIsDownloading] = useState(false);

  const set = (field: keyof LetterData, value: string) => {
    setLetter((prev) => ({ ...prev, [field]: value }));
  };

  const setStyle = (style: LetterStyle) => {
    setLetter((prev) => ({ ...prev, style }));
  };

  const fillFromCV = (style: LetterStyle) => {
    setStyle(style);
    setLetter(buildLetterFromCV(cvData, style));
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const blob = await pdf(
        <LetterPdf letter={letter} sender={cvData.personal} />
      ).toBlob();
      saveAs(blob, `${(letter.signerName || cvData.personal.fullName || 'letter').replace(/\s+/g, '-').toLowerCase()}-${letter.style}.pdf`);
    } catch (error) {
      console.error('Error generating letter PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <div className="career-letter-tools">
          <Badge variant="secondary"><FileSignature />{letter.style === 'cover' ? 'Cover Letter' : 'Motivation Letter'}</Badge>
          <Button variant="outline" onClick={() => fillFromCV('cover')}><Mail />Fill from my CV</Button>
          <Button onClick={handleDownload} disabled={isDownloading}><Download />{isDownloading ? 'Generating…' : 'Download PDF'}</Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="bg-card rounded-2xl border border-border/60 shadow-card overflow-hidden ring-1 ring-border/30">
            <div className="relative bg-gradient-to-r from-navy via-navy/95 to-teal/90 px-6 py-5 overflow-hidden">
              <div className="absolute -right-8 -top-12 w-52 h-52 rounded-full bg-accent/25 blur-2xl" />
              <div className="absolute right-24 -bottom-14 w-44 h-44 rounded-full bg-teal/25 blur-2xl" />
              <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/25 backdrop-blur">
                    <FileSignature className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Letter Details</h2>
                    <p className="text-xs text-white/75 mt-0.5">Recipient, company and your story</p>
                  </div>
                </div>
                <div className="flex gap-1.5 p-1 rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                  <button
                    onClick={() => setStyle('cover')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${letter.style === 'cover' ? 'bg-white text-navy shadow' : 'text-white/80 hover:bg-white/15'}`}
                  >
                    Cover (US)
                  </button>
                  <button
                    onClick={() => setStyle('motivation')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${letter.style === 'motivation' ? 'bg-white text-navy shadow' : 'text-white/80 hover:bg-white/15'}`}
                  >
                    Motivation (EU)
                  </button>
                  <button
                    onClick={() => fillFromCV(letter.style)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-accent/80 text-white hover:bg-accent flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Draft
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="w-4 h-4 text-accent" />
                  Date
                </Label>
                <Input value={letter.date} onChange={(e) => set('date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground font-medium">
                  <User className="w-4 h-4 text-accent" />
                  Recipient Name
                </Label>
                <Input value={letter.recipientName} onChange={(e) => set('recipientName', e.target.value)} placeholder="Hiring Manager" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground font-medium">
                  <User className="w-4 h-4 text-accent" />
                  Recipient Title
                </Label>
                <Input value={letter.recipientTitle} onChange={(e) => set('recipientTitle', e.target.value)} placeholder="Talent Acquisition Lead" />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-foreground font-medium">
                  <Building2 className="w-4 h-4 text-accent" />
                  Company
                </Label>
                <Input value={letter.company} onChange={(e) => set('company', e.target.value)} placeholder="Acme Inc." />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-foreground font-medium">Company Address</Label>
                <Input value={letter.companyAddress} onChange={(e) => set('companyAddress', e.target.value)} placeholder="123 Business Rd, City" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-foreground font-medium">Subject / Position</Label>
                <Input value={letter.subject} onChange={(e) => set('subject', e.target.value)} placeholder="Application for the position of Software Engineer" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-foreground font-medium">Salutation</Label>
                <Input value={letter.salutation} onChange={(e) => set('salutation', e.target.value)} placeholder="Dear Hiring Manager," />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-foreground font-medium">Opening</Label>
                <Textarea value={letter.opening} onChange={(e) => set('opening', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-foreground font-medium">Body</Label>
                <Textarea value={letter.body} onChange={(e) => set('body', e.target.value)} rows={8} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-foreground font-medium">Closing</Label>
                <Textarea value={letter.closing} onChange={(e) => set('closing', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Sign-off</Label>
                <Input value={letter.signOff} onChange={(e) => set('signOff', e.target.value)} placeholder="Sincerely," />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Signer Name</Label>
                <Input value={letter.signerName} onChange={(e) => set('signerName', e.target.value)} placeholder={user ? user.email || '' : ''} />
              </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            <div className="bg-card rounded-2xl border border-border/60 shadow-card p-4 h-full flex flex-col ring-1 ring-border/30">
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-base font-bold text-foreground tracking-tight">Live Preview</h2>
                <span className="text-sm text-accent capitalize">
                  {letter.style === 'cover' ? 'Cover Letter' : 'Motivation Letter'}
                </span>
              </div>
              <div className="flex-1 overflow-auto bg-gradient-to-b from-muted/80 to-muted rounded-xl p-4 flex items-start justify-center ring-1 ring-border/20">
                <div className="w-full max-w-md">
                  <LetterPreview letter={letter} sender={cvData.personal} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LetterBuilder;
