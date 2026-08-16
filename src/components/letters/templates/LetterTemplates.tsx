import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { LetterData } from '@/types/letter';
import { PersonalInfo } from '@/types/cv';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10.5, color: '#111', padding: 54, lineHeight: 1.5 },
  sender: { marginBottom: 16 },
  senderName: { fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
  senderLine: { fontSize: 9.5, color: '#444' },
  date: { marginBottom: 14 },
  recipient: { marginBottom: 16 },
  salutation: { marginBottom: 12 },
  subject: { fontWeight: 'bold', marginBottom: 12, color: '#1e4e79' },
  paragraph: { marginBottom: 10, textAlign: 'justify' },
  closing: { marginTop: 8 },
  signature: { marginTop: 34 },
  signatureName: { fontWeight: 'bold', fontSize: 12 },
  titleBar: {
    backgroundColor: '#1e4e79',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  titleBarText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  motivationSubject: {
    fontWeight: 'bold',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e4e79',
    paddingBottom: 4,
  },
});

interface LetterPdfProps {
  letter: LetterData;
  sender: PersonalInfo;
}

const LetterPdf: React.FC<LetterPdfProps> = ({ letter, sender }) => {
  const paragraphs = letter.body.split(/\n\s*\n/).filter(Boolean);
  const senderAddress = [sender.address, sender.location].filter(Boolean).join(', ');
  const senderContact = [sender.phone, sender.email, sender.website].filter(Boolean).join('  ·  ');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {letter.style === 'motivation' ? (
          <>
            <View style={styles.titleBar}>
              <Text style={styles.titleBarText}>MOTIVATION LETTER</Text>
            </View>
            <Text style={styles.senderName}>{sender.fullName || letter.signerName}</Text>
            {senderAddress ? <Text style={styles.senderLine}>{senderAddress}</Text> : null}
            {senderContact ? <Text style={styles.senderLine}>{senderContact}</Text> : null}

            <View style={styles.date}>
              <Text style={styles.senderLine}>{letter.date}</Text>
            </View>

            {letter.company ? (
              <View style={styles.recipient}>
                <Text style={styles.senderLine}>{letter.recipientName || letter.recipientTitle}</Text>
                <Text style={styles.senderLine}>{letter.company}</Text>
                {letter.companyAddress ? <Text style={styles.senderLine}>{letter.companyAddress}</Text> : null}
              </View>
            ) : null}

            {letter.subject ? <Text style={styles.motivationSubject}>{letter.subject}</Text> : null}
            <Text style={styles.salutation}>{letter.salutation}</Text>
            {letter.opening ? <Text style={styles.paragraph}>{letter.opening}</Text> : null}
            {paragraphs.map((p, i) => (
              <Text key={i} style={styles.paragraph}>{p}</Text>
            ))}
            {letter.closing ? <Text style={styles.paragraph}>{letter.closing}</Text> : null}
            <Text style={styles.closing}>{letter.signOff}</Text>
            <View style={styles.signature}>
              <Text style={styles.signatureName}>{letter.signerName || sender.fullName}</Text>
              {sender.email ? <Text style={styles.senderLine}>{sender.email}</Text> : null}
            </View>
          </>
        ) : (
          <>
            {/* US cover letter: sender block on top */}
            <Text style={styles.senderName}>{sender.fullName || letter.signerName}</Text>
            {senderAddress ? <Text style={styles.senderLine}>{senderAddress}</Text> : null}
            {senderContact ? <Text style={styles.senderLine}>{senderContact}</Text> : null}

            <View style={styles.date}>
              <Text>{letter.date}</Text>
            </View>

            <View style={styles.recipient}>
              <Text>{letter.recipientName || letter.recipientTitle}</Text>
              <Text>{letter.company}</Text>
              {letter.companyAddress ? <Text>{letter.companyAddress}</Text> : null}
            </View>

            <Text style={styles.salutation}>{letter.salutation}</Text>
            {letter.subject ? <Text style={styles.subject}>RE: {letter.subject}</Text> : null}
            {letter.opening ? <Text style={styles.paragraph}>{letter.opening}</Text> : null}
            {paragraphs.map((p, i) => (
              <Text key={i} style={styles.paragraph}>{p}</Text>
            ))}
            {letter.closing ? <Text style={styles.paragraph}>{letter.closing}</Text> : null}
            <Text style={styles.closing}>{letter.signOff}</Text>
            <View style={styles.signature}>
              <Text style={styles.signatureName}>{letter.signerName || sender.fullName}</Text>
            </View>
          </>
        )}
      </Page>
    </Document>
  );
};

export default LetterPdf;
