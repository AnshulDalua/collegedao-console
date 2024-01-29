import { create } from "zustand";

type Modal = {
  open: boolean;
  data?: {};
};
type Key = string;
interface ModalStore {
  modal: Map<Key, Modal>;
  set: (key: string, value: boolean, date?: {}) => void;
  get: (key: string) => boolean;
}

export const useModalStore = create<ModalStore>()((set, get) => ({
  modal: new Map(),
  set: (key, value, data) => {
    set({
      modal: new Map(get().modal).set(key, {
        open: value,
        data: data ?? get().modal.get(key)?.data,
      }),
    });
  },
  get: (key: string) => {
    return get().modal.get(key)?.open ?? false;
  },
}));

export const useModal = (key: string, modifier?: string) => {
  const KEY = modifier ? key + "_" + modifier : key;
  const set = useModalStore((state) => state.set);
  const open = useModalStore((state) => state.modal.get(KEY)?.open ?? false);
  const data = useModalStore((state) => state.modal.get(KEY)?.data) as any;

  function setOpen(value: boolean, data?: any) {
    set(KEY, value, data);
  }

  return [open, setOpen, data] as const;
};
