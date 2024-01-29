import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { PlaygroundNetwork } from "@/components/Icones";
import {
  GenericRow,
  GenericRowTitle,
  GenericRowValue,
} from "@/components/Services/Generics";
import { Card } from "@/components/ui/card";
import { rhoIdGenerator } from "@/utils/id";

import DragHandle from "./DragHandle";

export function DraggableGroup() {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    setActivatorNodeRef,
    isDragging,
  } = useDraggable({
    id: rhoIdGenerator(),
  });
  const style = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <Card
      className="flex w-[300px] flex-row items-center gap-[4px] rounded-lg  bg-light-primary py-3 pl-1 dark:bg-dark-tertiary"
      style={style}
      ref={setNodeRef}
    >
      <DragHandle
        attributes={attributes}
        listeners={listeners}
        ref={setActivatorNodeRef}
      />
      <div className="mr-4 flex min-h-[32px] min-w-[32px] items-center justify-center rounded-sm bg-light-secondary dark:bg-dark-secondary">
        <PlaygroundNetwork width={4} height={4} className=" h-4 w-4" />
      </div>

      <GenericRow className="pb-1">
        <GenericRowTitle>Section</GenericRowTitle>
        <GenericRowValue className="font-normal leading-none tracking-tight">
          Node providing a colored background to organize infrastructure.
        </GenericRowValue>
      </GenericRow>
    </Card>
  );
}
