import { DashboardView } from "@/modules/dashboard/ui/views/dashboard-view";

const page = async () => {
  return (
    <div className="py-4 px-4 md:px-8 flex flex-col gap-y-8">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground ">
          See your photos, travel history, and more.
        </p>
      </div>
      <DashboardView />
    </div>
  );
};

export default page;
