import { useTheme } from "next-themes";
import { MouseEvent, useCallback, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MarkerType,
  Panel,
  ReactFlowProvider,
  updateEdge,
} from "reactflow";

import { SolarShieldWarningBold } from "@/components/Icones";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePlaygroundStore } from "@/stores/playground";
import { Stack, StackItem } from "@/types/playground";

import { Group } from "./Elements/Group";
import { Item } from "./Elements/Item";

import type { Connection, Edge, Node, NodeTypes } from "reactflow";

function Playground({}: {}) {
  const nodes = usePlaygroundStore((state) => state.nodes);
  const edges = usePlaygroundStore((state) => state.edges);
  const setEdges = usePlaygroundStore((state) => state.setEdges);
  const setNodes = usePlaygroundStore((state) => state.setNodes);
  const toolKitItems = usePlaygroundStore((state) => state.toolKitItems);
  const setToolKitItems = usePlaygroundStore((state) => state.setToolKitItems);
  const onNodesChange = usePlaygroundStore((state) => state.onNodesChange);
  const onEdgesChange = usePlaygroundStore((state) => state.onEdgesChange);
  const onConnect = usePlaygroundStore((state) => state.onConnect);
  const reactFlowWrapper = usePlaygroundStore(
    (state) => state.reactFlowWrapper
  );
  const setReactFlowInstance = usePlaygroundStore(
    (state) => state.setReactFlowInstance
  );

  const { theme } = useTheme();
  const nodeTypes: NodeTypes = useMemo(
    () => ({ item: Item, grouping: Group }),
    []
  );

  // this ref stores the current dragged node
  const dragRef = useRef<Node | null>(null);

  // target is the node that the node is dragged over
  const [target, setTarget] = useState<Node | undefined>();

  const onNodeDragStart = (_: MouseEvent, node: Node) => {
    dragRef.current = node;
    setTarget(node);
  };

  const onNodeDrag = (_: MouseEvent, node: Node) => {
    // calculate the center point of the node from position and dimensions
    const centerX =
      (node.positionAbsolute?.x ?? node.position.x) + (node.width ?? 0) / 2;
    const centerY =
      (node.positionAbsolute?.y ?? node.position.y) + (node.height ?? 0) / 2;

    // find a node where the center point is inside
    const targetNode = nodes.find(
      (n) =>
        centerX > n.position.x &&
        centerX < n.position.x + (n.width ?? 0) &&
        centerY > n.position.y &&
        centerY < n.position.y + (n.height ?? 0) &&
        n.id !== node.id
    );

    setTarget(targetNode);
  };

  const onNodeDragStop = (_: MouseEvent, node: Node) => {
    // if the target is a group, add the node to the group
    if (
      target?.type === "grouping" &&
      node.type === "item" &&
      !node.parentNode
    ) {
      setNodes(
        nodes.map((n) => {
          if (n.id === target?.id) {
            n.data.items = n.data.items.concat(node.data);
          }
          return n;
        })
      );
    }

    // if the target is undefined and the node was in a group, remove it from the group and update the node's parent
    if (!target && node.parentNode) {
      setNodes(
        nodes.map((n) => {
          if (n.id === node.id) {
            console.error(
              "ERROR - Node was in a group but target was undefined"
            );
            n.parentNode = undefined;
            n.position = {
              x: n.positionAbsolute?.x ?? n.position.x,
              y: n.positionAbsolute?.y ?? n.position.y,
            };
          }
          if (n.id === node.parentNode) {
            n.data.items = n.data.items.filter(
              (item: StackItem) => item.id !== node.id
            );
          }
          return n;
        })
      );
    }

    setTarget(undefined);
    dragRef.current = null;
  };

  const onNodesDelete = (nds: Node[]) => {
    // If it was in a group, update the group's items
    nds.forEach((delNode) => {
      if (delNode.parentNode) {
        setNodes(
          nodes.map((n) => {
            if (n.id === delNode.parentNode) {
              n.data.items = n.data.items.filter(
                (item: StackItem) => item.id !== delNode.id
              );
            }
            return n;
          })
        );
      }
    });

    // Put all deleted items back in the toolkit
    const items: Stack = nds
      .filter((node) => node.type === "item")
      .map((n) => n.data);
    setToolKitItems(toolKitItems.concat(items));
  };

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      // TODO: Fix this, it doesn't work properly
      setEdges(updateEdge(oldEdge, newConnection, edges));
    },
    [edges, setEdges]
  );

  return (
    <ReactFlowProvider>
      <div className="h-full w-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges.map((edge) => ({
            ...edge,
            animated: true,
            markerEnd: {
              type: MarkerType.Arrow,
              strokeWidth: 2,
              height: 32,
            },
            markerStart: {
              type: MarkerType.Arrow,
              strokeWidth: 2,
              height: 32,
            },
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          onNodeDragStart={onNodeDragStart}
          onEdgeUpdate={onEdgeUpdate}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onNodesDelete={onNodesDelete}
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <Background
            variant={BackgroundVariant.Dots}
            size={1}
            color={theme === "dark" ? "#383838" : ""}
            gap={16}
            className="opacity-80"
          />
          <Panel position="top-center" className="pt-14">
            <Alert variant="warning">
              <SolarShieldWarningBold
                width={4}
                height={4}
                className="h-4 w-4 fill-yellow-800 dark:fill-yellow-100"
              />
              <AlertTitle>Playground in Beta</AlertTitle>
              <AlertDescription>
                This playground is still in beta. Please refresh or clear the
                playground or click support on the bottom left if you encounter
                any issues.
              </AlertDescription>
            </Alert>
          </Panel>

          <Panel position="bottom-center">
            {/* Create warning that this playground is still in beta */}
            <div className="flex flex-row gap-2">
              <Button
                className="h-6"
                variant="outline"
                onClick={() => {
                  setNodes([]);
                  setEdges([]);
                }}
              >
                Clear
              </Button>
              <Button
                className="h-6"
                variant="outline"
                onClick={() => {
                  setEdges([]);
                }}
              >
                Clear Edges
              </Button>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}

export default Playground;
