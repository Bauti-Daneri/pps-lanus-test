import Image from "next/image";

type IconProps = {
  src: string;
  // Tamaño real del SVG exportado (muchos vienen recortados al trazo).
  width: number;
  height: number;
  // Lado de la caja donde se centra, como el frame del ícono en el Figma.
  box: number;
  className?: string;
};

// Decorativo: el texto accesible lo pone el link o botón que lo contiene.
export function Icon({ src, width, height, box, className }: IconProps) {
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{ width: box, height: box }}
    >
      <Image src={src} width={width} height={height} alt="" className={className} />
    </span>
  );
}
