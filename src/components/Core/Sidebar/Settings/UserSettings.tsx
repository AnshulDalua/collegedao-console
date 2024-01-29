import { toast } from "sonner";

import { Button, onClickHandler } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { wretchClient } from "@/hooks/Wretch";
import { useAccountStore } from "@/stores/account";
import { useAuthStore } from "@/stores/auth";
import { useModal } from "@/stores/modal";
import { updateUser } from "@/utils/api";
import { formDataToObject } from "@/utils/FormData";

export default function ProjectSwitcher() {
  const [open, setOpen] = useModal("userSettings");
  const user = useAccountStore((state) => state.user);
  const refreshUser = useAccountStore((state) => state.refreshUser);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setOpen(false);
            const data = formDataToObject(e.target) as any;
            const response = await updateUser({ name: data.name });

            if (!response.ok)
              return toast.error("Something went wrong updating user.", {
                description: response.error ?? "Please try again later.",
              });

            toast.success("Project created successfully.");
            refreshUser();
          }}
        >
          <DialogHeader>
            <DialogTitle>Update user settings</DialogTitle>
            <DialogDescription>
              Add a new project to your account. Projects coming soon.
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  defaultValue={user?.name ?? ""}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Continue</Button>
          </DialogFooter>
        </form>

        <Button
          variant="destructive"
          onClick={(e) =>
            onClickHandler(e, async () => {
              e.preventDefault();
              const contents = await wretchClient()
                .delete("/api/auth/delete")
                .json<any>();
              if (!contents.ok && contents.error) {
                return toast.error("Something went wrong deleting the user.", {
                  description: contents.error ?? "Please try again later.",
                });
              }
              toast.success("User deleted successfully.");

              useAuthStore.getState().off();
            })
          }
        >
          Delete User
        </Button>
      </DialogContent>
    </Dialog>
  );
}
