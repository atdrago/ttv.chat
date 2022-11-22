import { createContext, useContext, useState } from "react";

const SidebarVisibleContext = createContext<{
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  isVisible: false,
  setIsVisible: () => null,
});

export const useSidebarVisibleContext = () => useContext(SidebarVisibleContext);

export const SidebarVisibleProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <SidebarVisibleContext.Provider value={{ isVisible, setIsVisible }}>
      {children}
    </SidebarVisibleContext.Provider>
  );
};
