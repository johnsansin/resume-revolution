import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { Loader2, FileWarning, Download } from 'lucide-react';
import { api } from '@/integrations/api/client';
import { templates } from '@/components/cv/templates/PDFTemplates';
import type { CVData, TemplateId } from '@/types/cv';

interface SharedRecord { name:string; cvData:CVData; templateId:TemplateId; updatedAt:string; }
export default function SharedCV(){
  const {token}=useParams();const [url,setUrl]=useState('');const [record,setRecord]=useState<SharedRecord|null>(null);const [error,setError]=useState('');
  useEffect(()=>{let objectUrl='';(async()=>{try{const data=await api.get<SharedRecord>(`/shared-cvs/${token}`);setRecord(data);const Template=templates[data.templateId as keyof typeof templates]||templates.ats;const blob=await pdf(<Template data={data.cvData} showPhoto={true}/>).toBlob();objectUrl=URL.createObjectURL(blob);setUrl(objectUrl);}catch(cause){setError(cause instanceof Error?cause.message:'Unable to open this shared CV');}})();return()=>{if(objectUrl)URL.revokeObjectURL(objectUrl);};},[token]);
  if(error)return <main className="grid min-h-screen place-items-center bg-[#f6f3ec] p-6"><div className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-lg"><FileWarning className="mx-auto h-10 w-10 text-rose-500"/><h1 className="mt-4 text-xl font-bold">CV unavailable</h1><p className="mt-2 text-sm text-slate-500">{error}</p></div></main>;
  if(!url)return <main className="grid min-h-screen place-items-center bg-[#f6f3ec]"><div className="text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600"/><p className="mt-3 text-sm text-slate-600">Preparing shared PDF…</p></div></main>;
  return <main className="flex h-screen flex-col bg-slate-900"><header className="flex h-14 items-center gap-3 bg-[#161b2e] px-4 text-white"><span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-300 font-serif text-xs font-bold text-[#161b2e]">CV</span><div className="min-w-0"><b className="block truncate text-sm">{record?.name||'Shared CV'}</b><small className="text-slate-400">CareerCanvas secure share</small></div><a href={url} download={`${record?.name||'resume'}.pdf`} className="ml-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900"><Download className="h-4 w-4"/>Download PDF</a></header><iframe title={record?.name||'Shared CV PDF'} src={url} className="w-full flex-1 border-0"/></main>;
}
