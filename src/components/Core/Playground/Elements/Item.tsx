import get from "lodash/get";
import { match, P } from "ts-pattern";
import { shallow } from "zustand/shallow";
import { useContext, useMemo } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import Image from "next/image";

import {
  GenericRow,
  GenericRowTitle,
  GenericRowValue,
} from "@/components/Services/Generics";
import {
  engineToEngine,
  storageToStorage,
  typeToType,
} from "@/components/Services/Util";
import { Card } from "@/components/ui/card";
import { usePlaygroundStore } from "@/stores/playground";
import { StackItem } from "@/types/playground";
import { cn } from "@/utils/cn";

import { SortableItemContext } from "./DraggableItem";
import DragHandle from "./DragHandle";

export function Item({
  data,
  displayHandle,
}: NodeProps<StackItem> & { displayHandle?: boolean; sideHandles?: boolean }) {
  const { attributes, listeners, ref } = useContext(SortableItemContext);
  const { onConnect, constants } = usePlaygroundStore(
    (state) => ({
      onConnect: state.onConnect,
      constants: state.constants,
    }),
    shallow
  );

  const [stackTitle, imageSrc] = useMemo(() => {
    const [provider, type] = data?.type.split("::");
    const [title, imageKey] = match([provider, type])
      .with(["aws", "storage"], () => {
        const temp = storageToStorage(provider);
        return ["S3", `logos:${temp}`];
      })
      .with(["gcp", "storage"], () => {
        const temp = storageToStorage(provider);
        return ["Cloud Storage", `logos:${temp}`];
      })
      .with([P.string, "database"], () => {
        const temp = engineToEngine(
          get(data, "input.engine") ?? get(data, "input.image") ?? ""
        );
        return [temp, `skill-icons:${temp.toLowerCase()}-dark`];
      })
      .with([P.string, "instance"], () => {
        const temp = typeToType(
          get(data, "input.imageType") ?? get(data, "input.image") ?? ""
        );
        return [temp, `logos:${temp.toLowerCase()}`];
      })
      .otherwise(() => [
        "Unknown",
        `skill-icons:${provider!.toLowerCase()}-dark`,
      ]);
    return [
      title,
      `https://api.iconify.design/${imageKey}.svg?color=%23888888`,
    ];
  }, [data.type]);

  return (
    <Card
      className={cn(
        "flex flex-row items-center gap-[4px] rounded-[8px] bg-light-primary p-3 pl-1 text-sm  shadow-sm dark:bg-dark-tertiary",
        !displayHandle && "pl-3"
      )}
      style={{
        width: constants.itemWidth,
        height: constants.itemHeight,
        boxShadow:
          "0px 0px 0px 0px #000, 0px 0px 0px 1px rgba(0, 0, 0, 0.06), 0px 1px 0px 0px rgba(0, 0, 0, 0.08), 0px 2px 2px 0px rgba(0, 0, 0, 0.04), 0px 3px 3px 0px rgba(0, 0, 0, 0.02), 0px 4px 4px 0px rgba(0, 0, 0, 0.01)",
      }}
    >
      {displayHandle ? (
        <DragHandle attributes={attributes} listeners={listeners} ref={ref} />
      ) : (
        <>
          <Handle
            type="source"
            position={Position.Top}
            id="a"
            onConnect={onConnect}
            isConnectable={true}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="b"
            onConnect={onConnect}
            isConnectable={true}
          />
        </>
      )}
      <Image
        src={imageSrc}
        height={36}
        width={36}
        alt={data.type.toLowerCase()}
        className="mr-4 h-[36px] w-[36px] rounded-md"
        unoptimized
      />
      <GenericRow className="w-[50px] pb-1 md:w-[100px]">
        <GenericRowTitle>{stackTitle}</GenericRowTitle>
        <GenericRowValue className="font-medium leading-none tracking-tight">
          {data.name}
        </GenericRowValue>
      </GenericRow>
    </Card>
  );
}
