"use client";
import { useEffect, useState, type ReactNode } from "react";

type CmsPage = { title:string; intro:string; body_markdown:string };
function MarkdownBody({ value }: { value:string }) {
  const lines=value.split(/\r?\n/);
  const nodes:ReactNode[]=[];
  let list:string[]=[];
  const flush=()=>{ if(list.length){nodes.push(<ul key={"list-"+nodes.length}>{list.map((item,i)=><li key={i}>{item}</li>)}</ul>);list=[];} };
  lines.forEach((raw,index)=>{
    const line=raw.trim();
    if(!line){flush();return;}
    if(line.startsWith("- ") || line.startsWith("* ")){list.push(line.slice(2));return;}
    flush();
    if(line.startsWith("### ")) nodes.push(<h3 key={index}>{line.slice(4)}</h3>);
    else if(line.startsWith("## ")) nodes.push(<h2 key={index}>{line.slice(3)}</h2>);
    else if(line.startsWith("# ")) nodes.push(<h2 key={index}>{line.slice(2)}</h2>);
    else nodes.push(<p key={index}>{line}</p>);
  });
  flush();
  return <div className="cms-page-body">{nodes}</div>;
}
export default function CmsPageContent({ slug, fallbackTitle, fallbackIntro, children, preserveChildren=false }:{
  slug:string; fallbackTitle:string; fallbackIntro:string; children?:ReactNode; preserveChildren?:boolean;
}) {
  const [page,setPage]=useState<CmsPage|null>(null);
  useEffect(()=>{let active=true;fetch("/api/content-pages/"+encodeURIComponent(slug)).then(r=>r.ok?r.json():{page:null}).then(data=>{if(active&&data.page)setPage(data.page);}).catch(()=>{});return()=>{active=false;};},[slug]);
  return <section className="cms-page-content">
    <p className="section-kicker">AIToolss / {slug.replace(/-/g," ").toUpperCase()}</p>
    <h1 className="mt-3 text-4xl font-black sm:text-5xl">{page?.title ?? fallbackTitle}</h1>
    <p className="section-description mt-4 max-w-3xl">{page?.intro ?? fallbackIntro}</p>
    {page ? <MarkdownBody value={page.body_markdown}/> : children}
    {page && preserveChildren ? children : null}
  </section>;
}
