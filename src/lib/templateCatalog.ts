export type TemplateLayout = 'clean' | 'sidebar' | 'header';

export interface TemplateCatalogItem {
  id: string;
  name: string;
  role: string;
  description: string;
  category: string;
  accent: string;
  background: string;
  text: string;
  layout: TemplateLayout;
  badge?: 'EU' | 'ATS' | 'Photo';
  photoSize?: 'normal' | 'large';
}

const special: TemplateCatalogItem[] = [
  { id:'europass', name:'Europass CV', role:'European applications', description:'Official EU structure and fields', category:'Special', accent:'#1e4e79', background:'#fff', text:'#263445', layout:'clean', badge:'EU' },
  { id:'ats', name:'ATS Precision', role:'ATS applications', description:'Single-column parser-safe format', category:'Special', accent:'#0f766e', background:'#fff', text:'#17202a', layout:'clean', badge:'ATS' },
  { id:'photo-modern', name:'Photo Modern', role:'Client-facing roles', description:'Modern sidebar with portrait', category:'Photo', accent:'#0f172a', background:'#fff', text:'#334155', layout:'sidebar', badge:'Photo', photoSize:'large' },
  { id:'photo-classic', name:'Photo Classic', role:'International careers', description:'Traditional portrait header', category:'Photo', accent:'#1a365d', background:'#fff', text:'#334155', layout:'clean', badge:'Photo', photoSize:'large' },
  { id:'photo-creative', name:'Photo Creative', role:'Creative portfolios', description:'Expressive portrait banner', category:'Photo', accent:'#7c3aed', background:'#fff', text:'#2d3748', layout:'header', badge:'Photo', photoSize:'large' },
];

const jobs: Array<[string,string,string,string,string,TemplateLayout]> = [
  ['software-engineer','Software Engineer','Engineering','Built for technical impact','#2563eb','sidebar'],
  ['data-scientist','Data Scientist','Technology','Models, metrics and research','#0f766e','clean'],
  ['cybersecurity','Cybersecurity','Technology','Security expertise and outcomes','#334155','header'],
  ['product-manager','Product Manager','Product','Strategy, discovery and delivery','#7c3aed','clean'],
  ['ux-designer','UX Designer','Design','Research and product thinking','#db2777','sidebar'],
  ['graphic-designer','Graphic Designer','Design','Portfolio-forward presentation','#e11d48','header'],
  ['marketing-manager','Marketing Manager','Marketing','Campaigns, growth and brand','#ea580c','header'],
  ['sales-executive','Sales Executive','Sales','Revenue and relationship focused','#0369a1','sidebar'],
  ['finance-analyst','Financial Analyst','Finance','Analysis, forecasts and results','#1e3a5f','clean'],
  ['accountant','Accountant','Finance','Compliance and financial accuracy','#475569','clean'],
  ['investment-banking','Investment Banking','Finance','Deals, valuation and leadership','#9a6b16','header'],
  ['management-consultant','Management Consultant','Consulting','Structured impact stories','#166534','sidebar'],
  ['project-manager','Project Manager','Operations','Scope, teams and delivery','#1d4ed8','clean'],
  ['operations-manager','Operations Manager','Operations','Efficiency and scale','#0f766e','sidebar'],
  ['hr-specialist','HR Specialist','People','People programs and compliance','#be185d','clean'],
  ['recruiter','Talent Recruiter','People','Hiring outcomes and partnerships','#9333ea','header'],
  ['legal-counsel','Legal Counsel','Legal','Advisory work and risk management','#7f1d1d','clean'],
  ['paralegal','Paralegal','Legal','Casework and legal operations','#92400e','sidebar'],
  ['registered-nurse','Registered Nurse','Healthcare','Clinical care and credentials','#047857','sidebar'],
  ['physician','Physician','Healthcare','Clinical expertise and research','#0369a1','clean'],
  ['pharmacist','Pharmacist','Healthcare','Patient safety and pharmacy practice','#0f766e','header'],
  ['healthcare-admin','Healthcare Administrator','Healthcare','Operations and patient outcomes','#15803d','clean'],
  ['teacher','Teacher','Education','Instruction and student outcomes','#b45309','sidebar'],
  ['academic-researcher','Academic Researcher','Education','Publications and research focus','#4338ca','clean'],
  ['civil-engineer','Civil Engineer','Engineering','Projects, safety and delivery','#475569','header'],
  ['mechanical-engineer','Mechanical Engineer','Engineering','Design and manufacturing impact','#1d4ed8','clean'],
  ['electrical-engineer','Electrical Engineer','Engineering','Systems and technical projects','#b45309','sidebar'],
  ['architect','Architect','Architecture','Projects, design and practice','#9f1239','header'],
  ['construction-manager','Construction Manager','Construction','Budgets, sites and schedules','#92400e','sidebar'],
  ['supply-chain','Supply Chain','Operations','Planning, sourcing and savings','#166534','clean'],
  ['logistics','Logistics Manager','Operations','Distribution and optimization','#0369a1','header'],
  ['hospitality','Hospitality Manager','Hospitality','Guest experience and operations','#a16207','sidebar'],
  ['executive-chef','Executive Chef','Hospitality','Leadership, menus and standards','#991b1b','header'],
  ['customer-success','Customer Success','Customer','Retention and account growth','#0891b2','sidebar'],
  ['business-analyst','Business Analyst','Business','Requirements and measurable change','#4f46e5','clean'],
  ['entrepreneur','Entrepreneur','Leadership','Ventures, growth and ownership','#c2410c','header'],
  ['nonprofit-leader','Nonprofit Leader','Leadership','Mission, programs and funding','#15803d','sidebar'],
  ['government','Public Service','Government','Policy and public impact','#1e3a5f','clean'],
  ['aviation','Aviation Professional','Aviation','Safety, hours and operations','#075985','header'],
  ['automotive','Automotive Specialist','Automotive','Diagnostics and technical service','#374151','sidebar'],
  ['real-estate','Real Estate','Sales','Portfolio and transaction results','#854d0e','clean'],
  ['insurance','Insurance Professional','Finance','Risk, service and performance','#1e40af','sidebar'],
  ['retail-manager','Retail Manager','Retail','Sales, teams and store operations','#be123c','header'],
  ['journalist','Journalist & Media','Media','Stories, beats and publications','#374151','clean'],
  ['content-strategist','Content Strategist','Marketing','Editorial systems and growth','#7e22ce','sidebar'],
  ['executive-leadership','Executive Leadership','Leadership','Board-ready strategic impact','#9a6b16','header'],
  ['graduate-entry','Graduate Entry','Early Career','Education, projects and potential','#2563eb','clean'],
];

export const templateCatalog: TemplateCatalogItem[] = [
  ...special,
  ...jobs.map(([id,name,category,description,accent,layout]) => ({ id,name,role:name,description,category,accent,background:'#fff',text:'#2d3748',layout })),
];

export const templateById = Object.fromEntries(templateCatalog.map((item) => [item.id,item])) as Record<string,TemplateCatalogItem>;
