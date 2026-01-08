import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { CVData } from '@/types/cv';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ]
});

const formatDate = (date: string) => {
  if (!date) return '';
  const [year, month] = date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
};

// Classic Template Styles
const classicStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { textAlign: 'center', marginBottom: 20, borderBottom: '2px solid #1a365d', paddingBottom: 15 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1a365d', marginBottom: 5 },
  jobTitle: { fontSize: 14, color: '#4a5568', marginBottom: 8 },
  contact: { flexDirection: 'row', justifyContent: 'center', gap: 15, fontSize: 9, color: '#4a5568' },
  contactItem: { marginHorizontal: 8 },
  section: { marginTop: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#1a365d', borderBottom: '1px solid #e2e8f0', paddingBottom: 5, marginBottom: 10 },
  summary: { lineHeight: 1.5, color: '#4a5568' },
  experienceItem: { marginBottom: 12 },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  expTitle: { fontWeight: 'bold', fontSize: 11 },
  expCompany: { color: '#2d3748' },
  expDate: { fontSize: 9, color: '#718096' },
  expDesc: { marginTop: 5, lineHeight: 1.4, color: '#4a5568' },
  eduItem: { marginBottom: 10 },
  eduHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  skillItem: { backgroundColor: '#edf2f7', padding: '4 8', borderRadius: 3, fontSize: 9 },
  langItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  projectItem: { marginBottom: 10 },
  projectName: { fontWeight: 'bold', fontSize: 11 },
  projectUrl: { fontSize: 8, color: '#3182ce' },
  techTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 3 },
  techTag: { backgroundColor: '#e6fffa', padding: '2 5', borderRadius: 2, fontSize: 8, color: '#234e52' },
});

// Modern Template Styles  
const modernStyles = StyleSheet.create({
  page: { flexDirection: 'row', fontFamily: 'Helvetica', fontSize: 10 },
  sidebar: { width: '35%', backgroundColor: '#1a365d', padding: 25, color: '#fff' },
  main: { width: '65%', padding: 30, backgroundColor: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  jobTitle: { fontSize: 12, color: '#90cdf4', marginBottom: 20 },
  sideSection: { marginBottom: 20 },
  sideSectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#90cdf4', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  contactItem: { fontSize: 9, marginBottom: 5, color: '#e2e8f0' },
  skillItem: { backgroundColor: 'rgba(255,255,255,0.1)', padding: '4 8', borderRadius: 3, fontSize: 9, marginBottom: 4 },
  langItem: { marginBottom: 5, fontSize: 9 },
  langLevel: { color: '#90cdf4', fontSize: 8 },
  mainSection: { marginBottom: 18 },
  mainSectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#1a365d', borderBottom: '2px solid #3182ce', paddingBottom: 5, marginBottom: 10 },
  summary: { lineHeight: 1.5, color: '#4a5568', marginBottom: 5 },
  experienceItem: { marginBottom: 12 },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  expTitle: { fontWeight: 'bold', fontSize: 11, color: '#2d3748' },
  expCompany: { color: '#3182ce', fontSize: 10 },
  expDate: { fontSize: 9, color: '#718096' },
  expLocation: { fontSize: 9, color: '#a0aec0' },
  expDesc: { marginTop: 4, lineHeight: 1.4, color: '#4a5568', fontSize: 9 },
  eduItem: { marginBottom: 10 },
  projectItem: { marginBottom: 10 },
  projectName: { fontWeight: 'bold', fontSize: 11, color: '#2d3748' },
  projectUrl: { fontSize: 8, color: '#3182ce' },
  techTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 3 },
  techTag: { backgroundColor: '#ebf8ff', padding: '2 5', borderRadius: 2, fontSize: 8, color: '#2b6cb0' },
});

// Minimal Template Styles
const minimalStyles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' },
  header: { marginBottom: 30 },
  name: { fontSize: 28, fontWeight: 'bold', letterSpacing: 1, marginBottom: 5 },
  jobTitle: { fontSize: 12, color: '#666', letterSpacing: 0.5 },
  contact: { flexDirection: 'row', marginTop: 10, fontSize: 9, color: '#666' },
  contactItem: { marginRight: 15 },
  section: { marginTop: 25 },
  sectionTitle: { fontSize: 9, fontWeight: 'bold', color: '#999', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 },
  summary: { lineHeight: 1.6, color: '#333' },
  experienceItem: { marginBottom: 15 },
  expTitle: { fontWeight: 'bold', fontSize: 11 },
  expMeta: { fontSize: 9, color: '#666', marginTop: 2 },
  expDesc: { marginTop: 5, lineHeight: 1.5, color: '#444' },
  eduItem: { marginBottom: 10 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillItem: { fontSize: 9, color: '#333' },
  langItem: { fontSize: 9, color: '#333', marginBottom: 4 },
  projectItem: { marginBottom: 12 },
  projectName: { fontWeight: 'bold', fontSize: 11 },
  techTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 3 },
  techTag: { fontSize: 8, color: '#666' },
});

// Creative Template Styles
const creativeStyles = StyleSheet.create({
  page: { padding: 0, fontFamily: 'Helvetica', fontSize: 10 },
  header: { backgroundColor: '#319795', padding: 30, color: '#fff' },
  name: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  jobTitle: { fontSize: 14, color: '#b2f5ea', marginBottom: 15 },
  contact: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, fontSize: 9, color: '#e6fffa' },
  body: { padding: 30 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#319795', marginBottom: 10, paddingBottom: 5, borderBottom: '3px solid #81e6d9' },
  summary: { lineHeight: 1.5, color: '#2d3748' },
  experienceItem: { marginBottom: 15, paddingLeft: 10, borderLeft: '3px solid #319795' },
  expTitle: { fontWeight: 'bold', fontSize: 12, color: '#234e52' },
  expCompany: { color: '#319795', fontSize: 10 },
  expMeta: { fontSize: 9, color: '#718096', marginTop: 2 },
  expDesc: { marginTop: 5, lineHeight: 1.4, color: '#4a5568' },
  eduItem: { marginBottom: 12, paddingLeft: 10, borderLeft: '3px solid #81e6d9' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillItem: { backgroundColor: '#319795', color: '#fff', padding: '5 10', borderRadius: 15, fontSize: 9 },
  langItem: { backgroundColor: '#e6fffa', padding: '4 8', borderRadius: 3, marginBottom: 5, fontSize: 9 },
  projectItem: { marginBottom: 12, padding: 10, backgroundColor: '#f0fff4', borderRadius: 5 },
  projectName: { fontWeight: 'bold', fontSize: 11, color: '#234e52' },
  techTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 5 },
  techTag: { backgroundColor: '#319795', color: '#fff', padding: '2 6', borderRadius: 10, fontSize: 8 },
});

