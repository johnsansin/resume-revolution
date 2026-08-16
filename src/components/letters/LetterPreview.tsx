import React from 'react';
import { LetterData } from '@/types/letter';
import { PersonalInfo } from '@/types/cv';

interface LetterPreviewProps {
  letter: LetterData;
  sender: PersonalInfo;
}

const LetterPreview: React.FC<LetterPreviewProps> = ({ letter, sender }) => {
  const paragraphs = letter.body.split(/\n\s*\n/).filter(Boolean);
  const senderAddress = [sender.address, sender.location].filter(Boolean).join(', ');
  const senderContact = [sender.phone, sender.email, sender.website].filter(Boolean).join('  ·  ');

  return (
    <div className="bg-white text-gray-900 shadow-xl rounded-lg p-8 font-serif text-sm leading-relaxed min-h-[900px]" style={{ aspectRatio: '210/297' }}>
      {letter.style === 'motivation' ? (
        <>
          <div className="bg-[#1e4e79] text-white px-3 py-1.5 font-sans font-bold text-sm uppercase mb-6">
            Motivation Letter
          </div>
          <div className="font-sans font-bold text-base">{sender.fullName || letter.signerName}</div>
          {senderAddress && <div className="text-xs text-gray-600">{senderAddress}</div>}
          {senderContact && <div className="text-xs text-gray-600">{senderContact}</div>}
          <div className="mt-4 text-xs">{letter.date}</div>
          {letter.company && (
            <div className="mt-4 text-xs">
              <div>{letter.recipientName || letter.recipientTitle}</div>
              <div>{letter.company}</div>
              {letter.companyAddress && <div>{letter.companyAddress}</div>}
            </div>
          )}
          {letter.subject && (
            <div className="mt-4 font-bold border-b-2 border-[#1e4e79] pb-1">{letter.subject}</div>
          )}
          <div className="mt-4">{letter.salutation}</div>
          {letter.opening && <p className="mt-3">{letter.opening}</p>}
          {paragraphs.map((p, i) => <p key={i} className="mt-3">{p}</p>)}
          {letter.closing && <p className="mt-3">{letter.closing}</p>}
          <div className="mt-4">{letter.signOff}</div>
          <div className="mt-8 font-sans font-bold">{letter.signerName || sender.fullName}</div>
        </>
      ) : (
        <>
          <div className="font-sans font-bold text-base">{sender.fullName || letter.signerName}</div>
          {senderAddress && <div className="text-xs text-gray-600">{senderAddress}</div>}
          {senderContact && <div className="text-xs text-gray-600">{senderContact}</div>}
          <div className="mt-4 text-xs">{letter.date}</div>
          <div className="mt-4 text-xs">
            <div>{letter.recipientName || letter.recipientTitle}</div>
            <div>{letter.company}</div>
            {letter.companyAddress && <div>{letter.companyAddress}</div>}
          </div>
          <div className="mt-4">{letter.salutation}</div>
          {letter.subject && <div className="mt-3 font-bold text-[#1e4e79]">RE: {letter.subject}</div>}
          {letter.opening && <p className="mt-3">{letter.opening}</p>}
          {paragraphs.map((p, i) => <p key={i} className="mt-3">{p}</p>)}
          {letter.closing && <p className="mt-3">{letter.closing}</p>}
          <div className="mt-4">{letter.signOff}</div>
          <div className="mt-8 font-sans font-bold">{letter.signerName || sender.fullName}</div>
        </>
      )}
    </div>
  );
};

export default LetterPreview;
