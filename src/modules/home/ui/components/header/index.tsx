import Graphic from "../../../../../components/graphic";
import MobileMenuButton from "./mobile-menu-button";
import Navbar from "./navbar";

const Header = () => {
  return (
    <header className="fixed left-3 z-50 bg-background rounded-br-[18px]" style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
      <div className="relative">
        <Navbar />
        {/* MOBILE TOP BAR  */}
        <div className="fixed top-0 left-0 w-full bg-background block lg:hidden" style={{ height: "calc(env(safe-area-inset-top, 0px) + 12px)" }}></div>

        <div className="absolute left-0 -bottom-[18px] size-[18px]">
          <Graphic />
        </div>

        <div className="absolute top-0 -right-[18px] size-[18px]">
          <Graphic />
        </div>
      </div>

      <MobileMenuButton />
    </header>
  );
};

export default Header;
