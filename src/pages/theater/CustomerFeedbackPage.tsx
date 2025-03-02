import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { FaStar, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { MdQuestionAnswer, MdReportProblem, MdReply, MdCheck, MdArrowUpward } from "react-icons/md";

// Types for our data
interface TheaterRating {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  date: string;
}

interface CustomerQuery {
  id: string;
  customer: string;
  messagePreview: string;
  status: "Pending" | "Resolved";
}

interface Complaint {
  id: string;
  issueType: string;
  customer: string;
  description: string;
  status: "New" | "In Progress" | "Resolved" | "Escalated";
}

interface SortConfig {
  key?: keyof TheaterRating | keyof CustomerQuery | keyof Complaint | null;
  direction: 'ascending' | 'descending';
}

const CustomerFeedbackPage: React.FC = () => {
  // Sample data
  const [ratings] = useState<TheaterRating[]>([
    { id: "R001", customer: "John Smith", rating: 4, comment: "Great experience overall, but the seats could be more comfortable.", date: "2025-02-28" },
    { id: "R002", customer: "Alice Johnson", rating: 5, comment: "Amazing theater! Loved the sound system and screen quality.", date: "2025-02-27" },
    { id: "R003", customer: "Michael Brown", rating: 3, comment: "The movie was great but the temperature was too cold.", date: "2025-02-26" },
    { id: "R004", customer: "Sarah Davis", rating: 5, comment: "Perfect experience from ticket purchase to exit. Will come again!", date: "2025-02-25" },
    { id: "R005", customer: "Robert Wilson", rating: 2, comment: "Long queues at concessions and uncomfortable seating.", date: "2025-02-24" },
  ]);

  const [queries] = useState<CustomerQuery[]>([
    { id: "Q001", customer: "Emma Thompson", messagePreview: "I lost my jacket in theater 3 during yesterday's evening show...", status: "Pending" },
    { id: "Q002", customer: "James Miller", messagePreview: "Can you tell me if you offer any discounts for students?", status: "Resolved" },
    { id: "Q003", customer: "Olivia Garcia", messagePreview: "What are your operating hours on holidays?", status: "Pending" },
    { id: "Q004", customer: "William Martinez", messagePreview: "Do you have any special screenings for children this weekend?", status: "Pending" },
    { id: "Q005", customer: "Sophia Lee", messagePreview: "I'd like to book the entire theater for a private event...", status: "Resolved" },
  ]);

  const [complaints] = useState<Complaint[]>([
    { id: "C001", issueType: "Technical Issue", customer: "Daniel Clark", description: "Sound cut out halfway through the movie in Theater 2", status: "New" },
    { id: "C002", issueType: "Service", customer: "Isabella Rodriguez", description: "Rude behavior from staff at concessions", status: "In Progress" },
    { id: "C003", issueType: "Facility", customer: "Ethan Wright", description: "Bathroom was out of order and no alternatives were provided", status: "Resolved" },
    { id: "C004", issueType: "Technical Issue", customer: "Ava Turner", description: "Movie started 15 minutes late with no explanation", status: "Escalated" },
    { id: "C005", issueType: "Safety", customer: "Noah Harris", description: "Emergency exit door was blocked by storage items", status: "New" },
  ]);

  const [sortConfigRatings, setSortConfigRatings] = useState<SortConfig>({ key: null, direction: 'ascending' });
  const [sortConfigQueries, setSortConfigQueries] = useState<SortConfig>({ key: null, direction: 'ascending' });
  const [sortConfigComplaints, setSortConfigComplaints] = useState<SortConfig>({ key: null, direction: 'ascending' });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Helper function to render star ratings
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <FaStar 
        key={i} 
        className={`inline ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
        size={16} 
      />
    ));
  };

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Pending":
      case "New":
        return "bg-blue-500";
      case "In Progress":
        return "bg-yellow-500";
      case "Resolved":
        return "bg-green-500";
      case "Escalated":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Sorting functions
  const requestSort = (
    key: keyof TheaterRating | keyof CustomerQuery | keyof Complaint,
    type: 'ratings' | 'queries' | 'complaints'
  ) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    const currentConfig = type === 'ratings' ? sortConfigRatings : 
                         type === 'queries' ? sortConfigQueries : sortConfigComplaints;
    
    if (currentConfig.key === key && currentConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    const newConfig = { key, direction };
    if (type === 'ratings') setSortConfigRatings(newConfig);
    else if (type === 'queries') setSortConfigQueries(newConfig);
    else setSortConfigComplaints(newConfig);
  };

  const getSortIcon = (
    key: keyof TheaterRating | keyof CustomerQuery | keyof Complaint,
    type: 'ratings' | 'queries' | 'complaints'
  ) => {
    const config = type === 'ratings' ? sortConfigRatings : 
                  type === 'queries' ? sortConfigQueries : sortConfigComplaints;
    
    if (config.key !== key) return <FaSort className="ml-1" />;
    if (config.direction === 'ascending') return <FaSortUp className="ml-1" />;
    return <FaSortDown className="ml-1" />;
  };

  // Sorted data
  const sortedRatings = useMemo(() => {
    let sortableRatings = [...ratings];
    if (sortConfigRatings.key) {
      sortableRatings.sort((a, b) => {
        const key = sortConfigRatings.key as keyof TheaterRating;
        if (a[key] < b[key]) return sortConfigRatings.direction === 'ascending' ? -1 : 1;
        if (a[key] > b[key]) return sortConfigRatings.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableRatings;
  }, [ratings, sortConfigRatings]);

  const sortedQueries = useMemo(() => {
    let sortableQueries = [...queries];
    if (sortConfigQueries.key) {
      sortableQueries.sort((a, b) => {
        const key = sortConfigQueries.key as keyof CustomerQuery;
        if (a[key] < b[key]) return sortConfigQueries.direction === 'ascending' ? -1 : 1;
        if (a[key] > b[key]) return sortConfigQueries.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableQueries;
  }, [queries, sortConfigQueries]);

  const sortedComplaints = useMemo(() => {
    let sortableComplaints = [...complaints];
    if (sortConfigComplaints.key) {
      sortableComplaints.sort((a, b) => {
        const key = sortConfigComplaints.key as keyof Complaint;
        if (a[key] < b[key]) return sortConfigComplaints.direction === 'ascending' ? -1 : 1;
        if (a[key] > b[key]) return sortConfigComplaints.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableComplaints;
  }, [complaints, sortConfigComplaints]);

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Customer Feedback & Reviews</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage theater ratings, customer queries, and complaints in one place.
        </p>
      </motion.div>

      <Tabs defaultValue="ratings" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="ratings" className="flex items-center gap-2">
            <FaStar className="text-yellow-500" /> Review Theater Ratings
          </TabsTrigger>
          <TabsTrigger value="queries" className="flex items-center gap-2">
            <MdQuestionAnswer className="text-blue-500" /> Reply to Customer Queries
          </TabsTrigger>
          <TabsTrigger value="complaints" className="flex items-center gap-2">
            <MdReportProblem className="text-red-500" /> Manage Complaints
          </TabsTrigger>
        </TabsList>

        {/* Theater Ratings Tab */}
        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaStar className="text-yellow-500" /> Theater Ratings Overview
              </CardTitle>
              <CardDescription>
                View and respond to customer ratings and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-4">
                  {sortedRatings.map((rating) => (
                    <Card key={rating.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-slate-900 dark:text-white">{rating.customer}</h3>
                          <div>{renderStars(rating.rating)}</div>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          <p>{rating.comment}</p>
                          <p>{rating.date}</p>
                        </div>
                        <div className="flex justify-end">
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <MdReply /> Reply
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-zinc-950 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('id', 'ratings')}>
                            <div className="flex items-center">Review ID {getSortIcon('id', 'ratings')}</div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('customer', 'ratings')}>
                            <div className="flex items-center">Customer {getSortIcon('customer', 'ratings')}</div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('rating', 'ratings')}>
                            <div className="flex items-center">Rating {getSortIcon('rating', 'ratings')}</div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Comment</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('date', 'ratings')}>
                            <div className="flex items-center">Date {getSortIcon('date', 'ratings')}</div>
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {sortedRatings.map((rating) => (
                          <motion.tr
                            key={rating.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            variants={itemVariants}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{rating.id}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{rating.customer}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{renderStars(rating.rating)}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 max-w-md truncate">{rating.comment}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{rating.date}</td>
                            <td className="px-4 py-3 text-right">
                              <Button size="sm" variant="ghost" className="flex items-center gap-1">
                                <MdReply /> Reply
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Queries Tab */}
        <TabsContent value="queries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdQuestionAnswer className="text-blue-500" /> Customer Queries
              </CardTitle>
              <CardDescription>
                Respond to customer questions and information requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-4">
                  {sortedQueries.map((query) => (
                    <Card key={query.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-slate-900 dark:text-white">{query.customer}</h3>
                          <Badge className={`${getStatusColor(query.status)} text-white`}>{query.status}</Badge>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          <p>{query.messagePreview}</p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <MdReply /> Reply
                          </Button>
                          {query.status === "Pending" && (
                            <Button size="sm" variant="outline" className="flex items-center gap-1 text-green-600">
                              <MdCheck /> Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-zinc-950 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('id', 'queries')}>
                            <div className="flex items-center">Query ID {getSortIcon('id', 'queries')}</div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('customer', 'queries')}>
                            <div className="flex items-center">Customer {getSortIcon('customer', 'queries')}</div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Message Preview</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('status', 'queries')}>
                            <div className="flex items-center">Status {getSortIcon('status', 'queries')}</div>
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {sortedQueries.map((query) => (
                          <motion.tr
                            key={query.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            variants={itemVariants}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{query.id}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{query.customer}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 max-w-md truncate">{query.messagePreview}</td>
                            <td className="px-4 py-3">
                              <Badge className={`${getStatusColor(query.status)} text-white`}>{query.status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="flex items-center gap-1">
                                  <MdReply /> Reply
                                </Button>
                                {query.status === "Pending" && (
                                  <Button size="sm" variant="ghost" className="flex items-center gap-1 text-green-600">
                                    <MdCheck /> Resolve
                                  </Button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdReportProblem className="text-red-500" /> Customer Complaints
              </CardTitle>
              <CardDescription>
                Handle and resolve customer issues and complaints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {/* Mobile View - Cards */}
                <div className="md:hidden space-y-4">
                  {sortedComplaints.map((complaint) => (
                    <Card key={complaint.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-slate-900 dark:text-white">{complaint.customer}</h3>
                          <Badge className={`${getStatusColor(complaint.status)} text-white`}>{complaint.status}</Badge>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          <p>{complaint.issueType}</p>
                          <p>{complaint.description}</p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <MdReply /> Reply
                          </Button>
                          {complaint.status !== "Resolved" && complaint.status !== "Escalated" && (
                            <Button size="sm" variant="outline" className="flex items-center gap-1 text-green-600">
                              <MdCheck /> Resolve
                            </Button>
                          )}
                          {complaint.status !== "Escalated" && (
                            <Button size="sm" variant="outline" className="flex items-center gap-1 text-red-600">
                              <MdArrowUpward /> Escalate
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-zinc-950 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('id', 'complaints')}>
                            <div className="flex items-center">Complaint ID {getSortIcon('id', 'complaints')}</div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('issueType', 'complaints')}>
                            <div className="flex items-center">Issue Type {getSortIcon('issueType', 'complaints')}</div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('customer', 'complaints')}>
                            <div className="flex items-center">Customer {getSortIcon('customer', 'complaints')}</div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('status', 'complaints')}>
                            <div className="flex items-center">Status {getSortIcon('status', 'complaints')}</div>
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {sortedComplaints.map((complaint) => (
                          <motion.tr
                            key={complaint.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                            variants={itemVariants}
                          >
                            <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{complaint.id}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{complaint.issueType}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{complaint.customer}</td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 max-w-md truncate">{complaint.description}</td>
                            <td className="px-4 py-3">
                              <Badge className={`${getStatusColor(complaint.status)} text-white`}>{complaint.status}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="flex items-center gap-1">
                                  <MdReply /> Reply
                                </Button>
                                {complaint.status !== "Resolved" && complaint.status !== "Escalated" && (
                                  <Button size="sm" variant="ghost" className="flex items-center gap-1 text-green-600">
                                    <MdCheck /> Resolve
                                  </Button>
                                )}
                                {complaint.status !== "Escalated" && (
                                  <Button size="sm" variant="ghost" className="flex items-center gap-1 text-red-600">
                                    <MdArrowUpward /> Escalate
                                  </Button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerFeedbackPage;