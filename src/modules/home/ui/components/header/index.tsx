import Graphic from "../../../../../components/graphic";
import MobileMenuButton from "./mobile-menu-button";
import Navbar from "./navbar";

const Header = () => {
  return (
    <header className="fixed top-3 left-3 z-50 bg-background rounded-br-[18px]">
      <div className="relative">
        <Navbar />
        {/* MOBILE TOP BAR  */}
        <div className="border-t-12 fixed top-0 left-0 w-full border-background block lg:hidden"></div>

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
