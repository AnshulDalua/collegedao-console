import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { adjectives, uniqueNamesGenerator } from "unique-names-generator";
import { shallow } from "zustand/shallow";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Node } from "reactflow";

import { TempGroup } from "@/components/Core/Playground/Elements/Group";
import { usePlaygroundStore } from "@/stores/playground";
import { colors } from "@/utils/colors";

import { DraggableGroup } from "../Elements/DraggableGroup";
import { SortableOverlay } from "./DndStacks";

import type { Active } from "@dnd-kit/core";

export default function DndGroup() {
  const [active, setActive] = useState<Active | null>(null);

  const { nodes, setNodes, reactFlowWrapper, reactFlowInstance } =
    usePlaygroundStore(
      (state) => ({
        nodes: state.nodes,
        setNodes: state.setNodes,
        reactFlowWrapper: state.reactFlowWrapper,
        reactFlowInstance: state.reactFlowInstance,
      }),
      shallow
    );

  const color = useMemo(
    () =>
      colors[Math.floor(Math.random() * colors.length)] || "rgb(88,193,249)",
    [colors, nodes]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const placeGroup = useCallback(
    (event: DragEndEvent) => {
      const { active, delta, activatorEvent } = event;
      setActive(null);

      const reactFlowBounds =
        reactFlowWrapper?.current?.getBoundingClientRect();

      // early return if we do not have what we need to add a new node
      if (!reactFlowBounds || !reactFlowInstance) return;

      const defaultName = uniqueNamesGenerator({
        dictionaries: [adjectives],
        length: 1,
      });

      const newNode: Partial<Node> = {
        id: active.id as string,
        type: "grouping",
        position: { x: 0, y: 0 },
        data: {
          id: active.id,
          title: defaultName,
          color,
          items: [],
        },
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
    [reactFlowInstance, nodes, reactFlowWrapper, setNodes, color]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => {
        setActive(active);
      }}
      onDragEnd={placeGroup}
      onDragCancel={() => {
        setActive(null);
      }}
    >
      <DraggableGroup />
      {createPortal(
        <SortableOverlay>
          {active && (
            <TempGroup
              data={{
                id: "temp",
                title: "",
                color,
                items: [],
              }}
            />
          )}
        </SortableOverlay>,
        document.getElementById("overlayGroupPortal") || document.body
      )}
    </DndContext>
  );
}
