import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import { 
  FaUserCircle, FaSearch, FaFilter, FaSortUp, FaSortDown, FaSort 
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { RiUserSettingsFill } from "react-icons/ri";
import { 
  IoCheckmarkCircle, IoBanSharp, IoTrashOutline, IoMailOutline, 
  IoChevronDownOutline, IoChevronUpOutline, IoUnlinkOutline 
} from "react-icons/io5";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../../components/ui/dialog";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "../../components/ui/card";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tab";
import { API_GET_ALL_USERS_URL, API_UPDATE_USER_URL, API_DELETE_USER_URL } from "../../utils/api";

// Types
type UserRole = 'admin' | 'theaterOwner' | 'user';
type UserStatus = 'Active' | 'Banned' | 'Pending Verification';
type TicketStatus = 'Open' | 'In Progress' | 'Resolved';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  bannedReason?: string;
}

interface Ticket {
  id: string;
  userId: string;
  summary: string;
  description: string;
  dateTime: string;
  status: TicketStatus;
}

interface SortConfig {
  key: keyof User | null;
  direction: 'ascending' | 'descending';
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "All">("All");
  const [expandedTickets, setExpandedTickets] = useState<string[]>([]);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
  const [loading, setLoading] = useState(true);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_GET_ALL_USERS_URL);
        const fetchedUsers = response.data.data.map((user: any) => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role,
          status: user.status === 'Inactive' || user.status === 'Unbanned' ? 'Active' : user.status,
          joinDate: new Date(user.createdAt).toISOString().split('T')[0],
          bannedReason: user.bannedReason,
        }));
        setUsers(fetchedUsers);
        // toast.success("Users fetched successfully");
      } catch (err) {
        toast.error("Failed to fetch users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Mock tickets (replace with API if available)
  useEffect(() => {
    setTickets([
      { id: "t1", userId: "2", summary: "Cannot access ticket sales report", description: "Error message on report generation.", dateTime: "2024-02-28T14:30:00", status: "Open" },
      { id: "t2", userId: "3", summary: "Account verification issue", description: "Verification delay.", dateTime: "2024-02-27T09:15:00", status: "In Progress" },
    ]);
  }, []);

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRoleFilter = roleFilter === "All" || user.role === roleFilter;
      const matchesStatusFilter = statusFilter === "All" || user.status === statusFilter;
      return matchesSearch && matchesRoleFilter && matchesStatusFilter;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const sortedUsers = useMemo(() => {
    let sortableUsers = [...filteredUsers];
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        const key = sortConfig.key as keyof User;
        const aValue = a[key];
        const bValue = b[key];
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableUsers;
  }, [filteredUsers, sortConfig]);

  const requestSort = (key: keyof User) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof User) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1" />;
    return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
  };

  // API Handlers
  const updateUserStatus = async (userId: string, status: UserStatus, bannedReason?: string) => {
    try {
      const payload = { status };
      if (bannedReason) payload.bannedReason = bannedReason;
      const response = await axios.patch(`${API_UPDATE_USER_URL}/${userId}`, payload);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status, bannedReason: bannedReason || user.bannedReason } : user
      ));
      return response.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to update user status");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await axios.delete(`${API_DELETE_USER_URL}/${userId}`);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Failed to delete user");
    }
  };

  // Event Handlers
  const handleUnbanClick = async (user: User) => {
    try {
      await updateUserStatus(user.id, "Active");
      toast.success(`${user.name} has been unbanned successfully`);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleTicket = (ticketId: string) => {
    setExpandedTickets(prev => 
      prev.includes(ticketId) ? prev.filter(id => id !== ticketId) : [...prev, ticketId]
    );
  };

  const handleVerifyClick = (user: User) => {
    setSelectedUser(user);
    setVerifyDialogOpen(true);
  };

  const handleBanClick = (user: User) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleVerifyConfirm = async () => {
    if (selectedUser) {
      try {
        await updateUserStatus(selectedUser.id, "Active");
        toast.success(`${selectedUser.name} has been verified successfully`);
        setVerifyDialogOpen(false);
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleBanConfirm = async () => {
    if (selectedUser) {
      try {
        await updateUserStatus(selectedUser.id, "Banned", banReason);
        toast.success(`${selectedUser.name} has been banned successfully`);
        setBanDialogOpen(false);
        setBanReason("");
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id);
        toast.success(`${selectedUser.name} has been deleted successfully`);
        setDeleteDialogOpen(false);
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  const handleResolveTicket = (ticketId: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: "Resolved" } : ticket
    ));
    toast.success("Ticket marked as resolved");
  };

  const getUserById = (userId: string): User | undefined => users.find(user => user.id === userId);

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case "Active": return "bg-green-500 hover:bg-green-600";
      case "Banned": return "bg-red-500 hover:bg-red-600";
      case "Pending Verification": return "bg-yellow-500 hover:bg-yellow-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getTicketStatusBadgeColor = (status: TicketStatus) => {
    switch (status) {
      case "Open": return "bg-blue-500 hover:bg-blue-600";
      case "In Progress": return "bg-purple-500 hover:bg-purple-600";
      case "Resolved": return "bg-green-500 hover:bg-green-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage users and support tickets</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex flex-wrap gap-2">
            <TabsTrigger value="users" className="flex-1 sm:flex-none">Users</TabsTrigger>
            <TabsTrigger value="tickets" className="flex-1 sm:flex-none">Support Tickets</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Search and Filter Bar */}
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                          <FaFilter className="mr-2 h-4 w-4" /> Role: {roleFilter}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setRoleFilter("All")}>All Roles</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRoleFilter("admin")}>Admin</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRoleFilter("theaterOwner")}>Theater Owner</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRoleFilter("user")}>User</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                          <FaFilter className="mr-2 h-4 w-4" /> Status: {statusFilter}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setStatusFilter("All")}>All Statuses</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("Active")}>Active</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("Banned")}>Banned</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setStatusFilter("Pending Verification")}>Pending Verification</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Listing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Users</CardTitle>
                <CardDescription className="text-sm">Manage users, their roles, and account status</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-4">
                  {sortedUsers.map((user) => (
                    <Card key={user.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-sm text-slate-900 dark:text-white">{user.name}</h3>
                          <Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <p><span className="font-medium">Email:</span> {user.email}</p>
                          <p><span className="font-medium">Role:</span> {user.role}</p>
                          <p><span className="font-medium">Join Date:</span> {user.joinDate}</p>
                        </div>
                        <div className="flex justify-end gap-2">
                          {user.status === "Pending Verification" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1"
                              onClick={() => handleVerifyClick(user)}
                            >
                              <IoCheckmarkCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {user.status === "Banned" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-green-600 dark:text-green-400"
                              onClick={() => handleUnbanClick(user)}
                            >
                              <IoUnlinkOutline className="h-4 w-4" />
                            </Button>
                          )}
                          {user.status !== "Banned" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-red-600 dark:text-red-400"
                              onClick={() => handleBanClick(user)}
                            >
                              <IoBanSharp className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-red-600 dark:text-red-400"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <IoTrashOutline className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {sortedUsers.length === 0 && (
                    <p className="text-center py-4 text-sm text-slate-500 dark:text-slate-400">No users found matching your filters.</p>
                  )}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-zinc-950 border-b">
                        <TableHead 
                          className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" 
                          onClick={() => requestSort('name')}
                        >
                          <div className="flex items-center">
                            Name {getSortIcon('name')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" 
                          onClick={() => requestSort('email')}
                        >
                          <div className="flex items-center">
                            Email {getSortIcon('email')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" 
                          onClick={() => requestSort('role')}
                        >
                          <div className="flex items-center">
                            Role {getSortIcon('role')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" 
                          onClick={() => requestSort('status')}
                        >
                          <div className="flex items-center">
                            Status {getSortIcon('status')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" 
                          onClick={() => requestSort('joinDate')}
                        >
                          <div className="flex items-center">
                            Join Date {getSortIcon('joinDate')}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase"
                        >
                          <div className="flex items-center justify-end">
                            Actions
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {sortedUsers.map((user) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="border-b hover:bg-muted/50"
                          >
                            <TableCell className="px-4 py-3 font-medium">
                              <div className="flex items-center">
                                <FaUserCircle className="mr-2 h-5 w-5 text-gray-500" />
                                {user.name}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="flex items-center">
                                <MdEmail className="mr-2 h-5 w-5 text-gray-500" />
                                {user.email}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="flex items-center">
                                <RiUserSettingsFill className="mr-2 h-5 w-5 text-gray-500" />
                                {user.role}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge className={getStatusBadgeColor(user.status)}>{user.status}</Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3">{user.joinDate}</TableCell>
                            <TableCell className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2 flex-wrap">
                                {user.status === "Pending Verification" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1"
                                    onClick={() => handleVerifyClick(user)}
                                  >
                                    <IoCheckmarkCircle className="h-4 w-4" />
                                    <span className="sr-only sm:not-sr-only sm:inline-block">Verify</span>
                                  </Button>
                                )}
                                {user.status === "Banned" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1 text-green-600 dark:text-green-400"
                                    onClick={() => handleUnbanClick(user)}
                                  >
                                    <IoUnlinkOutline className="h-4 w-4" />
                                    <span className="sr-only sm:not-sr-only sm:inline-block">Unban</span>
                                  </Button>
                                )}
                                {user.status !== "Banned" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1 text-red-600 dark:text-red-400"
                                    onClick={() => handleBanClick(user)}
                                  >
                                    <IoBanSharp className="h-4 w-4" />
                                    <span className="sr-only sm:not-sr-only sm:inline-block">Ban</span>
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1 text-red-600 dark:text-red-400"
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  <IoTrashOutline className="h-4 w-4" />
                                  <span className="sr-only sm:not-sr-only sm:inline-block">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                      {sortedUsers.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-sm">
                            No users found matching your filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Support Tickets</CardTitle>
                <CardDescription className="text-sm">Manage and respond to user support tickets</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {tickets.length > 0 ? (
                      tickets.map((ticket) => {
                        const user = getUserById(ticket.userId);
                        const isExpanded = expandedTickets.includes(ticket.id);
                        return (
                          <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card>
                              <CardHeader 
                                className="cursor-pointer flex flex-row items-center gap-2 p-4" 
                                onClick={() => toggleTicket(ticket.id)}
                              >
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <CardTitle className="text-base sm:text-lg">{ticket.summary}</CardTitle>
                                    <Badge className={getTicketStatusBadgeColor(ticket.status)}>{ticket.status}</Badge>
                                  </div>
                                  <CardDescription className="mt-1 text-xs sm:text-sm">
                                    <div className="flex items-center">
                                      <FaUserCircle className="mr-2 h-4 w-4" />
                                      {user?.name || "Unknown User"}
                                    </div>
                                    <div className="mt-1">{new Date(ticket.dateTime).toLocaleString()}</div>
                                  </CardDescription>
                                </div>
                                {isExpanded ? <IoChevronUpOutline className="h-5 w-5" /> : <IoChevronDownOutline className="h-5 w-5" />}
                              </CardHeader>
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <CardContent className="p-4">
                                      <div className="space-y-4">
                                        <div>
                                          <h3 className="font-semibold text-sm sm:text-base mb-2">Ticket Description</h3>
                                          <p className="text-xs sm:text-sm text-muted-foreground">{ticket.description}</p>
                                        </div>
                                        {ticket.status !== "Resolved" && (
                                          <div>
                                            <h3 className="font-semibold text-sm sm:text-base mb-2">Response</h3>
                                            <Textarea placeholder="Type your response here..." className="min-h-[80px] sm:min-h-32" />
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col sm:flex-row justify-between border-t p-4 gap-2">
                                      {ticket.status !== "Resolved" ? (
                                        <>
                                          <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={(e) => { e.stopPropagation(); }}>
                                            <IoMailOutline className="h-4 w-4" />
                                            Respond via Email
                                          </Button>
                                          <Button className="w-full sm:w-auto gap-2" onClick={(e) => { e.stopPropagation(); handleResolveTicket(ticket.id); }}>
                                            <IoCheckmarkCircle className="h-4 w-4" />
                                            Mark as Resolved
                                          </Button>
                                        </>
                                      ) : (
                                        <p className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                                          This ticket has been resolved.
                                        </p>
                                      )}
                                    </CardFooter>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Card>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No support tickets available.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
          <DialogContent className="w-[90vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Verify User</DialogTitle>
              <DialogDescription className="text-sm">Are you sure you want to verify this user?</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <FaUserCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
                <div>
                  <p className="font-medium text-sm sm:text-base">{selectedUser?.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{selectedUser?.email}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setVerifyDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleVerifyConfirm} className="w-full sm:w-auto">Verify User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
          <DialogContent className="w-[90vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Ban User</DialogTitle>
              <DialogDescription className="text-sm">Please provide a reason for banning this user.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <FaUserCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
                <div>
                  <p className="font-medium text-sm sm:text-base">{selectedUser?.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{selectedUser?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm">Ban Reason</Label>
                <Textarea 
                  id="reason" 
                  placeholder="Enter the reason for banning this user..." 
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="min-h-[80px] sm:min-h-32"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setBanDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button variant="destructive" onClick={handleBanConfirm} disabled={!banReason.trim()} className="w-full sm:w-auto">Ban User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="w-[90vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Delete User</DialogTitle>
              <DialogDescription className="text-sm">Are you sure you want to delete this user? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <FaUserCircle className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
                <div>
                  <p className="font-medium text-sm sm:text-base">{selectedUser?.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{selectedUser?.email}</p>
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} className="w-full sm:w-auto">Delete User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserManagementPage;