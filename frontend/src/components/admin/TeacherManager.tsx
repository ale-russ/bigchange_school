import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { User } from "@/lib/types";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import Loader from "../common/Loader";

const editSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "teacher"]),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 3 characters"),
});

type EditFormValues = z.infer<typeof editSchema>;

export default function TeacherManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "teacher",
      phoneNumber: "",
      address: "",
    },
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("response: ", response.data);
        setUsers(response.data);
      } catch (err) {
        toast.error("Failed to fetch students");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedTeacher) {
      editForm.reset({
        name: selectedTeacher.name,
        email: selectedTeacher.email,
        role: selectedTeacher.role as "admin" | "teacher",
        phoneNumber: selectedTeacher.phoneNumber,
        address: selectedTeacher.address,
      });
    }
  }, [selectedTeacher, editForm]);

  const handleEdit = (user: User) => {
    setSelectedTeacher({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber || "",
      address: user.address || "",
    });
    setEditOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedTeacher(user);
    setDeleteOpen(true);
  };

  const onEditSubmit = async (data: EditFormValues) => {
    if (!selectedTeacher) return;
    setIsLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/users/${selectedTeacher.id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Updated ${data.name}`);
      setEditOpen(false);

      setUsers((prevUser) =>
        prevUser.map((user) =>
          user.id === selectedTeacher.id ? { ...user, ...data } : user
        )
      );
      // Refresh data (e.g., refetch from API)
    } catch (error: any) {
      console.log("Error: ", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to update ${selectedTeacher.name}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedTeacher) return;
    setIsLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/users/${selectedTeacher.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove deleted use from state
      setUsers((prevUser) =>
        prevUser.filter((user) => user.id !== selectedTeacher.id)
      );

      toast.success(`Deleted ${selectedTeacher.name}`);
      setDeleteOpen(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          `Failed to delete ${selectedTeacher.name}`
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Address</TableHead>
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
          ) : (
            <>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.address}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(user)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
      </Table>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>Edit Teacher/Admin</DialogTitle>
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
              />
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <select
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(e.target.value as "admin" | "teacher")
                        }
                        className="w-full p-2 border rounded"
                      >
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
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
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete {selectedTeacher?.name}? This
              action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
