import { createContext, useContext, useRef, type ComponentProps, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useActiveIndicator } from "./glass-tab-bar-utils/use-active-indicator";
import { LiquidGlass } from "./glass-tab-bar-utils/liquid-glass";

const TabBarContext = createContext<string | undefined>(undefined);

function GlassTabBar({ className, children, value, ...props }: ComponentProps<"nav"> & { value?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useActiveIndicator(ref, '[aria-current="page"]', value);

  return (
    <TabBarContext.Provider value={value}>
      <nav data-slot="glass-tab-bar" className={cn("glass-tab-bar", className)} {...props}>
        <LiquidGlass>
          <div ref={ref} className="glass-tab-bar-list">
            {rect && <div aria-hidden="true" className="glass-tab-bar-indicator" style={rect} />}
            {children}
          </div>
        </LiquidGlass>
      </nav>
    </TabBarContext.Provider>
  );
}

function GlassTabBarItem({ className, value, icon, label, ...props }: Omit<ComponentProps<typeof Link>, "children"> & {
  value: string; icon: ReactNode; label: string;
}) {
  const current = useContext(TabBarContext);
  return (
    <Link data-slot="glass-tab-bar-item" aria-current={current === value ? "page" : undefined}
      className={cn("glass-tab-bar-item", className)} {...props}>
      {icon}<span>{label}</span>
    </Link>
  );
}

export { GlassTabBar, GlassTabBarItem };
export default GlassTabBar;
