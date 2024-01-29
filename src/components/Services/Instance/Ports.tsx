import { toast } from "sonner";

import { TrashIcon } from "@/components/Icones";
import {
  AdvanceCard,
  AdvanceCardDescription,
  AdvanceCardTitle,
} from "@/components/reusables/advancecard";
import { Button, onClickHandler } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWRC } from "@/hooks/useWRC";
import { wretchClient } from "@/hooks/Wretch";
import { Deferred } from "@/server/util/deferred";
import { Simplify } from "@/types/util";
import { handleFormData } from "@/utils/FormData";

import type { ResponseData as PortInfo } from "@/pages/api/services/instance/aws.port";

interface InstancePortsViewProps {
  id: string;
  provider: string;
}

export default function InstancePortsView(props: InstancePortsViewProps) {
  const {
    data: ingressRules,
    mutate,
    loading,
    error,
  } = useWRC<Simplify<PortInfo>>(
    `/api/services/instance/${props.provider}.port`,
    (chain) => chain.query({ instanceId: props.id }),
    { key: ["instance", "port", props.id] }
  );

  return (
    <AdvanceCard className="mt-4 p-4" loading={loading} error={error}>
      <AdvanceCardTitle className="p-2">Ports</AdvanceCardTitle>
      <AdvanceCardDescription className="px-2 pb-2">
        Ports are used to allow traffic to your instance. You can add ports
        below.
      </AdvanceCardDescription>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Protocol</TableHead>
            <TableHead>Ip Ranges</TableHead>
            <TableHead className="hidden">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ingressRules &&
            !("message" in ingressRules) &&
            ingressRules.map((ingress, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{ingress.from}</TableCell>
                <TableCell>{ingress.to}</TableCell>
                <TableCell>{ingress.protocol}</TableCell>
                <TableCell>{ingress.ranges?.join(", ")}</TableCell>
                <TableCell>
                  <button
                    onClick={(e) =>
                      onClickHandler(e, async () => {
                        const drom = new Deferred();
                        toast.promise(drom.promise, {
                          loading: "Removing port...",
                          success: "Port removed!",
                          error: (err) => err ?? "Failed to remove port.",
                        });

                        const request = await wretchClient()
                          .url(`/api/services/instance/${props.provider}.port`)
                          .query({
                            instanceId: props.id,
                            gcpFirewallId: ingress.id,
                            from: ingress.from ?? 0,
                            to: ingress.to ?? 0,
                          })
                          .delete()
                          .error(400, (data) => drom.reject(data.json.error))
                          .json();

                        drom.resolve(request);
                        mutate();
                      })
                    }
                  >
                    <TrashIcon />
                  </button>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <form
        className="pt-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = handleFormData(e);
          const drom = new Deferred();
          toast.promise(drom.promise, {
            loading: "Adding port...",
            success: "Port added!",
            error: (err) => err ?? "Failed to add port.",
          });

          const request = await wretchClient()
            .url(`/api/services/instance/${props.provider}.port`)
            .query({ instanceId: props.id, from: data.from, to: data.to })
            .post()
            .error(400, (data) => drom.reject(data.json.error))
            .json();

          drom.resolve(request);

          mutate();
          (e.target as any).reset();
        }}
      >
        <AdvanceCardTitle>Add Port</AdvanceCardTitle>
        <AdvanceCardDescription className="py-2">
          Add a port to allow traffic to your instance.
        </AdvanceCardDescription>
        <div className="flex flex-row items-center gap-2">
          <Input type="number" name="from" placeholder="From" />
          <Input type="number" name="to" placeholder="To" />
        </div>
        <Button className="mt-4" variant="secondary" type="submit">
          Add Port
        </Button>
      </form>
    </AdvanceCard>
  );
}
