export default function PlayerWatermark() {
  return <div aria-hidden="true" className="player-watermark pointer-events-none absolute right-3 top-3 z-10 flex select-none flex-col items-center opacity-[0.28] sm:right-5 sm:top-5">
    <div className="flex items-center gap-1">
      <img src="/logo-cover.png" alt="" draggable={false} className="h-5 w-7 shrink-0 object-contain sm:h-7 sm:w-10" />
      <span className="brand-name whitespace-nowrap text-[0.625rem] leading-none sm:text-sm">FOICE <span className="text-white">&</span> FILME</span>
    </div>
    <span className="mt-0.5 text-[0.5rem] font-medium leading-none tracking-wide text-white sm:text-[0.5625rem]">foiceefilme.vercel.app</span>
  </div>;
}
