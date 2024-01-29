import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createContext, CSSProperties, useMemo } from "react";

import { DragHandleContext, StackItem } from "@/types/playground";

import { Item } from "./Item";

export const SortableItemContext = createContext<DragHandleContext>({
  attributes: {},
  listeners: undefined,
  ref() {},
});

export function DraggableItem({ data }: { data: StackItem }) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id: data.id,
    transition: {
      duration: 250,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef]
  );

  return (
    <SortableItemContext.Provider value={context}>
      <div ref={setNodeRef} style={style}>
        <Item
          data={data}
          type={"item"}
          id={data.id}
          selected={false}
          zIndex={0}
          isConnectable={false}
          xPos={0}
          yPos={0}
          dragging={false}
          displayHandle={true}
        />
      </div>
    </SortableItemContext.Provider>
  );
}
