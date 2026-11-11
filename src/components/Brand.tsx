import { Link } from "react-router-dom";

const Brand = ({ onClick, centered = false }: { onClick?: () => void; centered?: boolean }) => (
  <Link to="/" onClick={onClick} aria-label="FOICE & FILME — Início"
    className={`brand inline-flex min-w-0 items-center gap-1.5 sm:gap-2 ${centered ? "justify-center" : ""}`}>
    <img src="/logo-cover.png" alt="" aria-hidden="true" className="h-10 w-[60px] -translate-y-[3px] shrink-0 object-contain sm:h-14 sm:w-[84px]" />
    <span className="brand-copy grid min-w-0 justify-items-center gap-0.5 text-center">
      <span className="brand-name block whitespace-nowrap text-base leading-none sm:text-2xl sm:leading-none">FOICE <span className="text-white">&</span> FILME</span>
      <span className="block whitespace-nowrap text-[8px] font-medium leading-none text-white/65 sm:text-[10px] sm:leading-none">Todas as mídias para todo povo</span>
    </span>
  </Link>
);

export default Brand;
