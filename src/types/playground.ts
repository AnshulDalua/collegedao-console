import { DraggableSyntheticListeners } from "@dnd-kit/core";
import { z } from "zod";

import type { ResponseData } from "@/pages/api/stack/list";

export type Stack = ResponseData;
export type StackItem = Stack[number];

export type GroupType = {
  id: string;
  title: string;
  color: string;
  items: Stack;
};

export interface DragHandleContext {
  attributes: Record<string, any>;
  listeners: DraggableSyntheticListeners;
  ref(node: HTMLElement | null): void;
}

export const playgroundData = z.object({
  edges: z.array(
    z.object({
      source: z.string(),
      sourceHandle: z.string(),
      target: z.string(),
      targetHandle: z.string(),
      id: z.string(),
    })
  ),
  nodes: z.array(
    z.object({
      id: z.string(),
      data: z.object({
        id: z.string(),
        title: z.string().optional(),
        type: z.string().optional(),
        color: z.string().optional(),
        items: z
          .array(
            z.object({
              id: z.string(),
            })
          )
          .optional(),
      }),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
      parentNode: z.string().optional(),
      type: z.string().optional(),
    })
  ),
});

export type PlaygroundData = z.infer<typeof playgroundData>;
