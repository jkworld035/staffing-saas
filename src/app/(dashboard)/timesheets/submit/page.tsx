import { Topbar } from "@/components/layout/Topbar";
import { TimesheetForm } from "@/components/timesheets/TimesheetForm";
import { createClient } from "@/lib/supabase/server";

async function getOptions() {
  try {
    const supabase = await createClient();
    const [consultantsRes, clientsRes] = await Promise.all([
      supabase.from("consultants").select("id, consultant_name, client_id").eq("is_active", true).order("consultant_name"),
      supabase.from("clients").select("id, client_name").eq("is_active", true).order("client_name"),
    ]);

    return {
      consultants: (consultantsRes.data ?? []).map((c) => ({
        id: c.id,
        label: c.consultant_name,
        clientId: c.client_id ?? "",
      })),
      clients: (clientsRes.data ?? []).map((c) => ({ id: c.id, label: c.client_name })),
    };
  } catch {
    return { consultants: [], clients: [] };
  }
}

export default async function SubmitTimesheetPage() {
  const { consultants, clients } = await getOptions();

  return (
    <>
      <Topbar title="Submit timesheet" />
      <div className="p-6">
        <TimesheetForm consultants={consultants} clients={clients} />
      </div>
    </>
  );
}
