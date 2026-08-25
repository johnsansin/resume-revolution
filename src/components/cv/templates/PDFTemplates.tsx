import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { CVData } from '@/types/cv';
import { EuropassTemplate } from './EuropassTemplate';
import { ATSTemplate } from './ATSTemplate';
import { templateCatalog } from '@/lib/templateCatalog';

const formatDate = (date: string) => {
  if (!date) return '';
  const [year, month] = date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
};

// Base template creator for consistent structure
const createBaseTemplate = (config: {
  pageStyle: object;
  headerStyle: object;
  nameStyle: object;
  titleStyle: object;
  contactStyle: object;
  sectionStyle: object;
  sectionTitleStyle: object;
  contentStyle: object;
  skillStyle: object;
  accentColor: string;
}) => {
  const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, ...config.pageStyle },
    header: { marginBottom: 20, ...config.headerStyle },
    name: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, ...config.nameStyle },
    jobTitle: { fontSize: 12, marginBottom: 10, ...config.titleStyle },
    contact: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, fontSize: 9, ...config.contactStyle },
    section: { marginTop: 15, ...config.sectionStyle },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 10, paddingBottom: 5, ...config.sectionTitleStyle },
    summary: { lineHeight: 1.5, ...config.contentStyle },
    experienceItem: { marginBottom: 12 },
    expTitle: { fontWeight: 'bold', fontSize: 11 },
    expCompany: { fontSize: 10, marginTop: 2 },
    expMeta: { fontSize: 9, color: '#718096', marginTop: 2 },
    expDesc: { marginTop: 4, lineHeight: 1.4, fontSize: 9 },
    eduItem: { marginBottom: 10 },
    skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    skillItem: { padding: '4 8', borderRadius: 3, fontSize: 9, ...config.skillStyle },
    langItem: { marginBottom: 5, fontSize: 9 },
    projectItem: { marginBottom: 10 },
    projectName: { fontWeight: 'bold', fontSize: 11 },
    techTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 3 },
    techTag: { padding: '2 5', borderRadius: 2, fontSize: 8 },
  });
  return styles;
};

// === TEMPLATE 1: CLASSIC ===
const classicStyles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { textAlign: 'center', marginBottom: 20, borderBottom: '2px solid #1a365d', paddingBottom: 15, alignItems: 'center' },
  photo: { width: 60, height: 60, borderRadius: 30, marginBottom: 10, objectFit: 'cover' },
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

