import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ModalerProps {
  set: (open: boolean) => void;
  open: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Modaler(props: ModalerProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.set}>
      <DialogContent className={props.className}>
        <>{props.children}</>
      </DialogContent>
    </Dialog>
  );
}
