import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { CVData } from '@/types/cv';

const EURO = '#1e4e79';

const formatDate = (date: string) => {
  if (!date) return '';
  const [year, month] = date.split('-');
  if (!month) return year || '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
};

const cefrFromProficiency = (proficiency: string, cefr?: string): string => {
  if (cefr) return cefr.toUpperCase();
  switch (proficiency) {
    case 'basic': return 'A1';
    case 'conversational': return 'B1';
    case 'fluent': return 'B2';
    case 'native': return 'C2';
    default: return 'B1';
  }
};

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const GRID_COLUMNS = ['Listening', 'Reading', 'Spoken interaction', 'Spoken production', 'Writing'];

const levelIndex = (level: string) => {
  const idx = CEFR_LEVELS.indexOf(level);
  return idx === -1 ? 1 : idx;
};

const digitalLevelLabel = (level: string) => {
  switch (level) {
    case 'basic': return 'Basic user';
    case 'proficient': return 'Proficient user';
    default: return 'Independent user';
  }
};

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9, color: '#111', padding: 36 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  name: { fontSize: 22, fontWeight: 'bold', color: EURO, marginBottom: 2 },
  section: { marginTop: 12 },
  sectionHeader: {
    backgroundColor: EURO,
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 3,
    paddingHorizontal: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  fieldRow: { flexDirection: 'row', marginBottom: 2 },
  fieldLabel: { width: 90, color: EURO, fontWeight: 'bold', paddingRight: 6 },
  fieldValue: { flex: 1 },
  entry: { marginBottom: 7 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  entryTitle: { fontWeight: 'bold' },
  entryDate: { color: '#555' },
  entrySub: { marginTop: 1 },
  entryDesc: { marginTop: 2, lineHeight: 1.35 },
  photo: { width: 80, height: 100, objectFit: 'cover', borderWidth: 1, borderColor: EURO },
  grid: { borderWidth: 1, borderColor: '#999', marginTop: 4 },
  gridRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc' },
  gridHeadCell: { width: 96, padding: 3, backgroundColor: '#eef2f6', fontWeight: 'bold', fontSize: 7.5, borderRightWidth: 1, borderRightColor: '#ccc', textAlign: 'center' },
  gridLangCell: { width: 96, padding: 3, fontWeight: 'bold', borderRightWidth: 1, borderRightColor: '#ccc' },
  gridLevelCell: { width: 22, padding: 3, fontSize: 8, textAlign: 'center', borderRightWidth: 1, borderRightColor: '#ccc' },
  gridTailCell: { width: 22, padding: 3, fontSize: 8, textAlign: 'center' },
  skillRow: { flexDirection: 'row', marginBottom: 3 },
  skillName: { width: '55%' },
  skillLevel: { flex: 1, color: '#555' },
  bullet: { flexDirection: 'row', marginBottom: 1.5 },
  bulletDot: { width: 8 },
  bulletText: { flex: 1, lineHeight: 1.35 },
});

