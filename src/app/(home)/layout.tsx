import Header from "@/modules/home/ui/components/header";

const HomeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      <main className="h-screen p-3">{children}</main>
    </>
  );
};

export default HomeLayout;
