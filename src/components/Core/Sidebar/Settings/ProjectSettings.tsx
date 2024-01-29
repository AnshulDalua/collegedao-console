import { toast } from "sonner";

import { Button, onClickHandler } from "@/components/ui/button";
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
import { useAccountStore } from "@/stores/account";
import { useModal } from "@/stores/modal";
import { deleteProject, updateProject } from "@/utils/api";
import { formDataToObject } from "@/utils/FormData";

export default function ProjectSwitcher() {
  const [open, setOpen] = useModal("projectSettings");
  const [openDeleteProject, setOpenDeleteProject] = useModal(
    "projectSettings",
    "delete"
  );
  const currentProject = useAccountStore((state) => state.currentProject);
  const refresh = useAccountStore((state) => state.refreshUser);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const data = formDataToObject(e.target) as any;
            const response = await updateProject(
              currentProject?.id ?? "",
              data
            );

            if (!response.ok)
              return toast.error("Something went wrong updating the project.", {
                description: response.error ?? "Please try again later.",
              });

            toast.success("Project updated successfully.");
            refresh();
            setOpen(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Update project</DialogTitle>
            <DialogDescription>Update your project settings.</DialogDescription>
          </DialogHeader>
          <div>
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Acme Inc."
                  defaultValue={currentProject?.name ?? ""}
                />
              </div>
            </div>
          </div>
          <Dialog open={openDeleteProject} onOpenChange={setOpenDeleteProject}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete project</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete project</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this project? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenDeleteProject(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={(e) =>
                    onClickHandler(e, async () => {
                      const contents = await deleteProject(
                        currentProject?.id ?? ""
                      );
                      setOpenDeleteProject(false);
                      setOpen(false);
                      if (!contents.ok && contents.error) {
                        return toast.error(
                          "Something went wrong deleting the project.",
                          {
                            description:
                              contents.error ?? "Please try again later.",
                          }
                        );
                      }

                      await refresh();
                      return toast.success("Project deleted successfully.");
                    })
                  }
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Continue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
