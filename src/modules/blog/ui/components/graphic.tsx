interface Props {
  className?: string;
}

/**
 * Graphic component displays a graphic.
 *@preview ![img](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAAAXNSR0IArs4c6QAAAOpJREFUWEftl1sKhDAMRevOdGczK1NX5nDBQtFqk5rXgP0RQenpuWm0Q0ppS7Zj2adb92u+x+0yGAFh0m8F4KRCEyhDlAaaWWgAdYFkUkmgRyCSQCIgUkAo1E+zMBgPPIlswjZlzEV6tAdINKIjJRcIMDCjNjhA4vVSWxUVyAQGgBQg9ZhKUxQgld10VYQtILOoKI3RHOauhlxg/gbIzc6VIdNd1fp0uNqpGUIbcB1lH3K3czQUDsg9rtJQCDuhgULElQ3N2r+lnD4CMzjGiB5lOAC1Tv0C3RkMGdmocQLtrSMYCgfUuxiV936tgkQl5Ns2yQAAAABJRU5ErkJggg==) - https://p.ecarry.me/components/graphic
 *
 * @param {string} className - Optional className for the component.
 * @returns {JSX.Element} - The Graphic component.
 */
const Graphic = ({ className }: Props) => {
  return (
    <div className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18">
        <path
          className="fill-background"
          d="M0 0v18C0 8.059 8.059 0 18 0Z"
        ></path>
      </svg>
    </div>
  );
};

export default Graphic;