export const ClassicTemplate: React.FC<{ data: CVData; showPhoto?: boolean }> = ({ data, showPhoto = true }) => (
  <Document>
    <Page size="A4" style={classicStyles.page}>
      <View style={classicStyles.header}>
        {showPhoto && data.personal.photo && <Image src={data.personal.photo} style={classicStyles.photo} />}
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
                <Text style={classicStyles.expDate}>{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</Text>
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
                <Text style={classicStyles.expDate}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</Text>
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
              <Text>{lang.name}</Text>
              <Text style={{ color: '#718096', textTransform: 'capitalize' }}>{lang.proficiency}</Text>
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

// === TEMPLATE 2: MODERN ===
const modernStyles = StyleSheet.create({
  page: { flexDirection: 'row', fontFamily: 'Helvetica', fontSize: 10 },
  sidebar: { width: '35%', backgroundColor: '#1a365d', padding: 25, color: '#fff' },
  main: { width: '65%', padding: 30, backgroundColor: '#fff' },
  photo: { width: 70, height: 70, borderRadius: 35, marginBottom: 15, objectFit: 'cover', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
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

export const ModernTemplate: React.FC<{ data: CVData; showPhoto?: boolean }> = ({ data, showPhoto = true }) => (
  <Document>
    <Page size="A4" style={modernStyles.page}>
      <View style={modernStyles.sidebar}>
        {showPhoto && data.personal.photo && <Image src={data.personal.photo} style={modernStyles.photo} />}
        <Text style={modernStyles.name}>{data.personal.fullName || 'Your Name'}</Text>
        <Text style={modernStyles.jobTitle}>{data.personal.jobTitle || 'Professional Title'}</Text>
        <View style={modernStyles.sideSection}>
          <Text style={modernStyles.sideSectionTitle}>Contact</Text>
          {data.personal.email && <Text style={modernStyles.contactItem}>{data.personal.email}</Text>}
          {data.personal.phone && <Text style={modernStyles.contactItem}>{data.personal.phone}</Text>}
          {data.personal.location && <Text style={modernStyles.contactItem}>{data.personal.location}</Text>}
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
            <Text style={modernStyles.mainSectionTitle}>About Me</Text>
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
                  <Text style={modernStyles.expDate}>{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</Text>
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

// Create a generic template component factory
const createGenericTemplate = (
  accentColor: string,
  bgColor: string = '#fff',
  textColor: string = '#333',
  sidebarBg?: string,
  photoSize: 'normal' | 'large' = 'normal'
): React.FC<{ data: CVData; showPhoto?: boolean }> => {
  const isLarge = photoSize === 'large';
  const styles = StyleSheet.create({
    page: { padding: sidebarBg ? 0 : 40, fontFamily: 'Helvetica', fontSize: 10, color: textColor, backgroundColor: bgColor, flexDirection: sidebarBg ? 'row' : 'column' },
    sidebar: sidebarBg ? { width: '35%', backgroundColor: sidebarBg, padding: 25, color: '#fff' } : {},
    sidebarPhoto: { width: isLarge ? 110 : 60, height: isLarge ? 110 : 60, borderRadius: isLarge ? 55 : 30, marginBottom: 15, objectFit: 'cover', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
    main: sidebarBg ? { width: '65%', padding: 30, backgroundColor: bgColor } : {},
    header: { marginBottom: 20, borderBottom: `2px solid ${accentColor}`, paddingBottom: 15, flexDirection: 'row', gap: 15, alignItems: 'center' },
    headerPhoto: { width: isLarge ? 84 : 50, height: isLarge ? 84 : 50, borderRadius: isLarge ? 42 : 25, objectFit: 'cover', borderWidth: 2, borderColor: accentColor },
    headerContent: { flex: 1 },
    name: { fontSize: 24, fontWeight: 'bold', color: accentColor, marginBottom: 5 },
    jobTitle: { fontSize: 12, color: textColor, opacity: 0.7, marginBottom: 10 },
    contact: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, fontSize: 9 },
    section: { marginTop: 15 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: accentColor, borderBottom: `1px solid ${accentColor}33`, paddingBottom: 5, marginBottom: 10 },
    summary: { lineHeight: 1.5 },
    experienceItem: { marginBottom: 12 },
    expTitle: { fontWeight: 'bold', fontSize: 11 },
    expCompany: { fontSize: 10, color: accentColor },
    expMeta: { fontSize: 9, opacity: 0.6, marginTop: 2 },
    expDesc: { marginTop: 4, lineHeight: 1.4, fontSize: 9 },
    eduItem: { marginBottom: 10 },
    skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    skillItem: { backgroundColor: `${accentColor}22`, padding: '4 8', borderRadius: 3, fontSize: 9, color: accentColor },
    langItem: { marginBottom: 5, fontSize: 9 },
    projectItem: { marginBottom: 10 },
    projectName: { fontWeight: 'bold', fontSize: 11 },
    techTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 3 },
    techTag: { backgroundColor: `${accentColor}15`, padding: '2 5', borderRadius: 2, fontSize: 8, color: accentColor },
  });

  return ({ data, showPhoto = true }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        {sidebarBg ? (
          <>
            <View style={styles.sidebar}>
              {showPhoto && data.personal.photo && <Image src={data.personal.photo} style={styles.sidebarPhoto} />}
              <Text style={{ ...styles.name, color: '#fff' }}>{data.personal.fullName || 'Your Name'}</Text>
              <Text style={{ ...styles.jobTitle, color: '#fff', opacity: 0.8 }}>{data.personal.jobTitle}</Text>
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', opacity: 0.9, marginBottom: 8 }}>CONTACT</Text>
                {data.personal.email && <Text style={{ fontSize: 9, marginBottom: 4, color: '#fff', opacity: 0.8 }}>{data.personal.email}</Text>}
                {data.personal.phone && <Text style={{ fontSize: 9, marginBottom: 4, color: '#fff', opacity: 0.8 }}>{data.personal.phone}</Text>}
                {data.personal.location && <Text style={{ fontSize: 9, marginBottom: 4, color: '#fff', opacity: 0.8 }}>{data.personal.location}</Text>}
              </View>
              {data.skills.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', opacity: 0.9, marginBottom: 8 }}>SKILLS</Text>
                  {data.skills.map((skill) => (
                    <Text key={skill.id} style={{ fontSize: 9, marginBottom: 4, color: '#fff', opacity: 0.8 }}>{skill.name}</Text>
                  ))}
                </View>
              )}
              {data.languages.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#fff', opacity: 0.9, marginBottom: 8 }}>LANGUAGES</Text>
                  {data.languages.map((lang) => (
                    <Text key={lang.id} style={{ fontSize: 9, marginBottom: 4, color: '#fff', opacity: 0.8 }}>{lang.name} - {lang.proficiency}</Text>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.main}>
              {data.personal.summary && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>About</Text>
                  <Text style={styles.summary}>{data.personal.summary}</Text>
                </View>
              )}
              {data.experience.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Experience</Text>
                  {data.experience.map((exp) => (
                    <View key={exp.id} style={styles.experienceItem}>
                      <Text style={styles.expTitle}>{exp.position}</Text>
                      <Text style={styles.expCompany}>{exp.company}</Text>
                      <Text style={styles.expMeta}>{exp.location} | {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</Text>
                      <Text style={styles.expDesc}>{exp.description}</Text>
                    </View>
                  ))}
                </View>
              )}
              {data.education.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Education</Text>
                  {data.education.map((edu) => (
                    <View key={edu.id} style={styles.eduItem}>
                      <Text style={styles.expTitle}>{edu.degree} in {edu.field}</Text>
                      <Text style={styles.expCompany}>{edu.institution}</Text>
                      <Text style={styles.expMeta}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</Text>
                    </View>
                  ))}
                </View>
              )}
              {data.projects.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Projects</Text>
                  {data.projects.map((project) => (
                    <View key={project.id} style={styles.projectItem}>
                      <Text style={styles.projectName}>{project.name}</Text>
                      <Text style={styles.expDesc}>{project.description}</Text>
                      <View style={styles.techTags}>
                        {project.technologies.map((tech, i) => (
                          <Text key={i} style={styles.techTag}>{tech}</Text>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            <View style={styles.header}>
              {showPhoto && data.personal.photo && <Image src={data.personal.photo} style={styles.headerPhoto} />}
              <View style={styles.headerContent}>
                <Text style={styles.name}>{data.personal.fullName || 'Your Name'}</Text>
                <Text style={styles.jobTitle}>{data.personal.jobTitle}</Text>
                <View style={styles.contact}>
                  {data.personal.email && <Text>{data.personal.email}</Text>}
                  {data.personal.phone && <Text>{data.personal.phone}</Text>}
                  {data.personal.location && <Text>{data.personal.location}</Text>}
                </View>
              </View>
            </View>
            {data.personal.summary && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <Text style={styles.summary}>{data.personal.summary}</Text>
              </View>
            )}
            {data.experience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Experience</Text>
                {data.experience.map((exp) => (
                  <View key={exp.id} style={styles.experienceItem}>
                    <Text style={styles.expTitle}>{exp.position}</Text>
                    <Text style={styles.expCompany}>{exp.company}</Text>
                    <Text style={styles.expMeta}>{exp.location} | {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</Text>
                    <Text style={styles.expDesc}>{exp.description}</Text>
                  </View>
                ))}
              </View>
            )}
            {data.education.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Education</Text>
                {data.education.map((edu) => (
                  <View key={edu.id} style={styles.eduItem}>
                    <Text style={styles.expTitle}>{edu.degree} in {edu.field}</Text>
                    <Text style={styles.expCompany}>{edu.institution}</Text>
                    <Text style={styles.expMeta}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</Text>
                  </View>
                ))}
              </View>
            )}
            {data.skills.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Skills</Text>
                <View style={styles.skillsContainer}>
                  {data.skills.map((skill) => (
                    <Text key={skill.id} style={styles.skillItem}>{skill.name}</Text>
                  ))}
                </View>
              </View>
            )}
            {data.languages.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Languages</Text>
                {data.languages.map((lang) => (
                  <Text key={lang.id} style={styles.langItem}>{lang.name} - {lang.proficiency}</Text>
                ))}
              </View>
            )}
            {data.projects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Projects</Text>
                {data.projects.map((project) => (
                  <View key={project.id} style={styles.projectItem}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <Text style={styles.expDesc}>{project.description}</Text>
                    <View style={styles.techTags}>
                      {project.technologies.map((tech, i) => (
                        <Text key={i} style={styles.techTag}>{tech}</Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </Page>
    </Document>
  );
};

// === ALL 50 TEMPLATES ===

// 3. Minimal
export const MinimalTemplate = createGenericTemplate('#1a1a1a', '#fff', '#333');

// 4. Creative
export const CreativeTemplate = createGenericTemplate('#319795', '#fff', '#2d3748');

// 5. Professional
export const ProfessionalTemplate = createGenericTemplate('#2b6cb0', '#fff', '#2d3748');

// 6. Executive
export const ExecutiveTemplate = createGenericTemplate('#c9a227', '#fff', '#1a1a1a');

// 7. Tech
export const TechTemplate = createGenericTemplate('#58a6ff', '#0d1117', '#c9d1d9');

// 8. Compact
export const CompactTemplate = createGenericTemplate('#2563eb', '#fff', '#333');

// 9. Elegant
export const ElegantTemplate = createGenericTemplate('#744210', '#fff', '#2d3748');

// 10. Bold
export const BoldTemplate = createGenericTemplate('#e53e3e', '#fff', '#1a1a1a');

// 11. Corporate
export const CorporateTemplate = createGenericTemplate('#1e3a5f', '#fff', '#2d3748', '#1e3a5f');

// 12. Academic
export const AcademicTemplate = createGenericTemplate('#2c5282', '#fff', '#2d3748');

// 13. Startup
export const StartupTemplate = createGenericTemplate('#6b46c1', '#fff', '#2d3748', '#6b46c1');

// 14. Designer
export const DesignerTemplate = createGenericTemplate('#d53f8c', '#fff', '#2d3748');

// 15. Consultant
export const ConsultantTemplate = createGenericTemplate('#2f855a', '#fff', '#2d3748', '#2f855a');

// 16. Engineer
export const EngineerTemplate = createGenericTemplate('#3182ce', '#fff', '#2d3748');

// 17. Marketing
export const MarketingTemplate = createGenericTemplate('#dd6b20', '#fff', '#2d3748', '#dd6b20');

// 18. Finance
export const FinanceTemplate = createGenericTemplate('#1a365d', '#fff', '#2d3748');

// 19. Healthcare
export const HealthcareTemplate = createGenericTemplate('#38a169', '#fff', '#2d3748', '#38a169');

// 20. Legal
export const LegalTemplate = createGenericTemplate('#742a2a', '#fff', '#2d3748');

// 21. Artistic
export const ArtisticTemplate = createGenericTemplate('#9f7aea', '#fff', '#2d3748');

// 22. Gradient (Purple)
export const GradientTemplate = createGenericTemplate('#805ad5', '#fff', '#2d3748', '#667eea');

// 23. Timeline
export const TimelineTemplate = createGenericTemplate('#4299e1', '#fff', '#2d3748');

// 24. Infographic
export const InfographicTemplate = createGenericTemplate('#ed8936', '#fff', '#2d3748', '#dd6b20');

// 25. Simple
export const SimpleTemplate = createGenericTemplate('#4a5568', '#fff', '#2d3748');

// 26. Clean
export const CleanTemplate = createGenericTemplate('#38b2ac', '#fff', '#2d3748');

// 27. Formal
export const FormalTemplate = createGenericTemplate('#2d3748', '#fff', '#2d3748');

// 28. Casual
export const CasualTemplate = createGenericTemplate('#ed64a6', '#fff', '#2d3748');

// 29. Contemporary
export const ContemporaryTemplate = createGenericTemplate('#00b5d8', '#fff', '#2d3748', '#0987a0');

// 30. Traditional
export const TraditionalTemplate = createGenericTemplate('#744210', '#fff', '#2d3748');

// 31. Sleek
export const SleekTemplate = createGenericTemplate('#1a202c', '#fff', '#2d3748', '#1a202c');

// 32. Vibrant
export const VibrantTemplate = createGenericTemplate('#f56565', '#fff', '#2d3748');

// 33. Monochrome
export const MonochromeTemplate = createGenericTemplate('#1a1a1a', '#fff', '#1a1a1a');

// 34. Pastel
export const PastelTemplate = createGenericTemplate('#b794f4', '#faf5ff', '#553c9a');

// 35. Dark
export const DarkTemplate = createGenericTemplate('#63b3ed', '#1a202c', '#e2e8f0');

// 36. Light
export const LightTemplate = createGenericTemplate('#667eea', '#f7fafc', '#2d3748');

// 37. Accent
export const AccentTemplate = createGenericTemplate('#48bb78', '#fff', '#2d3748');

// 38. Iconic
export const IconicTemplate = createGenericTemplate('#e53e3e', '#fff', '#2d3748', '#c53030');

// 39. Geometric
export const GeometricTemplate = createGenericTemplate('#3182ce', '#fff', '#2d3748');

// 40. Organic
export const OrganicTemplate = createGenericTemplate('#68d391', '#f0fff4', '#22543d');

// 41. Modular
export const ModularTemplate = createGenericTemplate('#9f7aea', '#fff', '#2d3748', '#805ad5');

// 42. Structured
export const StructuredTemplate = createGenericTemplate('#2b6cb0', '#fff', '#2d3748');

// 43. Flowing
export const FlowingTemplate = createGenericTemplate('#4fd1c5', '#fff', '#234e52');

// 44. Metro
export const MetroTemplate = createGenericTemplate('#00a4ef', '#fff', '#2d3748', '#0078d4');

// 45. Swiss
export const SwissTemplate = createGenericTemplate('#e53e3e', '#fff', '#1a1a1a');

// 46. Nordic
export const NordicTemplate = createGenericTemplate('#4a5568', '#f7fafc', '#2d3748');

// 47. Retro
export const RetroTemplate = createGenericTemplate('#d69e2e', '#fffff0', '#744210');

// 48. Futuristic
export const FuturisticTemplate = createGenericTemplate('#00d9ff', '#0a0a0a', '#ffffff');

// 49. Premium
export const PremiumTemplate = createGenericTemplate('#c9a227', '#1a1a1a', '#f7fafc');

// 50. Luxe
export const LuxeTemplate = createGenericTemplate('#d4af37', '#0d0d0d', '#fff', '#1a1a1a');

// 51. Photo Modern
export const PhotoModernTemplate = createGenericTemplate('#0f172a', '#fff', '#334155', '#0f172a', 'large');

// 52. Photo Classic
export const PhotoClassicTemplate = createGenericTemplate('#1a365d', '#fff', '#334155', undefined, 'large');

// 53. Photo Creative
export const PhotoCreativeTemplate = createGenericTemplate('#7c3aed', '#fff', '#2d3748', '#7c3aed', 'large');

const jobTemplates = Object.fromEntries(
  templateCatalog
    .filter((template) => !['europass','ats','photo-modern','photo-classic','photo-creative'].includes(template.id))
    .map((template) => [template.id, createGenericTemplate(
      template.accent,
      template.background,
      template.text,
      template.layout === 'sidebar' || template.layout === 'header' ? template.accent : undefined,
    )]),
);

export const templates = {
  europass: EuropassTemplate,
  ats: ATSTemplate,
  'photo-modern': PhotoModernTemplate,
  'photo-classic': PhotoClassicTemplate,
  'photo-creative': PhotoCreativeTemplate,
  ...jobTemplates,
};
