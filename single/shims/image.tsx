import type { ImgHTMLAttributes } from "react";
import { withBase } from "./assets";
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src: string; fill?: boolean; priority?: boolean; sizes?: string };
export default function Image({ src, fill, priority, sizes: _sizes, alt = "", style, ...rest }: Props) {
  return <img src={withBase(src)} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async"
    style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style} {...rest} />;
}
