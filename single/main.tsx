import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { Providers } from "@/components/providers";
import Home from "@/app/page";
import { Results } from "@/components/search/results";
import { Detail } from "@/components/listing/detail";
import { Assistant } from "@/components/assistant/assistant";
import { Saved } from "@/components/saved/saved";
import { listingById } from "@/lib/listings";
import { usePathname } from "./shims/navigation";

function App() {
  const path = usePathname();
  useEffect(() => { window.scrollTo(0, 0); }, [path]);
  const id = path.startsWith("/opportunities/") ? decodeURIComponent(path.slice(15).replace(/\/$/, "")) : null;
  if (id && listingById(id)) return <Detail key={id} id={id} />;
  if (path.startsWith("/opportunities")) return <Results />;
  if (path.startsWith("/assistant")) return <Assistant />;
  if (path.startsWith("/saved")) return <Saved />;
  return <Home />;
}

createRoot(document.getElementById("root")!).render(<StrictMode><Providers><App /></Providers></StrictMode>);
