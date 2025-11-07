/**
 * CardContainer component displays a card container.
 *
 * @param {ReactNode} children - The children of the CardContainer component.
 * @returns {JSX.Element} - The CardContainer component.
 */
const CardContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-muted rounded-xl">{children}</div>;
};

export default CardContainer;
