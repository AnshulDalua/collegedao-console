import { useEffect, useRef, useState } from "react";
import { Node, NodeProps } from "reactflow";

import { PlaygroundSettings } from "@/components/Icones";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePlaygroundStore } from "@/stores/playground";
import { GroupType } from "@/types/playground";
import { cn } from "@/utils/cn";
import { colors } from "@/utils/colors";

const hGap = 22;
const vGap = 22;

export function Group({ data }: NodeProps<GroupType>) {
  const setNodes = usePlaygroundStore((state) => state.setNodes);
  const nodes = usePlaygroundStore((state) => state.nodes);
  const constants = usePlaygroundStore((state) => state.constants);
  const tookKitItems = usePlaygroundStore((state) => state.toolKitItems);
  const setToolKitItems = usePlaygroundStore((state) => state.setToolKitItems);

  useEffect(() => {
    // update nodes to have the correct parent item
    const curNodeIds = new Set(data.items.map((node) => node.id));

    // remove the nodes that are already in the group
    const updatedNodes: Node[] = nodes.filter(
      (node) => !curNodeIds.has(node.id)
    );

    // add the new nodes with potentially corrected information
    const newNodes: Node[] = data.items.map((item, i) => {
      return {
        id: item.id,
        data: item,
        type: "item",
        position: {
          x: hGap,
          y: i * (constants.itemHeight + vGap) + 22 + 6 + vGap,
        },
        parentNode: data.id,
      };
    });

    setNodes(updatedNodes.concat(newNodes as Node[]));

    // since these nodes are in the group now, remove them from the toolkit
    const nodeIds: Set<String> = new Set(
      (newNodes as Node[]).map((node) => node.id)
    );
    setToolKitItems(tookKitItems.filter((item) => !nodeIds.has(item.id)));
  }, [constants, data.items, data.id]);

  return <TempGroup data={data} />;
}

export const TempGroup = ({ data }: { data: GroupType }) => {
  const [width, setWidth] = useState(0);
  const span = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  const setNodes = usePlaygroundStore((state) => state.setNodes);
  const nodes = usePlaygroundStore((state) => state.nodes);
  const constants = usePlaygroundStore((state) => state.constants);

  useEffect(() => {
    setWidth(span.current?.clientWidth as number);
  }, [data.title]);

  const updateGroupTitle = (newTitle: string) => {
    setNodes(
      nodes.map((node) => {
        if (node.id === data.id) {
          return {
            ...node,
            data: {
              ...node.data,
              title: newTitle,
            },
          };
        }
        return node;
      })
    );
  };

  const updateGroupColor = (newColor: string) => {
    setNodes(
      nodes.map((node) => {
        if (node.id === data.id) {
          return {
            ...node,
            data: {
              ...node.data,
              color: newColor,
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <div className="flex flex-col gap-[6px] text-xs font-bold text-light-gray dark:text-dark-gray">
      {/* Header */}
      <div
        className="flex h-[22px] w-fit items-center justify-center gap-[4px] rounded-2xl py-[4px]"
        style={{ background: `${data.color}4D` }}
      >
        {/* Color Preview */}
        <div
          className="ml-[8px] h-2 w-2 rounded-[2px]"
          style={{ background: data.color }}
        />
        {/* Width calculation for Input */}
        <span
          className="line pointer-events-none absolute w-fit text-[11px] font-bold leading-[14px] opacity-0"
          ref={span}
        >
          {data.title}
        </span>
        <input
          className="line border-none bg-transparent p-0 text-[11px] font-bold leading-[14px] outline-none"
          type="text"
          value={data.title}
          onChange={(e) => updateGroupTitle(e.target.value)}
          style={{ width: width + (width < 50 ? 10 : 5), color: data.color }}
          maxLength={20}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger>
            <div className="mr-[2px] flex h-[20px] items-center justify-center  rounded-2xl bg-light-primary px-0.5 dark:bg-dark-secondary">
              <PlaygroundSettings
                className={cn(
                  "h-[18px] w-[18px] transition-transform",
                  open ? "rotate-45" : ""
                )}
                style={{ color: data.color }}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent asChild>
            <div className="text-md 2xl flex flex-col gap-2 rounded bg-light-primary p-2 dark:bg-dark-secondary">
              <div className="grid grid-cols-8 grid-rows-2 gap-4">
                {colors.map((background, i) => (
                  <button
                    className="h-3 w-3 rounded-[4px]"
                    style={{ background }}
                    onClick={() => {
                      updateGroupColor(background);
                      setOpen(false);
                    }}
                    key={i}
                  ></button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div
        className="flex flex-col gap-[8px] rounded-2xl p-[24px] text-primary mix-blend-multiply"
        style={{
          background: `${data.color}4D`,
          border: `2px dashed ${data.color}`,
          width: constants.itemWidth + hGap * 2,
          height:
            Math.max(data.items.length, 1) * (constants.itemHeight + vGap) +
            vGap,
        }}
      >
        {data.items.length === 0 && "Drag and drop stacks here to group them"}
      </div>
    </div>
  );
};