export const EuropassTemplate: React.FC<{ data: CVData; showPhoto?: boolean }> = ({ data, showPhoto = true }) => {
  const p = data.personal;
  const langs = data.languages || [];
  const digitalSkills = data.digitalSkills || [];
  const certifications = data.certifications || [];
  const interests = data.interests || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.name}>{p.fullName || 'Your Name'}</Text>
            <Text style={{ color: '#444', fontSize: 10, marginTop: 2 }}>{p.jobTitle || 'Professional title'}</Text>
          </View>
          {showPhoto && p.photo && <Image src={p.photo} style={styles.photo} />}
        </View>

        {/* Personal information */}
        {(p.address || p.phone || p.email || p.nationality || p.dateOfBirth || p.gender || p.driverLicense) && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Personal information</Text>
            {p.address && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Address</Text>
                <Text style={styles.fieldValue}>{p.address}, {p.location}</Text>
              </View>
            )}
            {p.phone && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Telephone</Text>
                <Text style={styles.fieldValue}>{p.phone}</Text>
              </View>
            )}
            {p.email && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>E-mail</Text>
                <Text style={styles.fieldValue}>{p.email}</Text>
              </View>
            )}
            {p.website && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Website</Text>
                <Text style={styles.fieldValue}>{p.website}</Text>
              </View>
            )}
            {p.nationality && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Nationality</Text>
                <Text style={styles.fieldValue}>{p.nationality}</Text>
              </View>
            )}
            {p.dateOfBirth && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Date of birth</Text>
                <Text style={styles.fieldValue}>{p.dateOfBirth}</Text>
              </View>
            )}
            {p.gender && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <Text style={styles.fieldValue}>{p.gender}</Text>
              </View>
            )}
          </View>
        )}

        {/* Work experience */}
        {data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Work experience</Text>
            {data.experience.map((exp) => (
              <View key={exp.id} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{exp.position || 'Position'}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={styles.entrySub}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</Text>
                {exp.description && (
                  <View style={styles.entryDesc}>
                    {exp.description.split('\n').filter(Boolean).map((line, i) => (
                      <View key={i} style={styles.bullet}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{line}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Education and training</Text>
            {data.education.map((edu) => (
              <View key={edu.id} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                  </Text>
                  <Text style={styles.entryDate}>
                    {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                  </Text>
                </View>
                <Text style={styles.entrySub}>{edu.institution}</Text>
                {edu.gpa && <Text style={styles.entrySub}>GPA: {edu.gpa}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Personal skills */}
        {(langs.length > 0 || digitalSkills.length > 0 || p.driverLicense || p.summary) && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Personal skills</Text>

            {p.summary && (
              <View style={styles.entry}>
                <Text style={{ ...styles.fieldLabel, width: 90, marginBottom: 2 }}>Summary</Text>
                <Text style={styles.fieldValue}>{p.summary}</Text>
              </View>
            )}

            {langs.length > 0 && (
              <View style={styles.entry}>
                <Text style={styles.fieldLabel}>Languages</Text>
                <View style={styles.grid}>
                  <View style={styles.gridRow}>
                    <Text style={styles.gridHeadCell}>Language</Text>
                    {GRID_COLUMNS.map((col) => (
                      <Text key={col} style={styles.gridHeadCell}>{col}</Text>
                    ))}
                  </View>
                  {langs.map((lang) => {
                    const cefr = cefrFromProficiency(lang.proficiency, lang.cefr);
                    const idx = levelIndex(cefr);
                    return (
                      <View key={lang.id} style={styles.gridRow}>
                        <Text style={styles.gridLangCell}>{lang.name}</Text>
                        {GRID_COLUMNS.map((_, ci) => (
                          <View key={ci} style={{ flexDirection: 'row' }}>
                            {CEFR_LEVELS.map((lvl, li) => (
                              <Text
                                key={lvl}
                                style={li === CEFR_LEVELS.length - 1 ? styles.gridTailCell : styles.gridLevelCell}
                              >
                                {li === idx ? 'X' : ''}
                              </Text>
                            ))}
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </View>
                <Text style={{ fontSize: 7, color: '#777', marginTop: 3 }}>
                  Common European Framework of Reference for Languages (A1–C2): Listening, Reading, Spoken interaction, Spoken production, Writing
                </Text>
              </View>
            )}

            {digitalSkills.length > 0 && (
              <View style={styles.entry}>
                <Text style={styles.fieldLabel}>Digital skills</Text>
                {digitalSkills.map((skill) => (
                  <View key={skill.id} style={styles.skillRow}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillLevel}>{digitalLevelLabel(skill.level)}</Text>
                  </View>
                ))}
              </View>
            )}

            {p.driverLicense && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Driving licence</Text>
                <Text style={styles.fieldValue}>{p.driverLicense}</Text>
              </View>
            )}
          </View>
        )}

        {/* Additional information */}
        {(certifications.length > 0 || interests.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Additional information</Text>
            {certifications.length > 0 && (
              <View style={styles.entry}>
                {certifications.map((cert) => (
                  <View key={cert.id} style={styles.fieldRow}>
                    <Text style={{ ...styles.fieldLabel, width: 90 }}>{cert.year || ''}</Text>
                    <Text style={styles.fieldValue}>
                      {cert.name}{cert.issuer ? ` — ${cert.issuer}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            {interests.length > 0 && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Interests</Text>
                <Text style={styles.fieldValue}>{interests.join(', ')}</Text>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};
