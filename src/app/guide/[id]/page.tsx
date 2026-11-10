import { notFound } from "next/navigation";
import { listings, listingById } from "@/lib/listings";
import { hasGuide } from "@/lib/guide";
import { GuideView } from "@/components/guide/guide-view";
import { site } from "@/data/site";

export function generateStaticParams() { return listings.filter(hasGuide).map((l) => ({ id: l.id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const l = listingById(decodeURIComponent((await params).id));
  return { title: l ? `راهنمای اقدام ${l.title} | ${site.name}` : site.name };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = decodeURIComponent((await params).id);
  const l = listingById(id);
  if (!l || !hasGuide(l)) notFound();
  return <GuideView id={id} />;
}
