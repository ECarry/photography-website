import {
  Image as ImageIcon,
  Landmark,
  LayoutDashboard,
  Notebook,
  UserRound,
} from "lucide-react";

interface IconMapProps {
  icon: string;
}

const IconMap = ({ icon }: IconMapProps) => {
  switch (icon) {
    case "dashboard":
      return <LayoutDashboard />;
    case "photo":
      return <ImageIcon />;
    case "user":
      return <UserRound />;
    case "city":
      return <Landmark />;
    case "post":
      return <Notebook />;
    default:
      return <LayoutDashboard />;
  }
};

export default IconMap;
