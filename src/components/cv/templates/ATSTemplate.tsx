import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { CVData } from '@/types/cv';

const formatDate = (date: string) => {
  if (!date) return '';
  const [year, month] = date.split('-');
  if (!month) return year || '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
};

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: '#000', padding: 36, lineHeight: 1.3 },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  title: { fontSize: 11, marginBottom: 6 },
  contact: { fontSize: 9, marginBottom: 4 },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', borderBottomWidth: 1, borderBottomColor: '#999', paddingBottom: 2, marginBottom: 6, letterSpacing: 0.5 },
  entry: { marginBottom: 8 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  entryTitle: { fontWeight: 'bold' },
  entryDate: { fontSize: 9 },
  entryCompany: { fontSize: 9, fontStyle: 'italic' },
  desc: { marginTop: 2, fontSize: 9.5 },
  skillLine: { marginBottom: 2 },
  langLine: { marginBottom: 2, fontSize: 9.5 },
  projectLine: { marginBottom: 6 },
  projectTitle: { fontWeight: 'bold' },
});

export const ATSTemplate: React.FC<{ data: CVData; showPhoto?: boolean }> = ({ data }) => {
  const p = data.personal;
  const contactParts = [p.email, p.phone, p.location, p.website, p.linkedin, p.address].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{p.fullName || 'Your Name'}</Text>
        <Text style={styles.title}>{p.jobTitle || 'Professional Title'}</Text>
        {contactParts.length > 0 && <Text style={styles.contact}>{contactParts.join('  |  ')}</Text>}

        {p.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.desc}>{p.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {data.experience.map((exp) => (
              <View key={exp.id} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{exp.position}</Text>
                  <Text style={styles.entryDate}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={styles.entryCompany}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</Text>
                {exp.description && <Text style={styles.desc}>{exp.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu) => (
              <View key={edu.id} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</Text>
                  <Text style={styles.entryDate}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</Text>
                </View>
                <Text style={styles.entryCompany}>{edu.institution}{edu.gpa ? `  |  GPA: ${edu.gpa}` : ''}</Text>
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text style={styles.skillLine}>{data.skills.map(s => s.name).filter(Boolean).join(', ')}</Text>
          </View>
        )}

        {data.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            {data.languages.map((lang) => (
              <Text key={lang.id} style={styles.langLine}>{lang.name}: {lang.proficiency}</Text>
            ))}
          </View>
        )}

        {data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((project) => (
              <View key={project.id} style={styles.projectLine}>
                <Text style={styles.projectTitle}>{project.name}</Text>
                {project.url ? <Text style={styles.entryCompany}> {project.url}</Text> : null}
                {project.description ? <Text style={styles.desc}>{project.description}</Text> : null}
                {project.technologies.length > 0 && (
                  <Text style={styles.entryCompany}>Technologies: {project.technologies.join(', ')}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
