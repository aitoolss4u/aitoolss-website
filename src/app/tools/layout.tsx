import type { ReactNode } from "react";
import PublicSiteChrome from "@/components/public-site-chrome";
import "./tool-detail.css";

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <PublicSiteChrome>{children}</PublicSiteChrome>;
}
