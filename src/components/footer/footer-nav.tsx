import LinkRotate from "../link-rotate";

interface Props {
  title: string;
  links: {
    title: string;
    href: string;
  }[];
}

const FooterNav = ({ title, links }: Props) => {
  return (
    <div className="flex flex-col gap-8 items-center lg:items-start">
      <h1>{title}</h1>
      <ul className="flex flex-col items-center lg:items-start gap-3 lg:gap-5 text-sm opacity-60">
        {links.map((link) => (
          <li key={link.href}>
            <LinkRotate
              link={link.href}
              label={link.title}
              className="text-text-default dark:text-text-inverse"
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FooterNav;
