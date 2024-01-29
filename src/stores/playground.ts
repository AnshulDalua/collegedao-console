import debounce from "lodash/debounce";
import { create } from "zustand";
import { RefObject } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowInstance,
} from "reactflow";

import { Stack } from "@/types/playground";
import { getPlaygroundData, updatePlayground } from "@/utils/api";

export type setter<S> = (value: S) => void;

export type PlaygroundState = {
  stack: Stack;
  nodes: Node[];
  edges: Edge[];
  toolKitItems: Stack;
  stackData: Stack;
  reactFlowWrapper: RefObject<HTMLDivElement>;
  reactFlowInstance: ReactFlowInstance | null;
  constants: {
    itemWidth: number;
    itemHeight: number;
  };
  setStack: setter<Stack>;
  setNodes: setter<Node[]>;
  setEdges: setter<Edge[]>;
  setStackData: setter<Stack>;
  setToolKitItems: setter<Stack>;
  setReactFlowInstance: setter<ReactFlowInstance>;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  findStackItemById: (searchId: string) => Partial<Node>;
};

const debounceUpdate = debounce(async (data) => {
  await updatePlayground(isolateData(data));
}, 500);

// TODO: Fix Parent node not found
// TODO:

export const usePlaygroundStore = create<PlaygroundState>((set, get) => ({
  stack: [],
  nodes: [],
  edges: [],
  stackData: [],
  toolKitItems: [],
  reactFlowInstance: null,
  reactFlowWrapper: { current: null },
  constants: {
    itemWidth: 300,
    itemHeight: 65,
  },
  setStack: (stack) => {
    set({ stack });
  },
  setNodes: (nodes) => {
    if (get().nodes.length !== nodes.length) {
      get().setToolKitItems(
        get().stack.filter((item) => !nodes.find((node) => node.id === item.id))
      );
    }
    set({ nodes });
    debounceUpdate({ nodes, edges: get().edges });
  },
  setEdges: (edges) => {
    set({ edges });
    debounceUpdate({ edges, nodes: get().nodes });
  },
  setToolKitItems: (toolKitItems: Stack) => {
    set({ toolKitItems });
  },
  setStackData: async (stackData: Stack) => {
    const { data } = await getPlaygroundData();
    const { edges, nodes } = grabData(data, stackData!);
    const items = stackData!.filter(
      (item) => !nodes.find((node) => node.id === item.id)
    );
    set({ stackData, edges, nodes, toolKitItems: items, stack: stackData });
  },
  setReactFlowInstance: (reactFlowInstance) => {
    set({ reactFlowInstance });
  },
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
    debounceUpdate({ nodes: get().nodes, edges: get().edges });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
    debounceUpdate({ nodes: get().nodes, edges: get().edges });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
    debounceUpdate({ nodes: get().nodes, edges: get().edges });
  },
  findStackItemById: (searchId: string) => {
    return (
      get().stack.filter(({ id }) => id === searchId)[0] ??
      ({} as Partial<Node>)
    );
  },
}));

export type EdgesAndNodes = {
  edges: Edge[];
  nodes: Node[];
};
function grabData({ edges, nodes }: EdgesAndNodes, stackData: Stack) {
  const rehydrateItemData = (data: Stack[0]) => {
    return stackData.find((item) => item.id === data.id) ?? null;
  };

  const data = nodes.map((node: Node) => {
    const { id, type, position, parentNode } = node;
    let data = node.data;

    if (type === "item") {
      data = rehydrateItemData(data);
      if (!data) return null;
    }

    if (type === "grouping")
      data = {
        ...data,
        items: data.items.map(rehydrateItemData).filter(Boolean),
      };

    return { id, type, position, data, parentNode };
  });

  return { edges, nodes: data.filter(Boolean) as any[] };
}

function isolateData({ edges, nodes }: EdgesAndNodes) {
  const stripItemData = (data: Node) => {
    return { id: data.id };
  };

  const data = nodes.map((node) => {
    const { id, type, position, parentNode } = node;
    let data = node.data;

    if (type === "item") data = stripItemData(data);

    if (type === "grouping") {
      data = {
        id: data.id,
        color: data.color,
        title: data.title,
        items: data.items.map(stripItemData),
      };
    }

    return { id, type, position, data, parentNode };
  });

  return { edges, nodes: data };
}
