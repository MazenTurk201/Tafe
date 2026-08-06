
interface ThemeImageProps {
  size: number; // Width in pixels (px)
}

export default function ThemeImage({ size }: ThemeImageProps) {
  return (
    <div className="flex justify-center p-4 m-5">
      <img 
        src="/images/logo.png" 
        alt="Logo" 
        className="block dark:hidden h-auto" 
        style={{ width: `${size}px` }}
      />

      {/* Dark Mode Image */}
      <img 
        src="/images/logoDark.png" 
        alt="Logo" 
        className="hidden dark:block h-auto" 
        style={{ width: `${size}px` }}
      />
    </div>
  );
}
