import type { ReactNode } from "react";
import PublicSiteChrome from "@/components/public-site-chrome";

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <PublicSiteChrome>{children}</PublicSiteChrome>;
}
