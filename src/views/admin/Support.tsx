import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { api } from '@/integrations/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, ArrowLeft, Eye, Loader2, MessageCircle, Search, Send, Sparkles, UserRound } from 'lucide-react';

interface Thread { userId:string; displayName?:string|null; email:string; lastMessage:string; lastMessageAt:string; unread:number; }
interface Message { id:string; senderId:string; receiverId:string; message:string; createdAt:string; readAt?:string|null; }
interface UserDetail { id:string; displayName?:string|null; email:string; phone?:string|null; isActive:boolean; online?:boolean; createdAt:string; cvCount:number; loginCount:number; roles:string[]; lastLogin?:{at?:string;ip?:string;country?:string;city?:string}|null; }

const safeDate=(value?:string)=>{const date=value?new Date(value):null;return date&&!Number.isNaN(date.getTime())?date.toLocaleString():'—';};

export default function AdminSupport() {
  const { user }=useAuth();
  const [threads,setThreads]=useState<Thread[]>([]);
  const [selected,setSelected]=useState<Thread|null>(null);
  const [messages,setMessages]=useState<Message[]>([]);
  const [query,setQuery]=useState('');
  const [text,setText]=useState('');
  const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false);
  const [drafting,setDrafting]=useState(false);
  const [detail,setDetail]=useState<UserDetail|null>(null);
  const [detailLoading,setDetailLoading]=useState(false);
  const [error,setError]=useState('');
  const endRef=useRef<HTMLDivElement>(null);

  const loadThreads=useCallback(async()=>{
    try {
      const result=await api.get<{threads?:Thread[]}>('/admin/support');
      const next=Array.isArray(result?.threads)?result.threads:[];
      setThreads(next);
      setSelected((current)=>{
        const requested=new URLSearchParams(window.location.search).get('user');
        if(current){return next.find((item)=>item.userId===current.userId)||current;}
        return (requested?next.find((item)=>item.userId===requested):undefined)||next[0]||null;
      });
      setError('');
    } catch(cause){setError(cause instanceof Error?cause.message:'Unable to load support inbox');}
    finally{setLoading(false);}
  },[]);

  const loadMessages=useCallback(async(userId:string)=>{
    try{const result=await api.get<{messages?:Message[]}>(`/admin/support/${userId}`);setMessages(Array.isArray(result?.messages)?result.messages:[]);setError('');}
    catch(cause){setError(cause instanceof Error?cause.message:'Unable to load messages');}
  },[]);

  useEffect(()=>{void loadThreads();const timer=window.setInterval(()=>void loadThreads(),10000);return()=>window.clearInterval(timer);},[loadThreads]);
  useEffect(()=>{if(!selected){setMessages([]);return;}void loadMessages(selected.userId);const timer=window.setInterval(()=>void loadMessages(selected.userId),8000);return()=>window.clearInterval(timer);},[selected?.userId,loadMessages]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth'});},[messages.length]);

  const filtered=useMemo(()=>{const needle=query.trim().toLowerCase();return needle?threads.filter((item)=>`${item.displayName||''} ${item.email} ${item.lastMessage||''}`.toLowerCase().includes(needle)):threads;},[threads,query]);
  const send=async()=>{const message=text.trim();if(!selected||!message||sending)return;setSending(true);try{const created=await api.post<Message>(`/admin/support/${selected.userId}`,{message});setMessages((items)=>[...items,created]);setText('');await loadThreads();}catch(cause){setError(cause instanceof Error?cause.message:'Reply could not be sent');}finally{setSending(false);}};
  const openDetail=async()=>{if(!selected)return;setDetailLoading(true);try{setDetail(await api.get<UserDetail>(`/admin/users/${selected.userId}`));}catch(cause){setError(cause instanceof Error?cause.message:'User details could not be loaded');}finally{setDetailLoading(false);}};
  const draftReply=async()=>{if(!selected||drafting)return;setDrafting(true);try{const result=await api.post<{suggestion:string}>(`/admin/support/${selected.userId}/suggest`,{});setText(result.suggestion.slice(0,4000));}catch(cause){setError(cause instanceof Error?cause.message:'AI reply could not be prepared');}finally{setDrafting(false);}};

  return <AdminLayout><div className="superadmin-support-workspace mx-auto h-[calc(100vh-112px)] max-w-[1600px]">
    {error&&<div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><AlertCircle className="h-4 w-4"/>{error}</div>}
    <div className="grid h-full min-h-[520px] min-w-0 overflow-hidden rounded-2xl border bg-card shadow-sm lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className={`${selected?'hidden lg:block':'block'} min-w-0 border-b lg:border-b-0 lg:border-r`}><div className="border-b p-3 sm:p-4"><div className="mb-3 flex items-center justify-between"><b className="text-sm">Conversation inbox</b><span className="text-xs text-muted-foreground">{threads.length} users</span></div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search candidates or messages" className="pl-9"/></div></div>
        <div className="h-[calc(100%-85px)] overflow-y-auto p-2">{loading?<div className="grid h-40 place-items-center"><Loader2 className="h-6 w-6 animate-spin"/></div>:filtered.length===0?<div className="p-10 text-center text-sm text-muted-foreground">No support conversations found.</div>:filtered.map((thread)=><button key={thread.userId} onClick={()=>setSelected(thread)} className={`mb-1 flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${selected?.userId===thread.userId?'bg-blue-600 text-white shadow-md':'hover:bg-muted'}`}><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${selected?.userId===thread.userId?'bg-white/15':'bg-blue-50 text-blue-600'}`}><UserRound className="h-4 w-4"/></span><span className="min-w-0 flex-1"><b className="block truncate text-sm">{thread.displayName||thread.email}</b><small className={`block truncate ${selected?.userId===thread.userId?'text-blue-100':'text-muted-foreground'}`}>{thread.lastMessage||'No message preview'}</small><small className={`mt-1 block ${selected?.userId===thread.userId?'text-blue-200':'text-muted-foreground'}`}>{safeDate(thread.lastMessageAt)}</small></span>{thread.unread>0&&<span className="grid min-w-5 h-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{thread.unread}</span>}</button>)}</div>
      </aside>
      <section className={`${selected?'flex':'hidden lg:flex'} h-full min-h-0 min-w-0 flex-col`}>{!selected?<div className="grid flex-1 place-items-center text-center"><div><span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-muted"><MessageCircle className="h-6 w-6 text-muted-foreground"/></span><b>Select a conversation</b><p className="mt-1 text-sm text-muted-foreground">Choose a candidate to view and reply.</p></div></div>:<><header className="flex min-w-0 items-center gap-2 border-b p-3 sm:gap-3 sm:p-4"><button className="grid h-9 w-9 shrink-0 place-items-center rounded-full border lg:hidden" onClick={()=>setSelected(null)} aria-label="Back to conversations"><ArrowLeft className="h-4 w-4"/></button><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white sm:h-11 sm:w-11"><UserRound className="h-5 w-5"/></span><div className="min-w-0"><b className="block truncate text-sm">{selected.displayName||selected.email}</b><p className="truncate text-xs text-muted-foreground">{selected.email}</p></div><Button variant="outline" size="sm" className="ml-auto shrink-0" onClick={()=>void openDetail()} disabled={detailLoading}>{detailLoading?<Loader2 className="h-4 w-4 animate-spin"/>:<Eye className="h-4 w-4 sm:mr-1.5"/>}<span className="hidden sm:inline">User details</span></Button></header><div className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden bg-muted/20 p-3 sm:p-6">{messages.length===0&&<p className="py-12 text-center text-sm text-muted-foreground">No messages in this conversation.</p>}{messages.map((message)=><div key={message.id} className={`flex ${message.senderId===user?.id?'justify-end':'justify-start'}`}><div className={`max-w-[86%] break-words rounded-2xl px-3 py-2.5 sm:max-w-[78%] sm:px-4 sm:py-3 ${message.senderId===user?.id?'rounded-br-md bg-blue-600 text-white':'rounded-bl-md border bg-card'}`}><p className="whitespace-pre-wrap text-sm leading-6">{message.message}</p><small className={`mt-1 block text-[10px] ${message.senderId===user?.id?'text-blue-100':'text-muted-foreground'}`}>{safeDate(message.createdAt)}{message.senderId===user?.id ? (message.readAt ? ' · Read' : ' · Delivered') : ''}</small></div></div>)}<div ref={endRef}/></div><footer className="border-t bg-card p-3 sm:p-4"><div className="mb-2 flex items-center justify-between gap-2"><p className="text-[10px] text-muted-foreground">Review AI drafts before sending.</p><Button variant="outline" size="sm" onClick={()=>void draftReply()} disabled={drafting||messages.length===0} className="h-8 text-[11px]">{drafting?<Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin"/>:<Sparkles className="mr-1.5 h-3.5 w-3.5 text-violet-500"/>}AI draft reply</Button></div><div className="flex items-end gap-2 sm:gap-3"><Textarea value={text} onChange={(event)=>setText(event.target.value.slice(0,4000))} onKeyDown={(event)=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();void send();}}} placeholder="Reply as superadmin…" rows={2} className="min-w-0 resize-none"/><Button onClick={()=>void send()} disabled={sending||!text.trim()} className="h-11 shrink-0 px-4 sm:px-5">{sending?<Loader2 className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>}<span className="ml-2 hidden sm:inline">Reply</span></Button></div><p className="mt-2 hidden text-[10px] text-muted-foreground sm:block">Enter to send · Shift + Enter for a new line · {text.length}/4000</p></footer></>}</section>
    </div>
    <Dialog open={!!detail} onOpenChange={(open)=>{if(!open)setDetail(null);}}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>User details</DialogTitle><DialogDescription>Account context for this support conversation.</DialogDescription></DialogHeader>{detail&&<div className="grid gap-3 text-sm sm:grid-cols-2"><div><small className="text-muted-foreground">Name</small><b className="block">{detail.displayName||'Unnamed'}</b></div><div><small className="text-muted-foreground">Email</small><b className="block break-all">{detail.email}</b></div><div><small className="text-muted-foreground">Phone</small><b className="block">{detail.phone||'—'}</b></div><div><small className="text-muted-foreground">Status</small><b className="block">{detail.online?'Online':detail.isActive?'Active · Offline':'Deactivated'}</b></div><div><small className="text-muted-foreground">Joined</small><b className="block">{safeDate(detail.createdAt)}</b></div><div><small className="text-muted-foreground">Activity</small><b className="block">{detail.cvCount} CVs · {detail.loginCount} logins</b></div><div className="sm:col-span-2"><small className="text-muted-foreground">Last login</small><b className="block">{detail.lastLogin?.at?safeDate(detail.lastLogin.at):'Never'}{detail.lastLogin?.ip?` · ${detail.lastLogin.ip}`:''}{detail.lastLogin?.country?` · ${detail.lastLogin.city||''} ${detail.lastLogin.country}`:''}</b></div><Button className="sm:col-span-2" variant="outline" onClick={()=>{window.open('/admin/users?search='+encodeURIComponent(detail.email),'_blank','noopener,noreferrer');}}>Open full user record in new tab</Button></div>}</DialogContent></Dialog>
  </div></AdminLayout>;
}
