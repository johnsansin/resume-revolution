import React, { useMemo, useState } from 'react';
import { useCVContext } from '@/contexts/CVContext';
import { templateCatalog } from '@/lib/templateCatalog';
import { Camera, Check, FileBadge, Search, ShieldCheck, SlidersHorizontal } from 'lucide-react';

const TemplateSelector: React.FC = () => {
  const { selectedTemplate, setSelectedTemplate } = useCVContext();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => ['All', ...Array.from(new Set(templateCatalog.map((item) => item.category)))], []);
  const visible = useMemo(() => templateCatalog.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    const haystack = `${item.name} ${item.role} ${item.description} ${item.category}`.toLowerCase();
    return matchesCategory && haystack.includes(query.trim().toLowerCase());
  }), [query, category]);

  return (
    <div className="template-gallery animate-fade-in">
      <div className="template-gallery-intro">
        <div><span className="template-gallery-kicker">Professional collection</span><h3>Choose the right resume for the role</h3><p>52 focused designs built for real hiring workflows, clear reading and polished PDF export.</p></div>
        <strong><span>52</span> templates</strong>
      </div>
      <div className="template-gallery-tools">
        <label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles or industries" /></label>
        <div className="template-category-row"><SlidersHorizontal />{categories.map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      </div>
      <div className="template-gallery-count">Showing <b>{visible.length}</b> professional templates</div>
      <div className="template-gallery-grid">
        {visible.map((template) => {
          const selected = selectedTemplate === template.id;
          return (
            <button key={template.id} onClick={() => setSelectedTemplate(template.id)} className={`template-card ${selected ? 'selected' : ''}`}>
              {selected && <span className="template-selected"><Check /></span>}
              {template.badge && <span className={`template-badge badge-${template.badge.toLowerCase()}`}>{template.badge === 'ATS' ? <ShieldCheck /> : template.badge === 'EU' ? <FileBadge /> : <Camera />}{template.badge}</span>}
              <div className={`template-thumb layout-${template.layout}`} style={{ '--template-accent': template.accent } as React.CSSProperties}>
                <div className="template-paper">
                  <span className="template-photo" />
                  <div className="template-mini-head"><i /><i /></div>
                  <div className="template-mini-body"><span /><span /><span /><span /><span /></div>
                </div>
              </div>
              <div className="template-card-copy"><span>{template.category}</span><h4>{template.name}</h4><p>{template.description}</p><small>Best for {template.role}</small></div>
            </button>
          );
        })}
      </div>
      {visible.length === 0 && <div className="template-gallery-empty">No templates match that search. Try another role or category.</div>}
    </div>
  );
};

export default TemplateSelector;