// Professional Template Styles
const professionalStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#2d3748' },
  header: { marginBottom: 20, paddingBottom: 15, borderBottom: '1px solid #cbd5e0' },
  name: { fontSize: 26, fontWeight: 'bold', color: '#1a202c', marginBottom: 3 },
  jobTitle: { fontSize: 13, color: '#4a5568', marginBottom: 10 },
  contact: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, fontSize: 9, color: '#718096' },
  twoColumn: { flexDirection: 'row', marginTop: 15 },
  mainColumn: { width: '65%', paddingRight: 20 },
  sideColumn: { width: '35%', paddingLeft: 15, borderLeft: '1px solid #e2e8f0' },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#2b6cb0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  summary: { lineHeight: 1.5, color: '#4a5568' },
  experienceItem: { marginBottom: 12 },
  expTitle: { fontWeight: 'bold', fontSize: 11, color: '#1a202c' },
  expCompany: { color: '#2b6cb0', fontSize: 10, marginTop: 1 },
  expMeta: { fontSize: 9, color: '#a0aec0', marginTop: 2 },
  expDesc: { marginTop: 4, lineHeight: 1.4, color: '#4a5568', fontSize: 9 },
  eduItem: { marginBottom: 10 },
  skillItem: { marginBottom: 6 },
  skillName: { fontSize: 9, fontWeight: 'bold' },
  skillBar: { height: 4, backgroundColor: '#e2e8f0', marginTop: 3, borderRadius: 2 },
  skillFill: { height: 4, backgroundColor: '#2b6cb0', borderRadius: 2 },
  langItem: { marginBottom: 6, fontSize: 9 },
  projectItem: { marginBottom: 10 },
  projectName: { fontWeight: 'bold', fontSize: 10 },
  techTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 3 },
  techTag: { backgroundColor: '#ebf8ff', padding: '2 5', borderRadius: 2, fontSize: 8, color: '#2b6cb0' },
});

