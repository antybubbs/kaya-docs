import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminEditor } from "@/components/admin-editor";
import { hasUsers } from "@/lib/user-store";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  if (!hasUsers()) redirect("/setup");
  const session = getSession();
  return (
    <section className="admin-screen">
      <div className="container">
        <div className="section-heading compact-heading">
          <span className="eyebrow">Kaya Docs</span>
          <h1>Documentation Editor</h1>
          <p>Manage MDX pages stored in the content directory. Public docs remain readable without signing in.</p>
        </div>
        <AdminEditor initialUser={session} />
      </div>
    </section>
  );
}
