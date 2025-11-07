export const metadata = {
  title: "Profile",
  description: "Profile",
};

const page = () => {
  return (
    <div className="py-4 px-4 md:px-8 flex flex-col gap-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground ">Manage your profile</p>
      </div>
    </div>
  );
};

export default page;