// Executive Template Styles
const executiveStyles = StyleSheet.create({
  page: { padding: 45, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' },
  header: { marginBottom: 25, textAlign: 'center' },
  name: { fontSize: 30, fontWeight: 'bold', letterSpacing: 2, color: '#1a1a1a', marginBottom: 5 },
  divider: { width: 50, height: 2, backgroundColor: '#c9a227', marginHorizontal: 'auto', marginVertical: 10 },
  jobTitle: { fontSize: 12, color: '#666', letterSpacing: 1 },
  contact: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 15, fontSize: 9, color: '#666' },
  section: { marginTop: 22 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#1a1a1a', letterSpacing: 1, paddingBottom: 8, borderBottom: '1px solid #c9a227', marginBottom: 12 },
  summary: { lineHeight: 1.6, color: '#333', textAlign: 'center', fontStyle: 'italic' },
  experienceItem: { marginBottom: 15 },
  expHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  expTitle: { fontWeight: 'bold', fontSize: 11, color: '#1a1a1a' },
  expDate: { fontSize: 9, color: '#999' },
  expCompany: { color: '#c9a227', fontSize: 10, marginTop: 2 },
  expDesc: { marginTop: 6, lineHeight: 1.5, color: '#444' },
  eduItem: { marginBottom: 12 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skillItem: { fontSize: 9, color: '#333', paddingVertical: 3 },
  langItem: { fontSize: 9, color: '#333', marginBottom: 5 },
  projectItem: { marginBottom: 12 },
  projectName: { fontWeight: 'bold', fontSize: 11 },
  techTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  techTag: { fontSize: 8, color: '#666' },
});

// Tech Template Styles
const techStyles = StyleSheet.create({
  page: { padding: 35, fontFamily: 'Helvetica', fontSize: 10, backgroundColor: '#0d1117', color: '#c9d1d9' },
  header: { marginBottom: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#58a6ff', marginBottom: 3 },
  jobTitle: { fontSize: 12, color: '#8b949e', marginBottom: 10 },
  contact: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, fontSize: 9, color: '#8b949e' },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#58a6ff', marginBottom: 10, paddingBottom: 5, borderBottom: '1px solid #30363d' },
  summary: { lineHeight: 1.5, color: '#c9d1d9' },
  experienceItem: { marginBottom: 12, padding: 10, backgroundColor: '#161b22', borderRadius: 6, border: '1px solid #30363d' },
  expTitle: { fontWeight: 'bold', fontSize: 11, color: '#c9d1d9' },
  expCompany: { color: '#58a6ff', fontSize: 10 },
  expMeta: { fontSize: 9, color: '#8b949e', marginTop: 2 },
  expDesc: { marginTop: 5, lineHeight: 1.4, color: '#8b949e' },
  eduItem: { marginBottom: 10, padding: 8, backgroundColor: '#161b22', borderRadius: 4 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillItem: { backgroundColor: '#238636', color: '#fff', padding: '4 8', borderRadius: 12, fontSize: 9 },
  langItem: { backgroundColor: '#30363d', padding: '4 8', borderRadius: 4, marginBottom: 5, fontSize: 9 },
  projectItem: { marginBottom: 12, padding: 10, backgroundColor: '#161b22', borderRadius: 6, border: '1px solid #30363d' },
  projectName: { fontWeight: 'bold', fontSize: 11, color: '#58a6ff' },
  projectUrl: { fontSize: 8, color: '#8b949e' },
  techTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 5 },
  techTag: { backgroundColor: '#388bfd26', color: '#58a6ff', padding: '2 6', borderRadius: 12, fontSize: 8 },
});

// Compact Template Styles
const compactStyles = StyleSheet.create({
  page: { padding: 25, fontFamily: 'Helvetica', fontSize: 8, color: '#333' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #ddd' },
  headerLeft: {},
  headerRight: { textAlign: 'right' },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  jobTitle: { fontSize: 10, color: '#666' },
  contactItem: { fontSize: 7, color: '#666', marginTop: 2 },
  twoColumn: { flexDirection: 'row' },
  leftColumn: { width: '68%', paddingRight: 10 },
  rightColumn: { width: '32%', paddingLeft: 10, borderLeft: '1px solid #eee' },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 9, fontWeight: 'bold', color: '#2563eb', marginBottom: 5, textTransform: 'uppercase' },
  summary: { lineHeight: 1.4, color: '#444', fontSize: 8 },
  experienceItem: { marginBottom: 8 },
  expTitle: { fontWeight: 'bold', fontSize: 9 },
  expMeta: { fontSize: 7, color: '#888' },
  expDesc: { marginTop: 2, lineHeight: 1.3, color: '#555', fontSize: 7 },
  eduItem: { marginBottom: 6 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  skillItem: { backgroundColor: '#f0f0f0', padding: '2 4', borderRadius: 2, fontSize: 7 },
  langItem: { fontSize: 7, marginBottom: 3 },
  projectItem: { marginBottom: 6 },
  projectName: { fontWeight: 'bold', fontSize: 8 },
  techTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, marginTop: 2 },
  techTag: { fontSize: 6, color: '#666' },
});

// Elegant Template Styles
const elegantStyles = StyleSheet.create({
  page: { padding: 45, fontFamily: 'Helvetica', fontSize: 10, color: '#2d3748' },
  header: { marginBottom: 25, borderBottom: '1px solid #e8e0d5', paddingBottom: 20 },
  name: { fontSize: 28, fontWeight: 'bold', color: '#744210', letterSpacing: 1, marginBottom: 5 },
  jobTitle: { fontSize: 13, color: '#975a16', marginBottom: 12 },
  contact: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, fontSize: 9, color: '#718096' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#744210', marginBottom: 12, paddingLeft: 10, borderLeft: '3px solid #d69e2e' },
  summary: { lineHeight: 1.6, color: '#4a5568', fontStyle: 'italic' },
  experienceItem: { marginBottom: 15 },
  expTitle: { fontWeight: 'bold', fontSize: 11, color: '#2d3748' },
  expCompany: { color: '#975a16', fontSize: 10 },
  expMeta: { fontSize: 9, color: '#a0aec0', marginTop: 3 },
  expDesc: { marginTop: 5, lineHeight: 1.5, color: '#4a5568' },
  eduItem: { marginBottom: 12 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillItem: { borderBottom: '1px solid #d69e2e', paddingBottom: 2, fontSize: 9 },
  langItem: { fontSize: 9, marginBottom: 5, color: '#4a5568' },
  projectItem: { marginBottom: 12 },
  projectName: { fontWeight: 'bold', fontSize: 11, color: '#744210' },
  techTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 4 },
  techTag: { backgroundColor: '#fffff0', border: '1px solid #d69e2e', padding: '2 6', borderRadius: 3, fontSize: 8, color: '#744210' },
});

// Bold Template Styles
const boldStyles = StyleSheet.create({
  page: { padding: 35, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' },
  header: { marginBottom: 20 },
  name: { fontSize: 36, fontWeight: 'bold', color: '#e53e3e', letterSpacing: -1, marginBottom: 0 },
  jobTitle: { fontSize: 14, fontWeight: 'bold', color: '#2d3748', marginBottom: 10 },
  contact: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, fontSize: 9, color: '#718096' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#e53e3e', marginBottom: 12, textTransform: 'uppercase' },
  summary: { lineHeight: 1.5, color: '#4a5568', fontSize: 11 },
  experienceItem: { marginBottom: 15 },
  expTitle: { fontWeight: 'bold', fontSize: 13, color: '#1a1a1a' },
  expCompany: { color: '#e53e3e', fontSize: 11, fontWeight: 'bold' },
  expMeta: { fontSize: 9, color: '#a0aec0', marginTop: 2 },
  expDesc: { marginTop: 5, lineHeight: 1.4, color: '#4a5568' },
  eduItem: { marginBottom: 12 },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  skillItem: { backgroundColor: '#e53e3e', color: '#fff', padding: '5 12', borderRadius: 0, fontSize: 9, fontWeight: 'bold' },
  langItem: { fontSize: 10, marginBottom: 5, fontWeight: 'bold' },
  projectItem: { marginBottom: 12 },
  projectName: { fontWeight: 'bold', fontSize: 12, color: '#1a1a1a' },
  techTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 4 },
  techTag: { backgroundColor: '#1a1a1a', color: '#fff', padding: '2 8', fontSize: 8 },
});

// Template Components
export const ClassicTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={classicStyles.page}>
      <View style={classicStyles.header}>
        <Text style={classicStyles.name}>{data.personal.fullName || 'Your Name'}</Text>
        <Text style={classicStyles.jobTitle}>{data.personal.jobTitle || 'Professional Title'}</Text>
        <View style={classicStyles.contact}>
          {data.personal.email && <Text style={classicStyles.contactItem}>{data.personal.email}</Text>}
          {data.personal.phone && <Text style={classicStyles.contactItem}>{data.personal.phone}</Text>}
          {data.personal.location && <Text style={classicStyles.contactItem}>{data.personal.location}</Text>}
        </View>
      </View>

      {data.personal.summary && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Professional Summary</Text>
          <Text style={classicStyles.summary}>{data.personal.summary}</Text>
        </View>
      )}

      {data.experience.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Work Experience</Text>
          {data.experience.map((exp) => (
            <View key={exp.id} style={classicStyles.experienceItem}>
              <View style={classicStyles.expHeader}>
                <Text style={classicStyles.expTitle}>{exp.position}</Text>
                <Text style={classicStyles.expDate}>
                  {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                </Text>
              </View>
              <Text style={classicStyles.expCompany}>{exp.company} • {exp.location}</Text>
              <Text style={classicStyles.expDesc}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {data.education.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Education</Text>
          {data.education.map((edu) => (
            <View key={edu.id} style={classicStyles.eduItem}>
              <View style={classicStyles.eduHeader}>
                <Text style={classicStyles.expTitle}>{edu.degree} in {edu.field}</Text>
                <Text style={classicStyles.expDate}>{formatDate(edu.endDate)}</Text>
              </View>
              <Text style={classicStyles.expCompany}>{edu.institution}</Text>
            </View>
          ))}
        </View>
      )}

      {data.skills.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Skills</Text>
          <View style={classicStyles.skillsContainer}>
            {data.skills.map((skill) => (
              <Text key={skill.id} style={classicStyles.skillItem}>{skill.name}</Text>
            ))}
          </View>
        </View>
      )}

      {data.languages.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Languages</Text>
          {data.languages.map((lang) => (
            <View key={lang.id} style={classicStyles.langItem}>
              <Text>{lang.name} - {lang.proficiency}</Text>
            </View>
          ))}
        </View>
      )}

      {data.projects.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Projects</Text>
          {data.projects.map((project) => (
            <View key={project.id} style={classicStyles.projectItem}>
              <Text style={classicStyles.projectName}>{project.name}</Text>
              {project.url && <Text style={classicStyles.projectUrl}>{project.url}</Text>}
              <Text style={classicStyles.expDesc}>{project.description}</Text>
              <View style={classicStyles.techTags}>
                {project.technologies.map((tech, i) => (
                  <Text key={i} style={classicStyles.techTag}>{tech}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export const ModernTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={modernStyles.page}>
      <View style={modernStyles.sidebar}>
        <Text style={modernStyles.name}>{data.personal.fullName || 'Your Name'}</Text>
        <Text style={modernStyles.jobTitle}>{data.personal.jobTitle || 'Professional Title'}</Text>
        
        <View style={modernStyles.sideSection}>
          <Text style={modernStyles.sideSectionTitle}>Contact</Text>
          {data.personal.email && <Text style={modernStyles.contactItem}>{data.personal.email}</Text>}
          {data.personal.phone && <Text style={modernStyles.contactItem}>{data.personal.phone}</Text>}
          {data.personal.location && <Text style={modernStyles.contactItem}>{data.personal.location}</Text>}
          {data.personal.website && <Text style={modernStyles.contactItem}>{data.personal.website}</Text>}
          {data.personal.linkedin && <Text style={modernStyles.contactItem}>{data.personal.linkedin}</Text>}
        </View>

        {data.skills.length > 0 && (
          <View style={modernStyles.sideSection}>
            <Text style={modernStyles.sideSectionTitle}>Skills</Text>
            {data.skills.map((skill) => (
              <Text key={skill.id} style={modernStyles.skillItem}>{skill.name}</Text>
            ))}
          </View>
        )}

        {data.languages.length > 0 && (
          <View style={modernStyles.sideSection}>
            <Text style={modernStyles.sideSectionTitle}>Languages</Text>
            {data.languages.map((lang) => (
              <View key={lang.id} style={modernStyles.langItem}>
                <Text>{lang.name}</Text>
                <Text style={modernStyles.langLevel}>{lang.proficiency}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={modernStyles.main}>
        {data.personal.summary && (
          <View style={modernStyles.mainSection}>
            <Text style={modernStyles.mainSectionTitle}>Profile</Text>
            <Text style={modernStyles.summary}>{data.personal.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={modernStyles.mainSection}>
            <Text style={modernStyles.mainSectionTitle}>Experience</Text>
            {data.experience.map((exp) => (
              <View key={exp.id} style={modernStyles.experienceItem}>
                <View style={modernStyles.expHeader}>
                  <Text style={modernStyles.expTitle}>{exp.position}</Text>
                  <Text style={modernStyles.expDate}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={modernStyles.expCompany}>{exp.company}</Text>
                <Text style={modernStyles.expLocation}>{exp.location}</Text>
                <Text style={modernStyles.expDesc}>{exp.description}</Text>
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={modernStyles.mainSection}>
            <Text style={modernStyles.mainSectionTitle}>Education</Text>
            {data.education.map((edu) => (
              <View key={edu.id} style={modernStyles.eduItem}>
                <Text style={modernStyles.expTitle}>{edu.degree} in {edu.field}</Text>
                <Text style={modernStyles.expCompany}>{edu.institution}</Text>
                <Text style={modernStyles.expDate}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</Text>
              </View>
            ))}
          </View>
        )}

        {data.projects.length > 0 && (
          <View style={modernStyles.mainSection}>
            <Text style={modernStyles.mainSectionTitle}>Projects</Text>
            {data.projects.map((project) => (
              <View key={project.id} style={modernStyles.projectItem}>
                <Text style={modernStyles.projectName}>{project.name}</Text>
                {project.url && <Text style={modernStyles.projectUrl}>{project.url}</Text>}
                <Text style={modernStyles.expDesc}>{project.description}</Text>
                <View style={modernStyles.techTags}>
                  {project.technologies.map((tech, i) => (
                    <Text key={i} style={modernStyles.techTag}>{tech}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  </Document>
);

export const MinimalTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={minimalStyles.page}>
      <View style={minimalStyles.header}>
        <Text style={minimalStyles.name}>{data.personal.fullName || 'Your Name'}</Text>
        <Text style={minimalStyles.jobTitle}>{data.personal.jobTitle || 'Professional Title'}</Text>
        <View style={minimalStyles.contact}>
          {data.personal.email && <Text style={minimalStyles.contactItem}>{data.personal.email}</Text>}
          {data.personal.phone && <Text style={minimalStyles.contactItem}>{data.personal.phone}</Text>}
          {data.personal.location && <Text style={minimalStyles.contactItem}>{data.personal.location}</Text>}
        </View>
      </View>

      {data.personal.summary && (
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>About</Text>
          <Text style={minimalStyles.summary}>{data.personal.summary}</Text>
        </View>
      )}

      {data.experience.length > 0 && (
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Experience</Text>
          {data.experience.map((exp) => (
            <View key={exp.id} style={minimalStyles.experienceItem}>
              <Text style={minimalStyles.expTitle}>{exp.position} at {exp.company}</Text>
              <Text style={minimalStyles.expMeta}>
                {exp.location} • {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
              </Text>
              <Text style={minimalStyles.expDesc}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {data.education.length > 0 && (
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Education</Text>
          {data.education.map((edu) => (
            <View key={edu.id} style={minimalStyles.eduItem}>
              <Text style={minimalStyles.expTitle}>{edu.degree} in {edu.field}</Text>
              <Text style={minimalStyles.expMeta}>{edu.institution} • {formatDate(edu.endDate)}</Text>
            </View>
          ))}
        </View>
      )}

      {data.skills.length > 0 && (
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Skills</Text>
          <View style={minimalStyles.skillsContainer}>
            {data.skills.map((skill, i) => (
              <Text key={skill.id} style={minimalStyles.skillItem}>
                {skill.name}{i < data.skills.length - 1 ? ' •' : ''}
              </Text>
            ))}
          </View>
        </View>
      )}

      {data.languages.length > 0 && (
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Languages</Text>
          {data.languages.map((lang) => (
            <Text key={lang.id} style={minimalStyles.langItem}>{lang.name} — {lang.proficiency}</Text>
          ))}
        </View>
      )}

      {data.projects.length > 0 && (
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Projects</Text>
          {data.projects.map((project) => (
            <View key={project.id} style={minimalStyles.projectItem}>
              <Text style={minimalStyles.projectName}>{project.name}</Text>
              <Text style={minimalStyles.expDesc}>{project.description}</Text>
              <View style={minimalStyles.techTags}>
                {project.technologies.map((tech, i) => (
                  <Text key={i} style={minimalStyles.techTag}>
                    {tech}{i < project.technologies.length - 1 ? ' •' : ''}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export const CreativeTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={creativeStyles.page}>
      <View style={creativeStyles.header}>
        <Text style={creativeStyles.name}>{data.personal.fullName || 'Your Name'}</Text>
        <Text style={creativeStyles.jobTitle}>{data.personal.jobTitle || 'Professional Title'}</Text>
        <View style={creativeStyles.contact}>
          {data.personal.email && <Text>{data.personal.email}</Text>}
          {data.personal.phone && <Text>{data.personal.phone}</Text>}
          {data.personal.location && <Text>{data.personal.location}</Text>}
        </View>
      </View>

      <View style={creativeStyles.body}>
        {data.personal.summary && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>About Me</Text>
            <Text style={creativeStyles.summary}>{data.personal.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>Experience</Text>
            {data.experience.map((exp) => (
              <View key={exp.id} style={creativeStyles.experienceItem}>
                <Text style={creativeStyles.expTitle}>{exp.position}</Text>
                <Text style={creativeStyles.expCompany}>{exp.company}</Text>
                <Text style={creativeStyles.expMeta}>
                  {exp.location} | {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                </Text>
                <Text style={creativeStyles.expDesc}>{exp.description}</Text>
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>Education</Text>
            {data.education.map((edu) => (
              <View key={edu.id} style={creativeStyles.eduItem}>
                <Text style={creativeStyles.expTitle}>{edu.degree} in {edu.field}</Text>
                <Text style={creativeStyles.expCompany}>{edu.institution}</Text>
                <Text style={creativeStyles.expMeta}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</Text>
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>Skills</Text>
            <View style={creativeStyles.skillsContainer}>
              {data.skills.map((skill) => (
                <Text key={skill.id} style={creativeStyles.skillItem}>{skill.name}</Text>
              ))}
            </View>
          </View>
        )}

        {data.languages.length > 0 && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>Languages</Text>
            {data.languages.map((lang) => (
              <Text key={lang.id} style={creativeStyles.langItem}>{lang.name} — {lang.proficiency}</Text>
            ))}
          </View>
        )}

        {data.projects.length > 0 && (
          <View style={creativeStyles.section}>
            <Text style={creativeStyles.sectionTitle}>Projects</Text>
            {data.projects.map((project) => (
              <View key={project.id} style={creativeStyles.projectItem}>
                <Text style={creativeStyles.projectName}>{project.name}</Text>
                <Text style={creativeStyles.expDesc}>{project.description}</Text>
                <View style={creativeStyles.techTags}>
                  {project.technologies.map((tech, i) => (
                    <Text key={i} style={creativeStyles.techTag}>{tech}</Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  </Document>
);

export const ProfessionalTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={professionalStyles.page}>
      <View style={professionalStyles.header}>
        <Text style={professionalStyles.name}>{data.personal.fullName || 'Your Name'}</Text>
        <Text style={professionalStyles.jobTitle}>{data.personal.jobTitle || 'Professional Title'}</Text>
        <View style={professionalStyles.contact}>
          {data.personal.email && <Text>{data.personal.email}</Text>}
          {data.personal.phone && <Text>{data.personal.phone}</Text>}
          {data.personal.location && <Text>{data.personal.location}</Text>}
          {data.personal.linkedin && <Text>{data.personal.linkedin}</Text>}
        </View>
      </View>

      {data.personal.summary && (
        <View style={professionalStyles.section}>
          <Text style={professionalStyles.sectionTitle}>Professional Summary</Text>
          <Text style={professionalStyles.summary}>{data.personal.summary}</Text>
        </View>
      )}

      <View style={professionalStyles.twoColumn}>
        <View style={professionalStyles.mainColumn}>
          {data.experience.length > 0 && (
            <View style={professionalStyles.section}>
              <Text style={professionalStyles.sectionTitle}>Experience</Text>
              {data.experience.map((exp) => (
                <View key={exp.id} style={professionalStyles.experienceItem}>
                  <Text style={professionalStyles.expTitle}>{exp.position}</Text>
                  <Text style={professionalStyles.expCompany}>{exp.company}</Text>
                  <Text style={professionalStyles.expMeta}>
                    {exp.location} | {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </Text>
                  <Text style={professionalStyles.expDesc}>{exp.description}</Text>
                </View>
              ))}
            </View>
          )}

          {data.projects.length > 0 && (
            <View style={professionalStyles.section}>
              <Text style={professionalStyles.sectionTitle}>Projects</Text>
              {data.projects.map((project) => (
                <View key={project.id} style={professionalStyles.projectItem}>
                  <Text style={professionalStyles.projectName}>{project.name}</Text>
                  <Text style={professionalStyles.expDesc}>{project.description}</Text>
                  <View style={professionalStyles.techTags}>
                    {project.technologies.map((tech, i) => (
                      <Text key={i} style={professionalStyles.techTag}>{tech}</Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={professionalStyles.sideColumn}>
          {data.education.length > 0 && (
            <View style={professionalStyles.section}>
              <Text style={professionalStyles.sectionTitle}>Education</Text>
              {data.education.map((edu) => (
                <View key={edu.id} style={professionalStyles.eduItem}>
                  <Text style={professionalStyles.expTitle}>{edu.degree}</Text>
                  <Text>{edu.field}</Text>
                  <Text style={professionalStyles.expMeta}>{edu.institution}</Text>
                  <Text style={professionalStyles.expMeta}>{formatDate(edu.endDate)}</Text>
                </View>
              ))}
            </View>
          )}

          {data.skills.length > 0 && (
            <View style={professionalStyles.section}>
              <Text style={professionalStyles.sectionTitle}>Skills</Text>
              {data.skills.map((skill) => (
                <View key={skill.id} style={professionalStyles.skillItem}>
                  <Text style={professionalStyles.skillName}>{skill.name}</Text>
                  <View style={professionalStyles.skillBar}>
                    <View style={{
                      ...professionalStyles.skillFill,
                      width: skill.level === 'expert' ? '100%' : skill.level === 'advanced' ? '75%' : skill.level === 'intermediate' ? '50%' : '25%'
                    }} />
                  </View>
                </View>
              ))}
            </View>
          )}

          {data.languages.length > 0 && (
            <View style={professionalStyles.section}>
              <Text style={professionalStyles.sectionTitle}>Languages</Text>
              {data.languages.map((lang) => (
                <Text key={lang.id} style={professionalStyles.langItem}>{lang.name} — {lang.proficiency}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </Page>
  </Document>
);

export const ExecutiveTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={executiveStyles.page}>
      <View style={executiveStyles.header}>
        <Text style={executiveStyles.name}>{(data.personal.fullName || 'Your Name').toUpperCase()}</Text>
        <View style={executiveStyles.divider} />
        <Text style={executiveStyles.jobTitle}>{data.personal.jobTitle || 'Professional Title'}</Text>
        <View style={executiveStyles.contact}>
          {data.personal.email && <Text>{data.personal.email}</Text>}
          {data.personal.phone && <Text>{data.personal.phone}</Text>}
          {data.personal.location && <Text>{data.personal.location}</Text>}
        </View>
      </View>

      {data.personal.summary && (
        <View style={executiveStyles.section}>
          <Text style={executiveStyles.sectionTitle}>Executive Summary</Text>
          <Text style={executiveStyles.summary}>{data.personal.summary}</Text>
        </View>
      )}

      {data.experience.length > 0 && (
        <View style={executiveStyles.section}>
          <Text style={executiveStyles.sectionTitle}>Professional Experience</Text>
          {data.experience.map((exp) => (
            <View key={exp.id} style={executiveStyles.experienceItem}>
              <View style={executiveStyles.expHeader}>
                <Text style={executiveStyles.expTitle}>{exp.position}</Text>
                <Text style={executiveStyles.expDate}>
                  {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                </Text>
              </View>
              <Text style={executiveStyles.expCompany}>{exp.company} • {exp.location}</Text>
              <Text style={executiveStyles.expDesc}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {data.education.length > 0 && (
        <View style={executiveStyles.section}>
          <Text style={executiveStyles.sectionTitle}>Education</Text>
          {data.education.map((edu) => (
            <View key={edu.id} style={executiveStyles.eduItem}>
              <Text style={executiveStyles.expTitle}>{edu.degree} in {edu.field}</Text>
              <Text style={executiveStyles.expCompany}>{edu.institution}</Text>
            </View>
          ))}
        </View>
      )}

      {data.skills.length > 0 && (
        <View style={executiveStyles.section}>
          <Text style={executiveStyles.sectionTitle}>Core Competencies</Text>
          <View style={executiveStyles.skillsContainer}>
            {data.skills.map((skill) => (
              <Text key={skill.id} style={executiveStyles.skillItem}>• {skill.name}</Text>
            ))}
          </View>
        </View>
      )}
    </Page>
  </Document>
);

export const TechTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={techStyles.page}>
      <View style={techStyles.header}>
        <Text style={techStyles.name}>{data.personal.fullName || 'Your Name'}</Text>
        <Text style={techStyles.jobTitle}>{data.personal.jobTitle || 'Software Developer'}</Text>
        <View style={techStyles.contact}>
          {data.personal.email && <Text>{data.personal.email}</Text>}
          {data.personal.phone && <Text>{data.personal.phone}</Text>}
          {data.personal.location && <Text>{data.personal.location}</Text>}
          {data.personal.website && <Text>{data.personal.website}</Text>}
        </View>
      </View>

      {data.personal.summary && (
        <View style={techStyles.section}>
          <Text style={techStyles.sectionTitle}>// About</Text>
          <Text style={techStyles.summary}>{data.personal.summary}</Text>
        </View>
      )}

      {data.skills.length > 0 && (
        <View style={techStyles.section}>
          <Text style={techStyles.sectionTitle}>// Tech Stack</Text>
          <View style={techStyles.skillsContainer}>
            {data.skills.map((skill) => (
              <Text key={skill.id} style={techStyles.skillItem}>{skill.name}</Text>
            ))}
          </View>
        </View>
      )}

      {data.experience.length > 0 && (
        <View style={techStyles.section}>
          <Text style={techStyles.sectionTitle}>// Experience</Text>
          {data.experience.map((exp) => (
            <View key={exp.id} style={techStyles.experienceItem}>
              <Text style={techStyles.expTitle}>{exp.position}</Text>
              <Text style={techStyles.expCompany}>{exp.company}</Text>
              <Text style={techStyles.expMeta}>
                {exp.location} • {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
              </Text>
              <Text style={techStyles.expDesc}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {data.projects.length > 0 && (
        <View style={techStyles.section}>
          <Text style={techStyles.sectionTitle}>// Projects</Text>
          {data.projects.map((project) => (
            <View key={project.id} style={techStyles.projectItem}>
              <Text style={techStyles.projectName}>{project.name}</Text>
              {project.url && <Text style={techStyles.projectUrl}>{project.url}</Text>}
              <Text style={techStyles.expDesc}>{project.description}</Text>
              <View style={techStyles.techTags}>
                {project.technologies.map((tech, i) => (
                  <Text key={i} style={techStyles.techTag}>{tech}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {data.education.length > 0 && (
        <View style={techStyles.section}>
          <Text style={techStyles.sectionTitle}>// Education</Text>
          {data.education.map((edu) => (
            <View key={edu.id} style={techStyles.eduItem}>
              <Text style={techStyles.expTitle}>{edu.degree} in {edu.field}</Text>
              <Text style={techStyles.expMeta}>{edu.institution} • {formatDate(edu.endDate)}</Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export const CompactTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={compactStyles.page}>
      <View style={compactStyles.header}>
        <View style={compactStyles.headerLeft}>
          <Text style={compactStyles.name}>{data.personal.fullName || 'Your Name'}</Text>
          <Text style={compactStyles.jobTitle}>{data.personal.jobTitle || 'Professional Title'}</Text>
        </View>
        <View style={compactStyles.headerRight}>
          {data.personal.email && <Text style={compactStyles.contactItem}>{data.personal.email}</Text>}
          {data.personal.phone && <Text style={compactStyles.contactItem}>{data.personal.phone}</Text>}
          {data.personal.location && <Text style={compactStyles.contactItem}>{data.personal.location}</Text>}
        </View>
      </View>

      <View style={compactStyles.twoColumn}>
        <View style={compactStyles.leftColumn}>
          {data.personal.summary && (
            <View style={compactStyles.section}>
              <Text style={compactStyles.sectionTitle}>Summary</Text>
              <Text style={compactStyles.summary}>{data.personal.summary}</Text>
            </View>
          )}

          {data.experience.length > 0 && (
            <View style={compactStyles.section}>
              <Text style={compactStyles.sectionTitle}>Experience</Text>
              {data.experience.map((exp) => (
                <View key={exp.id} style={compactStyles.experienceItem}>
                  <Text style={compactStyles.expTitle}>{exp.position} — {exp.company}</Text>
                  <Text style={compactStyles.expMeta}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)} | {exp.location}
                  </Text>
                  <Text style={compactStyles.expDesc}>{exp.description}</Text>
                </View>
              ))}
            </View>
          )}

          {data.projects.length > 0 && (
            <View style={compactStyles.section}>
              <Text style={compactStyles.sectionTitle}>Projects</Text>
              {data.projects.map((project) => (
                <View key={project.id} style={compactStyles.projectItem}>
                  <Text style={compactStyles.projectName}>{project.name}</Text>
                  <Text style={compactStyles.expDesc}>{project.description}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={compactStyles.rightColumn}>
          {data.education.length > 0 && (
            <View style={compactStyles.section}>
              <Text style={compactStyles.sectionTitle}>Education</Text>
              {data.education.map((edu) => (
                <View key={edu.id} style={compactStyles.eduItem}>
                  <Text style={compactStyles.expTitle}>{edu.degree}</Text>
                  <Text style={compactStyles.expMeta}>{edu.institution}</Text>
                  <Text style={compactStyles.expMeta}>{formatDate(edu.endDate)}</Text>
                </View>
              ))}
            </View>
          )}

          {data.skills.length > 0 && (
            <View style={compactStyles.section}>
              <Text style={compactStyles.sectionTitle}>Skills</Text>
              <View style={compactStyles.skillsContainer}>
                {data.skills.map((skill) => (
                  <Text key={skill.id} style={compactStyles.skillItem}>{skill.name}</Text>
                ))}
              </View>
            </View>
          )}

          {data.languages.length > 0 && (
            <View style={compactStyles.section}>
              <Text style={compactStyles.sectionTitle}>Languages</Text>
              {data.languages.map((lang) => (
                <Text key={lang.id} style={compactStyles.langItem}>{lang.name} — {lang.proficiency}</Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </Page>
  </Document>
);

export const ElegantTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={elegantStyles.page}>
      <View style={elegantStyles.header}>
        <Text style={elegantStyles.name}>{data.personal.fullName || 'Your Name'}</Text>
        <Text style={elegantStyles.jobTitle}>{data.personal.jobTitle || 'Professional Title'}</Text>
        <View style={elegantStyles.contact}>
          {data.personal.email && <Text>{data.personal.email}</Text>}
          {data.personal.phone && <Text>{data.personal.phone}</Text>}
          {data.personal.location && <Text>{data.personal.location}</Text>}
        </View>
      </View>

      {data.personal.summary && (
        <View style={elegantStyles.section}>
          <Text style={elegantStyles.sectionTitle}>Professional Profile</Text>
          <Text style={elegantStyles.summary}>{data.personal.summary}</Text>
        </View>
      )}

      {data.experience.length > 0 && (
        <View style={elegantStyles.section}>
          <Text style={elegantStyles.sectionTitle}>Experience</Text>
          {data.experience.map((exp) => (
            <View key={exp.id} style={elegantStyles.experienceItem}>
              <Text style={elegantStyles.expTitle}>{exp.position}</Text>
              <Text style={elegantStyles.expCompany}>{exp.company}</Text>
              <Text style={elegantStyles.expMeta}>
                {exp.location} | {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
              </Text>
              <Text style={elegantStyles.expDesc}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {data.education.length > 0 && (
        <View style={elegantStyles.section}>
          <Text style={elegantStyles.sectionTitle}>Education</Text>
          {data.education.map((edu) => (
            <View key={edu.id} style={elegantStyles.eduItem}>
              <Text style={elegantStyles.expTitle}>{edu.degree} in {edu.field}</Text>
              <Text style={elegantStyles.expCompany}>{edu.institution}</Text>
              <Text style={elegantStyles.expMeta}>{formatDate(edu.endDate)}</Text>
            </View>
          ))}
        </View>
      )}

      {data.skills.length > 0 && (
        <View style={elegantStyles.section}>
          <Text style={elegantStyles.sectionTitle}>Areas of Expertise</Text>
          <View style={elegantStyles.skillsContainer}>
            {data.skills.map((skill) => (
              <Text key={skill.id} style={elegantStyles.skillItem}>{skill.name}</Text>
            ))}
          </View>
        </View>
      )}

      {data.projects.length > 0 && (
        <View style={elegantStyles.section}>
          <Text style={elegantStyles.sectionTitle}>Notable Projects</Text>
          {data.projects.map((project) => (
            <View key={project.id} style={elegantStyles.projectItem}>
              <Text style={elegantStyles.projectName}>{project.name}</Text>
              <Text style={elegantStyles.expDesc}>{project.description}</Text>
              <View style={elegantStyles.techTags}>
                {project.technologies.map((tech, i) => (
                  <Text key={i} style={elegantStyles.techTag}>{tech}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export const BoldTemplate: React.FC<{ data: CVData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={boldStyles.page}>
      <View style={boldStyles.header}>
        <Text style={boldStyles.name}>{data.personal.fullName || 'YOUR NAME'}</Text>
        <Text style={boldStyles.jobTitle}>{data.personal.jobTitle || 'PROFESSIONAL TITLE'}</Text>
        <View style={boldStyles.contact}>
          {data.personal.email && <Text>{data.personal.email}</Text>}
          {data.personal.phone && <Text>{data.personal.phone}</Text>}
          {data.personal.location && <Text>{data.personal.location}</Text>}
        </View>
      </View>

      {data.personal.summary && (
        <View style={boldStyles.section}>
          <Text style={boldStyles.sectionTitle}>ABOUT</Text>
          <Text style={boldStyles.summary}>{data.personal.summary}</Text>
        </View>
      )}

      {data.experience.length > 0 && (
        <View style={boldStyles.section}>
          <Text style={boldStyles.sectionTitle}>EXPERIENCE</Text>
          {data.experience.map((exp) => (
            <View key={exp.id} style={boldStyles.experienceItem}>
              <Text style={boldStyles.expTitle}>{exp.position}</Text>
              <Text style={boldStyles.expCompany}>{exp.company}</Text>
              <Text style={boldStyles.expMeta}>
                {exp.location} | {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
              </Text>
              <Text style={boldStyles.expDesc}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {data.skills.length > 0 && (
        <View style={boldStyles.section}>
          <Text style={boldStyles.sectionTitle}>SKILLS</Text>
          <View style={boldStyles.skillsContainer}>
            {data.skills.map((skill) => (
              <Text key={skill.id} style={boldStyles.skillItem}>{skill.name.toUpperCase()}</Text>
            ))}
          </View>
        </View>
      )}

      {data.education.length > 0 && (
        <View style={boldStyles.section}>
          <Text style={boldStyles.sectionTitle}>EDUCATION</Text>
          {data.education.map((edu) => (
            <View key={edu.id} style={boldStyles.eduItem}>
              <Text style={boldStyles.expTitle}>{edu.degree} IN {edu.field.toUpperCase()}</Text>
              <Text style={boldStyles.expCompany}>{edu.institution}</Text>
            </View>
          ))}
        </View>
      )}

      {data.projects.length > 0 && (
        <View style={boldStyles.section}>
          <Text style={boldStyles.sectionTitle}>PROJECTS</Text>
          {data.projects.map((project) => (
            <View key={project.id} style={boldStyles.projectItem}>
              <Text style={boldStyles.projectName}>{project.name}</Text>
              <Text style={boldStyles.expDesc}>{project.description}</Text>
              <View style={boldStyles.techTags}>
                {project.technologies.map((tech, i) => (
                  <Text key={i} style={boldStyles.techTag}>{tech.toUpperCase()}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

// Template map for easy access
export const templates = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  creative: CreativeTemplate,
  professional: ProfessionalTemplate,
  executive: ExecutiveTemplate,
  tech: TechTemplate,
  compact: CompactTemplate,
  elegant: ElegantTemplate,
  bold: BoldTemplate,
};
