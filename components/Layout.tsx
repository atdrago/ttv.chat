import { Sidebar } from "components/Sidebar";
import { useSidebarVisibleContext } from "hooks/useSidebarVisibleContext";

export const Layout = ({ children }: React.PropsWithChildren) => {
  const { isVisible } = useSidebarVisibleContext();

  return (
    <div
      className="
        h-full w-full grid
        bg-neutral-300 text-slate-800
        dark:bg-neutral-900 dark:text-slate-300
      "
      style={{
        gridTemplateColumns: isVisible
          ? "min-content minmax(0, 1fr)"
          : "minmax(0, 1fr)",
      }}
    >
      <Sidebar />
      {children}
    </div>
  );
};
