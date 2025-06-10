import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Student, Class, Parent } from "@/lib/types";
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
import { ChevronDown, Plus } from "lucide-react";
import { useStudentManager } from "@/hooks/useStudentManager";
import { toast } from "sonner";
import Loader from "../common/Loader";

interface StudentManagerProps {
  searchQuery: string;
}

export default function StudentManager({ searchQuery }: StudentManagerProps) {
  const {
    students,
    classes,
    parents,
    createOpen,
    createParentOpen,
    editOpen,
    deleteOpen,
    selectedStudent,
    isLoading,
    editForm,
    createForm,
    createParentForm,
    handleEdit,
    handleDelete,
    onEditSubmit,
    onDeleteConfirm,
    onCreateSubmit,
    onCreateParentSubmit,
    setEditOpen,
    setDeleteOpen,
    setCreateOpen,
    setCreateParentOpen,
  } = useStudentManager(searchQuery);

  return (
    <>
      <div className="mb-4 flex flex-1 justify-end">
        <Button onClick={() => setCreateOpen(true)}>Create Student</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Parents</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Loader />
              </TableCell>
            </TableRow>
          ) : students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>No students found.</TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.phoneNumber || "N/A"}</TableCell>
                <TableCell>
                  {student.parentIds
                    .map((id) => parents.find((p) => p.id === id)?.fullName)
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </TableCell>
                <TableCell>{student.level || "N/A"}</TableCell>
                <TableCell>{student.address || "N/A"}</TableCell>
                <TableCell>{student.class?.name || "Unassigned"}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => handleEdit(student)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(student)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Student</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
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
                control={createForm.control}
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
                control={createForm.control}
                name="parents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parents (min 1, max 2)</FormLabel>
                    <div className="flex space-x-2">
                      <div className="w-full">
                        <Popover>
                          <PopoverTrigger asChild className="w-1/3">
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                            >
                              {field.value && field.value.length > 0
                                ? field.value
                                    .map(
                                      (id) =>
                                        parents.find((p) => p.id === id)
                                          ?.fullName
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
                                          (p) => p !== parent.id
                                        );
                                      } else if (newValue.length < 2) {
                                        newValue = [...newValue, parent.id];
                                      } else {
                                        toast.error(
                                          "Maximum 2 parents allowed"
                                        );
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
                                        checked={field.value?.includes(
                                          parent.id
                                        )}
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
                        onClick={() => setCreateParentOpen(true)}
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* <Button
                      variant="outline"
                      onClick={() => setCreateParentOpen(true)}
                      className="bg-green-600 text-white"
                      disabled={isLoading}
                    >
                      Create Parent
                    </Button> */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
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
                control={createForm.control}
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
                control={createForm.control}
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
              <DialogFooter className="flex items-center justify-between space-x-4">
                <Button type="submit" disabled={isLoading}>
                  Create Student
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Parent Modal */}
      <Dialog open={createParentOpen} onOpenChange={setCreateParentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Parent</DialogTitle>
          </DialogHeader>
          <Form {...createParentForm}>
            <form
              onSubmit={createParentForm.handleSubmit(onCreateParentSubmit)}
              className="space-y-4"
            >
              <FormField
                control={createParentForm.control}
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
              {/* <FormField
                control={createParentForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={createParentForm.control}
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
                control={createParentForm.control}
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

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
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
                                  (id) =>
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
                                      (p) => p !== parent.id
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
                                  ); // Ensure at least one parent
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
                control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
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

      {/* Delete Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete {selectedStudent?.name}? This
              action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onDeleteConfirm}
              disabled={isLoading}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
