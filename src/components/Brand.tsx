import { Link } from "react-router-dom";
import { useSiteContent } from "@/contexts/SiteContentContext";

const Brand = ({ onClick, centered = false }: { onClick?: () => void; centered?: boolean }) => {
  const { content } = useSiteContent();
  return (
  <Link to="/" onClick={onClick} aria-label="FOICE & FILME — Início"
    className={`brand inline-flex min-w-0 items-center gap-1.5 sm:gap-2 ${centered ? "justify-center" : ""}`}>
    <img src="/logo-cover.png" alt="" aria-hidden="true" className="h-10 w-[60px] -translate-y-[3px] shrink-0 object-contain sm:h-14 sm:w-[84px]" />
    <span className="brand-copy grid min-w-0 justify-items-center gap-0.5 text-center">
      <span className="brand-name block whitespace-nowrap text-base leading-none sm:text-2xl sm:leading-none">FOICE <span className="text-white">&</span> FILME</span>
      <span className="block max-w-[190px] truncate text-[0.5rem] font-medium leading-none text-white/65 sm:max-w-[280px] sm:text-[0.625rem] sm:leading-none">{content.appearance.slogan}</span>
    </span>
  </Link>
); };

export default Brand;
