import React from "react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DndGroup from "./DndGroup";
import DndStacks from "./DndStacks";

export default function Menu(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props}>
      <Tabs defaultValue="components">
        <TabsList className="w-full">
          <TabsTrigger value="components" className="w-full">
            Components
          </TabsTrigger>
          <TabsTrigger value="inspector" className="w-full" disabled>
            Inspector
          </TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <ScrollArea>
            <div className="flex h-full max-h-screen w-fit flex-col gap-2">
              <span className=" text-sm font-medium text-light-gray dark:text-dark-gray">
                Layout
              </span>
              <DndGroup />
              <span className="pt-2 text-sm font-medium text-light-gray dark:text-dark-gray">
                Stacks
              </span>
              <DndStacks />

              {/* Ignore, for hovering portals */}
              <div id="overlayPortal" />
              <div id="overlayGroupPortal" />
            </div>
            <ScrollBar />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="inspector"></TabsContent>
      </Tabs>
    </div>
  );
}
