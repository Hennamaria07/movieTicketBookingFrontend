import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserTie,
  FaMoneyBillWave,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTicketAlt,
  FaFilm,
  FaSearch,
} from "react-icons/fa";
import {
  API_ADD_USER_URL,
  API_UPDATE_USER_URL,
  API_DELETE_USER_URL,
  API_GET_THEATER_OWNERS_URL,
} from "../../utils/api";
import { MdEmail, MdStarRate } from "react-icons/md";
import { FiPhone, FiCopy, FiEdit, FiTrash2, FiX, FiPlus } from "react-icons/fi";
import { IoCheckmarkCircle, IoChevronDownOutline, IoCloseCircle } from "react-icons/io5";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// Validation schema
const getSchema = (isEdit: boolean) =>
  yup.object({
    firstName: yup.string().required("First name is required").min(2, "First name must be at least 2 characters"),
    lastName: yup.string().required("Last name is required").min(2, "Last name must be at least 2 characters"),
    userId: yup.string().required("Employee ID is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    phone: yup
      .string()
      .required("Phone number is required")
      .matches(/^[6-9]\d{9}$/, "Phone number must be a valid 10-digit Indian number"),
    image: isEdit ? yup.mixed().nullable() : yup.mixed().required("Image is required"),
    resetPassword: yup.boolean(),
    newPassword: yup.string().when("resetPassword", {
      is: true,
      then: () => yup.string().required("New password is required").min(8, "Password must be at least 8 characters"),
      otherwise: () => yup.string().notRequired(),
    }),
    changeAvatar: yup.boolean(),
    status: yup.string().oneOf(["Active", "Inactive", "Banned", "Unbanned"]).required("Status is required"),
  });

// Types
interface TheaterOwner {
  id: string;
  firstName: string;
  lastName: string;
  userId: string;
  email: string;
  phone: string;
  assignedTheaters: string[];
  status: "Active" | "Inactive" | "Banned" | "Unbanned";
  image?: string;
}

interface PendingTheater {
  id: string;
  name: string;
  location: string;
  ownerId: string;
  requestedDate: string;
}

interface SortConfig {
  key: keyof TheaterOwner | null;
  direction: "ascending" | "descending";
}

// Mock Data
const mockPendingTheaters: PendingTheater[] = [
  { id: "1", name: "Starlight Theater", location: "Downtown", ownerId: "1", requestedDate: "2025-02-20" },
];
const mockPerformanceData = [
  { month: "Jan", revenue: 50000, ratings: 4.5 },
  { month: "Feb", revenue: 60000, ratings: 4.7 },
  { month: "Mar", revenue: 75000, ratings: 4.8 },
];

// AnimatedCounter Component
const AnimatedCounter = ({ value, prefix = "", suffix = "", decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1.5;
    const incrementTime = (duration / end) * 1000;

    const timer = setInterval(() => {
      start += Math.ceil(end / (duration * 100));
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{count.toFixed(decimals)}{suffix}</span>;
};

// TheaterManagementPage Component
const TheaterManagementPage: React.FC = () => {
  const [owners, setOwners] = useState<TheaterOwner[]>([]);
  const [pendingTheaters] = useState(mockPendingTheaters);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive" | "Banned" | "Unbanned">("All");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: "ascending" });
  const [selectedOwner, setSelectedOwner] = useState<TheaterOwner | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTheaterId, setSelectedTheaterId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(getSchema(!!selectedOwner)),
    defaultValues: {
      firstName: "",
      lastName: "",
      userId: "",
      email: "",
      phone: "",
      image: null,
      resetPassword: false,
      newPassword: "",
      changeAvatar: false,
      status: "Active" as const,
    },
  });

  const resetPassword = watch("resetPassword");
  const changeAvatar = watch("changeAvatar");

  // Fetch theater owners
  useEffect(() => {
    const fetchTheaterOwners = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(API_GET_THEATER_OWNERS_URL, { withCredentials: true });
        console.log("API Response:", response.data); // Debug API response
        const fetchedOwners = (response?.data?.data || []).map((owner: any) => ({
          id: owner._id || "",
          firstName: owner.firstName || "",
          lastName: owner.lastName || "",
          userId: owner.userId || "",
          email: owner.email || "",
          phone: owner.phone || "", // Ensure phone is mapped correctly
          assignedTheaters: owner.assignedTheaters || [],
          status: owner.status || "Pending Approval",
          image: owner.avatar?.url || "",
        }));
        setOwners(fetchedOwners ?? []);
      } catch (error) {
        console.error("Failed to fetch theater owners:", error);
        setOwners([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTheaterOwners();
  }, []);

  // Password generation
  const generatePassword = (userId: string) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const base = userId.slice(-3);
    let password = base;
    for (let i = 0; i < 7; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userId = e.target.value;
    setValue("userId", userId);
    if (userId && !selectedOwner) {
      const newPassword = generatePassword(userId);
      setGeneratedPassword(newPassword);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
  };

  // Image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setValue("image", null);
      setImagePreview("");
      toast.error("Please select a valid image file");
    }
  };

  // Form submission
  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("userId", data.userId);
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("role", "theaterOwner");
    formData.append("status", data.status);

    if (data.image && (!selectedOwner || changeAvatar)) {
      if (data.image instanceof File) {
        formData.append("avatar", data.image);
      } else {
        console.error("data.image is not a File:", data.image);
        toast.error("Please select a valid image file");
        return;
      }
    }

    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      if (selectedOwner) {
        if (data.resetPassword && data.newPassword) {
          formData.append("newPassword", data.newPassword);
        }
        const response = await axios.patch(`${API_UPDATE_USER_URL}/${selectedOwner.id}`, formData);
        toast.success(response?.data?.message);
        const updatedOwner = {
          id: response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          userId: response.data.user.userId,
          email: response.data.user.email,
          phone: response.data.user.phone,
          assignedTheaters: selectedOwner.assignedTheaters,
          status: response.data.user.status,
          image: response.data.user.avatar?.url || selectedOwner.image,
          role: "theaterOwner",
        };
        setOwners((prev) => prev.map((o) => (o.id === selectedOwner.id ? updatedOwner : o)));
      } else {
        formData.append("password", generatedPassword);
        const response = await axios.post(API_ADD_USER_URL, formData);
        toast.success(response?.data?.message);
        const newOwner = {
          id: response.data.user.id,
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          userId: response.data.user.userId,
          email: response.data.user.email,
          phone: response.data.user.phone,
          assignedTheaters: [],
          status: response.data.user.status,
          image: response.data.user.avatar?.url || "",
        };
        setOwners((prev) => [...prev, newOwner]);
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
      console.error("Form submission error:", error.response?.data || error.message);
    }
  };

  const resetForm = () => {
    reset();
    setGeneratedPassword("");
    setImagePreview("");
    setSelectedOwner(null);
    setIsModalOpen(false);
  };

  const handleAddOwner = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (owner: TheaterOwner) => {
    console.log("Editing owner:", owner); // Debug log
    setSelectedOwner(owner);
    reset({
      firstName: owner.firstName,
      lastName: owner.lastName,
      userId: owner.userId,
      email: owner.email,
      phone: owner.phone || "", // Ensure phone is set
      resetPassword: false,
      newPassword: "",
      changeAvatar: false,
      status: owner.status,
    });
    setImagePreview(owner.image || "");
    setGeneratedPassword("");
    setIsModalOpen(true);
  };

  // Sorting and Filtering
  const filteredOwners = useMemo(() => {
    return owners.filter(
      (owner) =>
        (`${owner.firstName} ${owner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          owner.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (statusFilter === "All" || owner.status === statusFilter)
    );
  }, [owners, searchTerm, statusFilter]);

  const sortedOwners = useMemo(() => {
    let sortableOwners = [...filteredOwners];
    if (sortConfig.key) {
      sortableOwners.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return sortableOwners;
  }, [filteredOwners, sortConfig]);

  const requestSort = (key: keyof TheaterOwner) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") direction = "descending";
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof TheaterOwner) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1" />;
    return sortConfig.direction === "ascending" ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
  };

  const getStatusBadge = (status: string) => {
    let color: string;
    switch (status) {
      case "Active": color = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"; break;
      case "Inactive": color = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"; break;
      case "Banned": color = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"; break;
      case "Unbanned": color = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"; break;
      default: color = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{status}</span>;
  };

  // Actions
  const handleOpenDetailModal = (owner: TheaterOwner) => {
    setSelectedOwner(owner);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedOwner) {
      try {
        await axios.delete(`${API_DELETE_USER_URL}/${selectedOwner.id}`);
        setOwners((prev) => prev.filter((owner) => owner.id !== selectedOwner.id));
        setDeleteDialogOpen(false);
        setSelectedOwner(null);
      } catch (error: any) {
        console.error("Delete error:", error.response?.data || error.message);
      }
    }
  };

  const handleApproveTheater = () => {
    if (selectedTheaterId) {
      const theater = pendingTheaters.find((t) => t.id === selectedTheaterId);
      if (theater) {
        setOwners((prev) =>
          prev.map((owner) =>
            owner.id === theater.ownerId
              ? { ...owner, assignedTheaters: [...owner.assignedTheaters, theater.name], status: "Active" }
              : owner
          )
        );
        setApproveDialogOpen(false);
        setSelectedTheaterId(null);
      }
    }
  };

  const handleRejectTheater = () => {
    if (selectedTheaterId) {
      setRejectDialogOpen(false);
      setSelectedTheaterId(null);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 transition-colors duration-200">
      <motion.div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
              Theater Management Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage theater owners and their assignments
            </p>
          </div>
          <Button
            onClick={handleAddOwner}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
          >
            <FiPlus className="mr-2 h-4 w-4" /> Add Theater Owner
          </Button>
        </motion.div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-10 w-full text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger className="w-full sm:w-[180px] text-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Banned">Banned</SelectItem>
                    <SelectItem value="Unbanned">Unbanned</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto text-sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("All");
                    setSortConfig({ key: null, direction: "ascending" });
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theater Owners - Mobile View */}
        <div className="md:hidden space-y-4">
          <AnimatePresence>
            {sortedOwners.map((owner) => (
              <motion.div
                key={owner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-slate-900 dark:text-white flex items-center space-x-2">
                        <FaUserTie />
                        <span>{`${owner.firstName} ${owner.lastName}`}</span>
                      </h3>
                      {getStatusBadge(owner.status)}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                      <p className="flex items-center space-x-2">
                        <MdEmail />
                        <span>{owner.email}</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <FiPhone />
                        <span>{owner.phone}</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <FaFilm />
                        <span>{owner.assignedTheaters.join(", ") || "None"}</span>
                      </p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDetailModal(owner)}>
                        Details
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(owner)}>
                        <FiEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOwner(owner);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {sortedOwners.length === 0 && (
            <p className="text-center py-8 text-slate-500 dark:text-slate-400">No theater owners found</p>
          )}
        </div>

        {/* Theater Owners - Desktop View */}
        <div className="hidden md:block bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-slate-50 dark:bg-zinc-950 border-b">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer"
                    onClick={() => requestSort("firstName")}
                  >
                    <div className="flex items-center">Name {getSortIcon("firstName")}</div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer"
                    onClick={() => requestSort("email")}
                  >
                    <div className="flex items-center">Email {getSortIcon("email")}</div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Employee ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Assigned Theaters
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <AnimatePresence>
                  {sortedOwners.map((owner) => (
                    <motion.tr
                      key={owner.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-2">
                          <FaUserTie />
                          <span>{`${owner.firstName} ${owner.lastName}`}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{owner.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{owner.userId}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{owner.phone}</td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                        {owner.assignedTheaters.join(", ") || "None"}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(owner.status)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenDetailModal(owner)}>
                            Details
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(owner)}>
                            <FiEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOwner(owner);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {sortedOwners.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                      No theater owners found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Approve New Theaters */}
        <Card>
          <CardHeader>
            <CardTitle>Approve New Theaters</CardTitle>
            <CardDescription>Review and approve pending theater requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTheaters.map((theater) => (
                <Collapsible key={theater.id}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-slate-100 dark:bg-slate-800 rounded-md">
                    <span>{theater.name}</span>
                    <IoChevronDownOutline />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4">
                    <p className="text-sm">Location: {theater.location}</p>
                    <p className="text-sm">
                      Owner:{" "}
                      {owners.find((o) => o.id === theater.ownerId)?.firstName +
                        " " +
                        owners.find((o) => o.id === theater.ownerId)?.lastName || "Unknown"}
                    </p>
                    <p className="text-sm">Requested Date: {theater.requestedDate}</p>
                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => {
                          setSelectedTheaterId(theater.id);
                          setApproveDialogOpen(true);
                        }}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                      >
                        <IoCheckmarkCircle className="mr-2" /> Approve
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedTheaterId(theater.id);
                          setRejectDialogOpen(true);
                        }}
                        variant="destructive"
                        className="w-full sm:w-auto"
                      >
                        <IoCloseCircle className="mr-2" /> Reject
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
              {pendingTheaters.length === 0 && (
                <p className="text-center py-4 text-slate-500 dark:text-slate-400">No pending theaters</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Theater Performance</CardTitle>
            <CardDescription>Overview of theater metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Theaters</p>
                    <p className="text-lg font-semibold">
                      <AnimatedCounter value={owners.reduce((acc, owner) => acc + owner.assignedTheaters.length, 0)} />
                    </p>
                  </div>
                  <FaFilm className="h-6 w-6 text-indigo-600" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Average Ratings</p>
                    <p className="text-lg font-semibold">
                      <AnimatedCounter
                        value={mockPerformanceData.reduce((acc, data) => acc + data.ratings, 0) / mockPerformanceData.length}
                        decimals={1}
                      />
                    </p>
                  </div>
                  <MdStarRate className="h-6 w-6 text-indigo-600" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Revenue Summary</p>
                    <p className="text-lg font-semibold">
                      $<AnimatedCounter value={mockPerformanceData.reduce((acc, data) => acc + data.revenue, 0)} />
                    </p>
                  </div>
                  <FaMoneyBillWave className="h-6 w-6 text-indigo-600" />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Top Theater</p>
                    <p className="text-lg font-semibold">Grand Cinema</p>
                  </div>
                  <FaTicketAlt className="h-6 w-6 text-indigo-600" />
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Ratings Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={mockPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="ratings" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="w-full max-w-[90vw] sm:max-w-md">
            {selectedOwner && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Owner Details</DialogTitle>
                  <DialogDescription className="text-sm">
                    Details for {selectedOwner.firstName} {selectedOwner.lastName}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <p className="text-sm">
                    <strong>Email:</strong> {selectedOwner.email}
                  </p>
                  <p className="text-sm">
                    <strong>Phone:</strong> {selectedOwner.phone}
                  </p>
                  <p className="text-sm">
                    <strong>Employee ID:</strong> {selectedOwner.userId}
                  </p>
                  <p className="text-sm">
                    <strong>Assigned Theaters:</strong> {selectedOwner.assignedTheaters.join(", ") || "None"}
                  </p>
                  <p className="text-sm">
                    <strong>Status:</strong> {getStatusBadge(selectedOwner.status)}
                  </p>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
                  <Button variant="outline" onClick={() => handleEdit(selectedOwner)}>
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDeleteDialogOpen(true);
                      setIsDetailModalOpen(false);
                    }}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent className="w-full max-w-[90vw] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{selectedOwner ? "Edit Theater Owner" : "Add New Theater Owner"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <Input {...register("firstName")} placeholder="Enter first name" />
                    {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <Input {...register("lastName")} placeholder="Enter last name" />
                    {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Employee ID</label>
                    <Input {...register("userId")} onChange={handleUserIdChange} placeholder="Enter employee ID" />
                    {errors.userId && <p className="text-red-500 text-xs">{errors.userId.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input {...register("email")} placeholder="Enter email" />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input {...register("phone")} placeholder="Enter phone number" />
                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
                  </div>
                  {!selectedOwner && (
                    <div>
                      <label className="text-sm font-medium">Password</label>
                      <div className="flex gap-2">
                        <Input value={generatedPassword} readOnly placeholder="Generated password" />
                        <Button type="button" onClick={copyToClipboard}>
                          <FiCopy />
                        </Button>
                      </div>
                    </div>
                  )}
                  {selectedOwner && (
                    <>
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium">
                          <input type="checkbox" {...register("resetPassword")} /> <span>Reset Password</span>
                        </label>
                        {resetPassword && (
                          <div className="mt-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input type="password" {...register("newPassword")} placeholder="Enter new password" />
                            {errors.newPassword && <p className="text-red-500 text-xs">{errors.newPassword.message}</p>}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          onValueChange={(value: any) => setValue("status", value)}
                          defaultValue={selectedOwner?.status || "Active"}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Banned">Banned</SelectItem>
                            <SelectItem value="Unbanned">Unbanned</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.status && <p className="text-red-500 text-xs">{errors.status.message}</p>}
                      </div>
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium">
                          <input type="checkbox" {...register("changeAvatar")} /> <span>Change Avatar</span>
                        </label>
                        {changeAvatar && (
                          <div className="mt-2">
                            <label className="text-sm font-medium">New Profile Image</label>
                            <Input type="file" onChange={handleImageUpload} accept="image/*" />
                            {errors.image && <p className="text-red-500 text-xs">{errors.image.message}</p>}
                            {imagePreview && (
                              <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-full mt-2" />
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {!selectedOwner && (
                    <div>
                      <label className="text-sm font-medium">Profile Image (Required)</label>
                      <Input type="file" onChange={handleImageUpload} accept="image/*" />
                      {errors.image && <p className="text-red-500 text-xs">{errors.image.message}</p>}
                      {imagePreview && <img src={imagePreview} alt="Preview" className="h-20 w-20 rounded-full mt-2" />}
                    </div>
                  )}
                  <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{selectedOwner ? "Update" : "Add"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Owner</DialogTitle>
              <DialogDescription>Are you sure you want to delete this theater owner?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Theater</DialogTitle>
              <DialogDescription>Are you sure you want to approve this theater?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleApproveTheater}>
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Theater</DialogTitle>
              <DialogDescription>Are you sure you want to reject this theater?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRejectTheater}>
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default TheaterManagementPage;