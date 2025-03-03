import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Search } from 'lucide-react';
import { FaUserCircle, FaBan, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { MdTheaters, MdWarning } from 'react-icons/md';
import { BiCheckCircle } from 'react-icons/bi';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { HiTrash } from 'react-icons/hi';
import { GiCancel } from 'react-icons/gi';

// Types
type ReviewStatus = 'Pending' | 'Reviewed' | 'Action Taken';
type FlagReason = 'Hate Speech' | 'Spam' | 'Inappropriate Content' | 'Other';
type ContentType = 'Review' | 'Image' | 'Comment';

interface FlaggedReview {
  id: string;
  userId: string;
  userName: string;
  theaterName: string;
  content: string;
  reason: FlagReason;
  status: ReviewStatus;
  dateCreated: string;
  banned?: boolean;
}

interface ReportedContent {
  id: string;
  reportedBy: string;
  contentType: ContentType;
  reason: string;
  dateReported: string;
  content: string;
  userId: string;
  userName: string;
}

interface SortConfig {
  key?: keyof FlaggedReview | null;
  direction: 'ascending' | 'descending';
}

const ContentModerationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('flagged-reviews');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });
  const [selectedReview, setSelectedReview] = useState<FlaggedReview | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  const [reviewsData, setReviewsData] = useState<FlaggedReview[]>([
    { id: '1', userId: 'user1', userName: 'John Smith', theaterName: 'Grand Theater', content: 'This theater is terrible...', reason: 'Inappropriate Content', status: 'Pending', dateCreated: '2025-02-28T14:22:00Z', banned: false },
    { id: '2', userId: 'user2', userName: 'Alice Johnson', theaterName: 'Cinema Paradise', content: 'Worst experience ever...', reason: 'Hate Speech', status: 'Pending', dateCreated: '2025-03-01T09:15:00Z', banned: false },
    { id: '3', userId: 'user3', userName: 'Robert Chen', theaterName: 'Starlite Cinema', content: 'Check out my website...', reason: 'Spam', status: 'Reviewed', dateCreated: '2025-03-02T11:30:00Z', banned: false },
    { id: '4', userId: 'user4', userName: 'Maria Garcia', theaterName: 'Royal Playhouse', content: 'The theater was fine...', reason: 'Other', status: 'Action Taken', dateCreated: '2025-03-01T16:45:00Z', banned: true },
  ]);

  const [reportsData, setReportsData] = useState<ReportedContent[]>([
    { id: 'r1', reportedBy: 'Theater Staff', contentType: 'Comment', reason: 'Contains personal information...', dateReported: '2025-03-02T10:15:00Z', content: 'The manager Jane...', userId: 'user5', userName: 'Thomas Wilson' },
    { id: 'r2', reportedBy: 'System', contentType: 'Image', reason: 'Potentially inappropriate...', dateReported: '2025-03-01T14:22:00Z', content: '[Image content...]', userId: 'user6', userName: 'Sandra Miller' },
    { id: 'r3', reportedBy: 'User', contentType: 'Review', reason: 'Misleading information', dateReported: '2025-02-28T09:30:00Z', content: 'This theater claims...', userId: 'user7', userName: 'David Brown' },
  ]);

  // Handlers
  const handleOpenDetailModal = (review: FlaggedReview) => {
    setSelectedReview(review);
    setIsDetailModalOpen(true);
  };

  const handleDeleteReview = (id: string) => {
    setReviewsData(reviews => reviews.filter(review => review.id !== id));
  };

  const handleApproveReview = (id: string) => {
    setReviewsData(reviews => 
      reviews.map(review => 
        review.id === id ? { ...review, status: 'Reviewed' } : review
      )
    );
  };

  const handleBanUser = (userId: string) => {
    setReviewsData(reviews => 
      reviews.map(review => 
        review.userId === userId ? { ...review, status: 'Action Taken', banned: true } : review
      )
    );
  };

  const handleUnbanUser = (userId: string) => {
    setReviewsData(reviews => 
      reviews.map(review => 
        review.userId === userId ? { ...review, banned: false } : review
      )
    );
  };

  const handleDeleteContent = (id: string) => {
    setReportsData(reports => reports.filter(report => report.id !== id));
  };

  const handleExpandReport = (id: string) => {
    setExpandedReportId(expandedReportId === id ? null : id);
  };

  const filteredReviews = reviewsData.filter(review => {
    const matchesSearch = 
      review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.theaterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedReviews = (() => {
    let sortableReviews = [...filteredReviews];
    if (sortConfig.key) {
      sortableReviews.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (aValue! < bValue!) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue! > bValue!) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableReviews;
  })();

  const requestSort = (key: keyof FlaggedReview) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof FlaggedReview) => {
    if (sortConfig.key !== key) return <FaSort className="ml-1" />;
    return sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />;
  };

  const getStatusBadge = (status: ReviewStatus) => {
    let color: string;
    switch (status) {
      case 'Pending': color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'; break;
      case 'Reviewed': color = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'; break;
      case 'Action Taken': color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'; break;
      default: color = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{status}</span>;
  };

  const getContentTypeBadge = (type: ContentType) => {
    let color: string;
    switch (type) {
      case 'Review': color = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'; break;
      case 'Image': color = 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100'; break;
      case 'Comment': color = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100'; break;
      default: color = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{type}</span>;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 transition-colors duration-200">
      <motion.div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Content Moderation</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage flagged reviews and reported content</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row sm:space-x-4 border-b pb-2 gap-2">
          <button
            className={`pb-2 text-sm font-medium ${activeTab === 'flagged-reviews' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}
            onClick={() => setActiveTab('flagged-reviews')}
          >
            Flagged Reviews <Badge className="ml-2 bg-red-500 text-white">{reviewsData.filter(r => r.status === 'Pending').length}</Badge>
          </button>
          <button
            className={`pb-2 text-sm font-medium ${activeTab === 'reported-content' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}
            onClick={() => setActiveTab('reported-content')}
          >
            Reported Content <Badge className="ml-2 bg-red-500 text-white">{reportsData.length}</Badge>
          </button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by user, theater, or content..."
                  className="pl-10 w-full text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] text-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Reviewed">Reviewed</SelectItem>
                    <SelectItem value="Action Taken">Action Taken</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto text-sm" 
                  onClick={() => { setSearchQuery(''); setStatusFilter('all'); setSortConfig({ key: null, direction: 'ascending' }); }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flagged Reviews */}
        {activeTab === 'flagged-reviews' && (
          <>
            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-4">
              <AnimatePresence>
                {sortedReviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-slate-900 dark:text-white flex items-center space-x-2">
                            <FaUserCircle />
                            <span>{review.userName}</span>
                          </h3>
                          {getStatusBadge(review.status)}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                          <p className="flex items-center space-x-2">
                            <MdTheaters />
                            <span>{review.theaterName}</span>
                          </p>
                          <p>
                            {review.content.length > 60 ? `${review.content.substring(0, 60)}... ` : review.content}
                            {review.content.length > 60 && (
                              <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => handleOpenDetailModal(review)}>
                                Read More
                              </Button>
                            )}
                          </p>
                          <p>Reason: <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200">{review.reason}</Badge></p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleApproveReview(review.id)}>
                            <BiCheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteReview(review.id)}>
                            <RiDeleteBin6Line className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => review.banned ? handleUnbanUser(review.userId) : handleBanUser(review.userId)}>
                            {review.banned ? 'Unban' : <FaBan className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              {sortedReviews.length === 0 && (
                <p className="text-center py-8 text-slate-500 dark:text-slate-400">No flagged reviews found</p>
              )}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block bg-white dark:bg-[hsl(0,0%,3.9%)] rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-slate-50 dark:bg-zinc-950 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('userName')}>
                        <div className="flex items-center">User {getSortIcon('userName')}</div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('theaterName')}>
                        <div className="flex items-center">Theater {getSortIcon('theaterName')}</div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Review Excerpt</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase cursor-pointer" onClick={() => requestSort('reason')}>
                        <div className="flex items-center">Reason {getSortIcon('reason')}</div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    <AnimatePresence>
                      {sortedReviews.map((review) => (
                        <motion.tr
                          key={review.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center space-x-2">
                              <FaUserCircle />
                              <span>{review.userName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                            <div className="flex items-center space-x-2">
                              <MdTheaters />
                              <span>{review.theaterName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                            {review.content.length > 60 ? (
                              <>
                                {review.content.substring(0, 60)}...
                                <Button variant="link" size="sm" onClick={() => handleOpenDetailModal(review)}>Read More</Button>
                              </>
                            ) : review.content}
                          </td>
                          <td className="px-4 py-3"><Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200">{review.reason}</Badge></td>
                          <td className="px-4 py-3">{getStatusBadge(review.status)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleApproveReview(review.id)}>
                                <BiCheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDeleteReview(review.id)}>
                                <RiDeleteBin6Line className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => review.banned ? handleUnbanUser(review.userId) : handleBanUser(review.userId)}>
                                {review.banned ? 'Unban' : <FaBan className="h-4 w-4" />}
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {sortedReviews.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                          No flagged reviews found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Reported Content */}
        {activeTab === 'reported-content' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {reportsData.map((report) => (
                <motion.div
                  key={report.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden flex flex-col h-full">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base sm:text-lg">Report #{report.id}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            Reported by {report.reportedBy} on {new Date(report.dateReported).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="shrink-0">{getContentTypeBadge(report.contentType)}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2 flex-grow">
                      <div className="mb-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reason for Report:</p>
                        <p className="text-gray-800 dark:text-gray-200 text-sm">{report.reason}</p>
                      </div>
                      <div className="mb-2">
                        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">User:</p>
                        <div className="flex items-center space-x-2">
                          <FaUserCircle className="h-4 w-4" />
                          <span className="text-sm">{report.userName}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full text-left justify-start p-0 h-auto hover:bg-transparent hover:underline text-sm"
                        onClick={() => handleExpandReport(report.id)}
                      >
                        {expandedReportId === report.id ? 'Hide Content' : 'View Reported Content'}
                      </Button>
                      <AnimatePresence>
                        {expandedReportId === report.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <ScrollArea className="h-32 sm:h-40 mt-2 p-3 border rounded-md">
                              <p className="text-gray-800 dark:text-gray-200 text-sm">{report.content}</p>
                            </ScrollArea>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between pt-2 gap-2">
                      <Button variant="outline" size="sm" className="flex items-center space-x-1 w-full sm:w-auto">
                        <MdWarning className="h-4 w-4" />
                        <span className="text-sm">Warn</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center space-x-1 w-full sm:w-auto" onClick={() => handleDeleteContent(report.id)}>
                        <HiTrash className="h-4 w-4" />
                        <span className="text-sm">Delete</span>
                      </Button>
                      <Button variant="destructive" size="sm" className="flex items-center space-x-1 w-full sm:w-auto">
                        <GiCancel className="h-4 w-4" />
                        <span className="text-sm">Ban</span>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            {reportsData.length === 0 && (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg col-span-full">
                <p className="text-gray-500 dark:text-gray-400 text-sm">No reported content available</p>
              </div>
            )}
          </div>
        )}

        {/* Review Detail Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="w-full max-w-[90vw] sm:max-w-md">
            {selectedReview && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Review Details</DialogTitle>
                  <DialogDescription className="text-sm">
                    Posted by {selectedReview.userName} for {selectedReview.theaterName}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Full Review:</p>
                  <ScrollArea className="h-32 sm:h-40 p-3 border rounded-md">
                    <p className="text-gray-800 dark:text-gray-200 text-sm">{selectedReview.content}</p>
                  </ScrollArea>
                  <div className="flex items-center mt-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">Flagged For:</p>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 text-xs">{selectedReview.reason}</Badge>
                  </div>
                  <div className="flex items-center mt-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">Status:</p>
                    {getStatusBadge(selectedReview.status)}
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
                  <Button variant="outline" className="flex items-center space-x-1 w-full sm:w-auto text-sm" onClick={() => handleApproveReview(selectedReview.id)}>
                    <BiCheckCircle className="h-4 w-4" />
                    <span>Approve</span>
                  </Button>
                  <Button variant="destructive" className="flex items-center space-x-1 w-full sm:w-auto text-sm" onClick={() => handleDeleteReview(selectedReview.id)}>
                    <RiDeleteBin6Line className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-1 w-full sm:w-auto text-sm" onClick={() => selectedReview.banned ? handleUnbanUser(selectedReview.userId) : handleBanUser(selectedReview.userId)}>
                    {selectedReview.banned ? 'Unban' : <><FaBan className="h-4 w-4" /><span>Ban User</span></>}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default ContentModerationPage;