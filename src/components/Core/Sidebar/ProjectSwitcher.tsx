import { toast } from "sonner";
import {
  CaretSortIcon,
  CheckIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";
import * as React from "react";
import { useState } from "react";

import { LoadingSmall } from "@/components/Loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAccountStore } from "@/stores/account";
import { useModal } from "@/stores/modal";
import { newProject } from "@/utils/api";
import { cn } from "@/utils/cn";
import { formDataToObject } from "@/utils/FormData";

export default function ProjectSwitcher() {
  const [_, setOpenUserMenu] = useModal("userMenu");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] =
    useModal("newProject");
  const currentProject = useAccountStore((state) => state.currentProject);
  const setCurrentProject = useAccountStore((state) => state.setCurrentProject);
  const projects = useAccountStore((state) => state.projects);
  const refresh = useAccountStore((state) => state.refreshUser);
  const [selectedProject, setSelectedProject] = useState<string>(
    currentProject?.id ?? ""
  );

  return (
    <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex flex-1 cursor-pointer items-center justify-between">
            <div className="flex flex-1 items-center text-sm">
              <Avatar className="mr-2 h-5 w-5 rounded-md">
                <AvatarImage
                  src={`https://source.boringavatars.com/marble/160/${currentProject?.id}?square`}
                />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
              {currentProject?.name}
            </div>
            <CaretSortIcon className="ml-2 h-4 w-4" />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[220px] p-0"
          sideOffset={20}
          align="start"
          side="right"
          hideWhenDetached
        >
          <Command>
            <CommandList>
              <CommandInput placeholder="Search projects..." />
              <CommandEmpty>No projects found.</CommandEmpty>
              <CommandGroup heading={"Personal Accounts"}>
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    onSelect={() => {
                      setSelectedProject(project.id);
                      setOpen(false);
                      setOpenUserMenu(false);
                      setCurrentProject(project);
                    }}
                    className="text-sm"
                  >
                    <Avatar className="mr-2 h-5 w-5 rounded-md">
                      <AvatarImage
                        src={`https://source.boringavatars.com/marble/160/${project?.id}?square`}
                      />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    {project.name}
                    <CheckIcon
                      className={cn(
                        "ml-auto h-4 w-4",
                        selectedProject === project.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem onSelect={() => setShowNewProjectDialog(true)}>
                    <PlusCircledIcon className="mr-2 h-5 w-5" />
                    Create Project
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const data = formDataToObject(e.target) as any;
            const response = await newProject(data.name);
            setOpen(false);
            setShowNewProjectDialog(false);
            setLoading(false);

            if (!response.ok)
              return toast.error("Something went wrong creating a project.", {
                description: response.error ?? "Please try again later.",
              });

            toast.success("Project created successfully.");
            await refresh();
            setCurrentProject(response.data as any);
          }}
        >
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              Add a new project to your account. Teams coming soon.
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input id="name" name="name" placeholder="Acme Inc." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewProjectDialog(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {loading && (
                <LoadingSmall className="-ml-1 mr-2 h-3 w-3 animate-spin text-white dark:text-black" />
              )}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
