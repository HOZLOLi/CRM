import { db } from "@/server/db";
import { PageHeader, PageBody } from "@/components/layout/page-header";
import { ContactsView, type ContactRow } from "@/components/features/contacts-view";

export const metadata = { title: "مخاطبین" };
export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([
    db.contact.findMany({
      include: { company: true, owner: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.company.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const rows: ContactRow[] = contacts.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    mobile: c.mobile,
    title: c.title,
    tags: c.tags,
    companyName: c.company?.name ?? null,
    ownerName: c.owner?.name ?? null,
    ownerHue: c.owner?.avatarHue ?? 180,
  }));

  return (
    <>
      <PageHeader
        title="مخاطبین"
        description={`${contacts.length.toLocaleString("fa-IR")} نفر در دفترچه مخاطبین شما.`}
      />
      <PageBody>
        <ContactsView rows={rows} companies={companies} />
      </PageBody>
    </>
  );
}
