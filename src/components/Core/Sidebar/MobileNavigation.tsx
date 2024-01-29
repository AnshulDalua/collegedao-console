import { create } from "zustand";
import * as Dialog from "@radix-ui/react-dialog";
import { createContext, useContext } from "react";

import Header from "@/components/Core/Sidebar/Header";
import Navigation from "@/components/Core/Sidebar/Navigation";
import SidebarFooter from "@/components/Core/Sidebar/SidebarFooter";
import { MenuIcon, XIcon } from "@/components/Icones";

const IsInsideMobileNavigationContext = createContext(false);

export function useIsInsideMobileNavigation() {
  return useContext(IsInsideMobileNavigationContext);
}

interface MobileNavigationProps {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (isOpen: boolean) => void;
}

export const useMobileNavigationStore = create<MobileNavigationProps>(
  (set) => ({
    isOpen: false,
    setOpen: (isOpen) => set({ isOpen }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  })
);

export function MobileNavigation() {
  const isInsideMobileNavigation = useIsInsideMobileNavigation();
  const { isOpen, toggle, setOpen } = useMobileNavigationStore();
  const ToggleIcon = isOpen ? XIcon : MenuIcon;

  return (
    <div>
      <IsInsideMobileNavigationContext.Provider value={true}>
        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded-md transition hover:bg-zinc-900/5 dark:hover:bg-white/5"
          aria-label="Toggle navigation"
          onClick={toggle}
        >
          <ToggleIcon className="w-2.5 stroke-zinc-900 dark:stroke-white" />
        </button>
        {!isInsideMobileNavigation && (
          <Dialog.Root open={isOpen} onOpenChange={(v) => setOpen(v)}>
            <Dialog.Portal>
              <Dialog.Content className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="fixed inset-0 top-14 bg-zinc-400/20 backdrop-blur-sm dark:bg-black/40"
                  onClick={toggle}
                />
                <Header />
                <div className="ring-zinc-900/7.5 fixed bottom-0 left-0 top-14 w-[250px] overflow-y-auto border-r border-light-stroke bg-light-primary px-4 pb-4 pt-6 shadow-sm dark:border-dark-stroke dark:bg-dark-tertiary  sm:px-6 sm:pb-10">
                  <div className="flex h-full flex-col justify-between">
                    <Navigation />
                    <SidebarFooter className=" grid grid-cols-2 lg:hidden" />
                  </div>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </IsInsideMobileNavigationContext.Provider>
    </div>
  );
}
