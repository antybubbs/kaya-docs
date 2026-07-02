import { redirect } from "next/navigation";
import { hasUsers } from "@/lib/user-store";
import { SetupForm } from "@/components/setup-form";

export const dynamic = "force-dynamic";

export default function SetupPage() {
  if (hasUsers()) redirect("/admin");

  return (
    <section className="admin-screen">
      <div className="container">
        <div className="section-heading compact-heading">
          <span className="eyebrow">First install</span>
          <h1>Set up Kaya Docs</h1>
          <p>Create the first administrator account. The app will generate and store its authentication key automatically.</p>
        </div>
        <SetupForm />
      </div>
    </section>
  );
}
