import React from "react";
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
import { Class, Student, User } from "@/lib/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

interface ClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  selectedClass: Class | null;
  mode: "create" | "edit";
  students: Student[];
  // users: User[];
  users: { id: string; name: string }[];
}

export function ClassModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  isLoading,
  selectedClass,
  mode,
  students,
  users,
}: ClassModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Class" : "Edit Class"}
          </DialogTitle>
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
                    <Input placeholder="Enter class name" {...field} />
                  </FormControl>
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
                    <Input
                      placeholder="Enter level (e.g., Level 1)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teachers</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {field.value
                          ? users.find((user) => user.id === field.value)
                              ?.name || "Select teacher"
                          : "Select teacher"}
                        <ChevronDown />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                      <Command>
                        <CommandInput placeholder="Search teacher..." />
                        <CommandEmpty>No Teacher found</CommandEmpty>
                        <CommandGroup>
                          {users.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.name}
                              onSelect={() => {
                                field.onChange(user.id);
                              }}
                            >
                              <div className="flex items-center space-x-2 w-full">
                                <input
                                  type="radio"
                                  checked={field.value === user.id}
                                  onChange={() => field.onChange(user.id)}
                                  readOnly
                                  className="mr-2"
                                />
                                <span>{user.name}</span>
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
              name="studentIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Students</FormLabel>
                  {mode === "edit" && selectedClass ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          {field.value && field.value.length > 0
                            ? students
                                .filter((student) =>
                                  field.value.includes(student.id)
                                )
                                .map((student) => student.name)
                                .join(", ")
                            : "Select students"}
                          <ChevronDown />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className=" p-0 w-(--radix-popover-trigger-width)">
                        <Command>
                          <CommandInput placeholder="Search students..." />
                          <CommandEmpty>No students found.</CommandEmpty>
                          <CommandGroup>
                            {students.map((student) => (
                              <CommandItem
                                key={student.id}
                                value={student.name}
                                onSelect={() => {
                                  const isSelected = field.value?.includes(
                                    student.id
                                  );
                                  let newValue = field.value || [];
                                  if (isSelected) {
                                    newValue = newValue.filter(
                                      (id: string) => id !== student.id
                                    );
                                  } else {
                                    newValue = [...newValue, student.id];
                                  }
                                  field.onChange(newValue);
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={
                                      field.value?.includes(student.id) || false
                                    }
                                    readOnly
                                    className="mr-2"
                                  />
                                  <span>{student.name}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <FormControl>
                      <Input
                        placeholder="Enter student IDs (e.g., id1,id2,id3)"
                        value={field.value?.join(",") || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value.split(","))
                        }
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {mode === "create" ? "Create" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
