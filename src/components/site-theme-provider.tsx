"use client";
import { useEffect, type ReactNode } from "react";
export default function SiteThemeProvider({children}:{children:ReactNode}) {
 useEffect(()=>{
  let active=true;
  fetch("/api/site-theme").then(response=>response.ok?response.json():{theme:null}).then(({theme})=>{
   if(!active||!theme)return;
   const root=document.documentElement;
   root.style.setProperty("--color-violet",theme.primaryColor);
   root.style.setProperty("--color-cyan",theme.accentColor);
   root.style.setProperty("--color-midnight",theme.backgroundColor);
   root.style.setProperty("--background",theme.backgroundColor);
   root.style.setProperty("--site-font",theme.font);
  }).catch(()=>undefined);
  return()=>{active=false;};
 },[]);
 return <>{children}</>;
}
