import { notFound } from "next/navigation";
import { listings, listingById } from "@/lib/listings";
import { Detail } from "@/components/listing/detail";

export function generateStaticParams() { return listings.map((l) => ({ id: l.id })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const l = listingById(decodeURIComponent((await params).id));
  return { title: l ? `${l.title} | هم‌سرمایه` : "هم‌سرمایه" };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const id = decodeURIComponent((await params).id);
  if (!listingById(id)) notFound();
  return <Detail id={id} />;
}
