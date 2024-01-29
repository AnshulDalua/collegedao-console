import {
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { shallow } from "zustand/shallow";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Node } from "reactflow";

import { usePlaygroundStore } from "@/stores/playground";

import { DraggableItem } from "../Elements/DraggableItem";

import type { Active, DropAnimation } from "@dnd-kit/core";
import type { PropsWithChildren } from "react";

export default function DndStacks() {
  const {
    nodes,
    setNodes,
    toolKitItems,
    findStackItemById,
    setToolKitItems,
    reactFlowWrapper,
    reactFlowInstance,
  } = usePlaygroundStore(
    (state) => ({
      nodes: state.nodes,
      setNodes: state.setNodes,
      toolKitItems: state.toolKitItems,
      findStackItemById: state.findStackItemById,
      setToolKitItems: state.setToolKitItems,
      reactFlowWrapper: state.reactFlowWrapper,
      reactFlowInstance: state.reactFlowInstance,
    }),
    shallow
  );

  const [active, setActive] = useState<Active | null>(null);
  const activeItem = useMemo(
    () => toolKitItems.find((item) => item.id === active?.id),
    [active, toolKitItems]
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, delta, activatorEvent } = event;

      if (!over) {
        setToolKitItems(toolKitItems.filter(({ id }) => id !== active.id));
      } else if (active.id !== over?.id) {
        const activeIdx = toolKitItems.findIndex(({ id }) => id === active.id);
        const overIdx = toolKitItems.findIndex(({ id }) => id === over.id);

        return setToolKitItems(arrayMove(toolKitItems, activeIdx, overIdx));
      } else if (active && over) {
        return;
      }

      setActive(null);

      const item = findStackItemById(active.id as string);
      const reactFlowBounds =
        reactFlowWrapper?.current?.getBoundingClientRect();

      // early return if we do not have what we need to add a new node
      if (!item || !reactFlowBounds || !reactFlowInstance) return;

      const newNode: Partial<Node> = {
        id: item.id,
        data: item,
        type: "item",
      };

      const scale = reactFlowInstance.getZoom();

      const x =
        (activatorEvent as PointerEvent).x +
        delta.x -
        reactFlowBounds.left -
        8 * scale;
      const y =
        (activatorEvent as PointerEvent).y +
        delta.y -
        reactFlowBounds.top -
        30 * scale;

      newNode.position = reactFlowInstance.project({
        x,
        y,
      });

      setNodes(nodes.concat(newNode as Node));
    },
    [
      reactFlowInstance,
      toolKitItems,
      nodes,
      reactFlowWrapper,
      findStackItemById,
      setNodes,
      setToolKitItems,
    ]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => {
        setActive(active);
      }}
      onDragEnd={onDragEnd}
      onDragCancel={() => {
        setActive(null);
      }}
    >
      <SortableContext items={toolKitItems}>
        {toolKitItems.map((item, i) => {
          return <DraggableItem key={i} data={item} />;
        })}
      </SortableContext>
      {createPortal(
        <SortableOverlay>
          {activeItem && <DraggableItem data={activeItem} />}
        </SortableOverlay>,
        document.getElementById("overlayPortal") || document.body
      )}
    </DndContext>
  );
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

export function SortableOverlay({ children }: PropsWithChildren<{}>) {
  return (
    <DragOverlay dropAnimation={dropAnimationConfig}>{children}</DragOverlay>
  );
}
