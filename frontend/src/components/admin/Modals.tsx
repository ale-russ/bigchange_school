import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import { Student, Class, Parent } from "@/lib/types";

interface EditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  classes: Class[];
  parents: Parent[];
  selectedStudent: Student | null;
}

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  selectedStudent: Student | null;
}

interface CreateStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  classes: Class[];
  parents: Parent[];
  setCreateParentOpen: (open: boolean) => void;
}

interface CreateParentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export function EditModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  isLoading,
  classes,
  parents,
  selectedStudent,
}: EditModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parents (min 1, max 2)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {field.value && field.value.length > 0
                          ? field.value
                              .map(
                                (id: any) =>
                                  parents.find((p) => p.id === id)?.fullName
                              )
                              .join(", ")
                          : "Select parents"}
                        <ChevronDown />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search parent..." />
                        <CommandEmpty>No parent found.</CommandEmpty>
                        <CommandGroup>
                          {parents.map((parent) => (
                            <CommandItem
                              key={parent.id}
                              value={parent.fullName}
                              onSelect={() => {
                                const isSelected = field.value?.includes(
                                  parent.id
                                );
                                let newValue = field.value || [];
                                if (isSelected) {
                                  newValue = newValue.filter(
                                    (p: any) => p !== parent.id
                                  );
                                } else if (newValue.length < 2) {
                                  newValue = [...newValue, parent.id];
                                } else {
                                  toast.error("Maximum 2 parents allowed");
                                }
                                field.onChange(
                                  newValue.length > 0
                                    ? newValue
                                    : [parents[0].id]
                                );
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value?.includes(parent.id)}
                                  readOnly
                                  className="mr-2"
                                />
                                <span>{parent.fullName}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter level" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {classes.find((c) => c.id === field.value)?.name ||
                          "Select class"}
                        <ChevronDown />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search class..." />
                        <CommandEmpty>No class found.</CommandEmpty>
                        <CommandGroup>
                          {classes.map((cls) => (
                            <CommandItem
                              key={cls.id}
                              value={cls.name}
                              onSelect={() => field.onChange(cls.id)}
                            >
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value === cls.id}
                                  readOnly
                                  className="mr-2"
                                />
                                <span>{cls.name}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  selectedStudent,
}: DeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>
            Are you sure you want to delete {selectedStudent?.name}? This action
            cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CreateStudentModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  isLoading,
  classes,
  parents,
  setCreateParentOpen,
}: CreateStudentModalProps) {
  const [validateOnSubmit, setValidateOnSubmit] = React.useState(true);

  useEffect(() => {
    if (open && !validateOnSubmit) {
      form.clearErrors(); //Clear errors when modal opens without validations
    }
  }, [open, validateOnSubmit, form]);

  const handleCreateParentClick = () => {
    setValidateOnSubmit(false); // Disable validation temporarily
    setCreateParentOpen(true); // Open parent modal
  };
  const handleModalClose = () => {
    setValidateOnSubmit(true); // Re-enable validation when closing
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleModalClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Student</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parents (min 1, max 2)</FormLabel>
                  <div className="flex space-x-2">
                    <div className="w-full">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                          >
                            {field.value && field.value.length > 0
                              ? field.value
                                  .map(
                                    (id: any) =>
                                      parents.find((p) => p.id === id)?.fullName
                                  )
                                  .join(", ")
                              : "Select parents"}
                            <ChevronDown />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search parent..." />
                            <CommandEmpty>No parent found.</CommandEmpty>
                            <CommandGroup>
                              {parents.map((parent) => (
                                <CommandItem
                                  key={parent.id}
                                  value={parent.fullName}
                                  onSelect={() => {
                                    const isSelected = field.value?.includes(
                                      parent.id
                                    );
                                    let newValue = field.value || [];
                                    if (isSelected) {
                                      newValue = newValue.filter(
                                        (p: any) => p !== parent.id
                                      );
                                    } else if (newValue.length < 2) {
                                      newValue = [...newValue, parent.id];
                                    } else {
                                      toast.error("Maximum 2 parents allowed");
                                    }
                                    field.onChange(newValue);
                                  }}
                                >
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={field.value?.includes(parent.id)}
                                      readOnly
                                      className="mr-2"
                                    />
                                    <span>{parent.fullName}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCreateParentClick}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter level" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {classes.find((c) => c.id === field.value)?.name ||
                          "Select class"}
                        <ChevronDown />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search class..." />
                        <CommandEmpty>No class found.</CommandEmpty>
                        <CommandGroup>
                          {classes.map((cls) => (
                            <CommandItem
                              key={cls.id}
                              value={cls.name}
                              onSelect={() => field.onChange(cls.id)}
                            >
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={field.value === cls.id}
                                  readOnly
                                  className="mr-2"
                                />
                                <span>{cls.name}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateParentModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  isLoading,
}: CreateParentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Parent</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={isLoading}
                onClick={() => {
                  console.log("Button clicked");
                }}
              >
                Create Parent
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
