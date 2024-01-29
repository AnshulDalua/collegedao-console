import { toast } from "sonner";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useMutate } from "@/hooks/useMutate";
import { useModal } from "@/stores/modal";
import { destroyStack, refreshStack } from "@/utils/api";

interface DefaultActionsProps {
  mutateKey: string;
  stackId: string;
  serviceName: string;
}

export default function DefaultActions(props: DefaultActionsProps) {
  const mutate = useMutate(props.mutateKey);
  const [, setErrorOpen] = useModal("error");

  const destroyStackFunction = (id: string, forced?: boolean) => {
    toast.promise(
      destroyStack(id, forced).then(() => mutate()),
      {
        loading: `Destroying ${props.serviceName}`,
        success: `${props.serviceName} has been queued for destroy.`,
        error: (err) => err.message,
      }
    );
  };

  const refreshStackFunction = (id: string) => {
    toast.promise(
      refreshStack(id).then(() => mutate()),
      {
        loading: `Refreshing ${props.serviceName}`,
        success: `${props.serviceName} refreshed has been queued.`,
        error: (err) => err.message,
      }
    );
  };

  return (
    <>
      <DropdownMenuItem
        className="cursor-pointer text-yellow-500 hover:text-yellow-900"
        onClick={() => setErrorOpen(true, { id: props.stackId })}
      >
        View Errors
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer text-orange-500 hover:text-orange-900"
        onClick={() => refreshStackFunction(props.stackId)}
      >
        Refresh
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer text-red-600 hover:text-red-900"
        onClick={() => destroyStackFunction(props.stackId)}
      >
        Destroy
      </DropdownMenuItem>
      <DropdownMenuItem
        className="cursor-pointer text-red-800 hover:text-red-900"
        onClick={() => destroyStackFunction(props.stackId, true)}
      >
        Force Delete
      </DropdownMenuItem>
    </>
  );
}
