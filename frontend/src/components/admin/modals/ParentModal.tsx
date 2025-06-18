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
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ChevronDown } from "lucide-react";
import { Parent } from "@/lib/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

interface CreateParentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

interface EditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  selectedParent: Parent | null;
}

export function CreateParentModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  isLoading,
}: CreateParentModalProps) {
  console.log("on create parent modal");
  useEffect(() => {
    if (!open) {
      form.resetField("fullName");
      form.resetField("phoneNumber");
      form.resetField("address");
      form.clearErrors();
    }
  }, [open, form]);
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
              <Button type="submit" disabled={isLoading}>
                Create Parent
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function EditModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  isLoading,
  selectedParent,
}: EditModalProps) {
  console.log("selectedParent: ", selectedParent);

  if (!form.control) {
    console.error("Form control is undefined");
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Parent</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
              name="children"
              render={({ field }) => {
                console.log("Field value:", field.value);
                console.log(
                  "Selected parent children: ",
                  selectedParent?.children
                );

                const children = selectedParent?.children || [];
                if (!selectedParent?.children)
                  return <p>No children available</p>;
                return (
                  <FormItem>
                    <FormLabel>Children</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          Children
                          <ChevronDown />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search children..." />
                          <CommandEmpty>
                            {children.length === 0
                              ? "No children available"
                              : "No children selected"}
                          </CommandEmpty>
                          <CommandGroup>
                            {children?.map((child) => {
                              console.log("child: ", child);
                              return (
                                <CommandItem
                                  key={child.id}
                                  value={child.id}
                                  onSelect={() => {
                                    const isSelected = field.value?.includes(
                                      child.id
                                    );
                                    let newValue = field.value || [];
                                    if (isSelected) {
                                      newValue = newValue.filter(
                                        (id: string) => id !== child.id
                                      );
                                    } else {
                                      newValue = [...newValue, child.id];
                                    }
                                    field.onChange(newValue);
                                  }}
                                >
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={
                                        field.value?.includes(child.id) || false
                                      }
                                      readOnly
                                      className="mr-2"
                                    />
                                    <span>{child.name}</span>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
