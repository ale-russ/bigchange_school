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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Class } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

interface ClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  selectedClass: Class | null;
  mode: "create" | "edit";
}

export function ClassModal({
  open,
  onOpenChange,
  form,
  onSubmit,
  isLoading,
  selectedClass,
  mode,
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
                      placeholder="Enter level (e.g., Grade 1)"
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
                  <FormLabel>Teacher ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter teacher ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studentIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student IDs (comma-separated)</FormLabel>
                  {mode === "create" ? (
                    <FormControl>
                      <Input
                        placeholder="Enter student IDs (e.g., id1,id2,id3)"
                        {...field}
                        value={field.value?.join(",") || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value.split(","))
                        }
                      />
                    </FormControl>
                  ) : (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          Students
                          <ChevronDown />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="search students...." />
                          <CommandEmpty>"No Students"</CommandEmpty>
                          <CommandGroup>
                            {selectedClass?.students.map((student) => {
                              console.log("student: ", student.name);
                              return (
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
                                        field.value?.includes(student.id) ||
                                        false
                                      }
                                      readOnly
                                      className="mr-2"
                                    />
                                    <span>{student.name}</span>
                                  </div>
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}

                  {/* </FormControl> */}
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
