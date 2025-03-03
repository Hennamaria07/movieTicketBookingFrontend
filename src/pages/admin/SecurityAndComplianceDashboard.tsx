import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useTheme } from "../../components/ui/theme-provider";
import { motion } from "framer-motion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { FaShieldAlt, FaUserShield } from "react-icons/fa";
import { MdBlock, MdAccessTime, MdGavel, MdHistory } from "react-icons/md";
import { AiOutlineWarning, AiOutlineExclamationCircle, AiOutlineUserSwitch } from "react-icons/ai";
import { BiError, BiShieldQuarter } from "react-icons/bi";

// Mock data for the dashboard
const suspiciousActivities = [
  { id: 1, userName: "john_doe", activityType: "Multiple Failed Logins", timestamp: "2025-03-03 14:22:45", riskLevel: "High" },
  { id: 2, userName: "emma_smith", activityType: "Unusual Purchase Pattern", timestamp: "2025-03-03 12:35:18", riskLevel: "Medium" },
  { id: 3, userName: "robert_jones", activityType: "IP Address Change", timestamp: "2025-03-02 22:14:09", riskLevel: "Low" },
  { id: 4, userName: "lisa_wong", activityType: "Bulk Ticket Purchase", timestamp: "2025-03-02 18:47:32", riskLevel: "Medium" },
  { id: 5, userName: "michael_brown", activityType: "Account Info Change", timestamp: "2025-03-02 15:12:51", riskLevel: "Medium" },
];

const auditLogs = [
  { id: 1, userName: "admin_sarah", action: "Login", ipAddress: "192.168.1.105", timestamp: "2025-03-03 14:58:12", status: "Success" },
  { id: 2, userName: "manager_tom", action: "Export Data", ipAddress: "192.168.1.238", timestamp: "2025-03-03 13:42:27", status: "Success" },
  { id: 3, userName: "unknown", action: "Login", ipAddress: "45.123.45.67", timestamp: "2025-03-03 11:25:04", status: "Failed" },
  { id: 4, userName: "staff_james", action: "User Permission Update", ipAddress: "192.168.1.142", timestamp: "2025-03-02 17:36:48", status: "Success" },
  { id: 5, userName: "dev_alice", action: "System Update", ipAddress: "192.168.1.201", timestamp: "2025-03-02 09:15:33", status: "Success" },
];

const userRoles = [
  { id: 1, role: "Admin", description: "Full access to all system features", enabled: true },
  { id: 2, role: "Manager", description: "Access to reporting and staff management", enabled: true },
  { id: 3, role: "Staff", description: "Basic ticket and customer management", enabled: true },
  { id: 4, role: "Developer", description: "System configuration and maintenance", enabled: false },
  { id: 5, role: "Auditor", description: "Read-only access to security logs", enabled: true },
];

const dataBreaches = [
  { id: 1, title: "Suspicious Login Attempt", description: "Multiple failed login attempts from unusual location", timestamp: "2025-03-03 13:45:22", severity: "Medium" },
  { id: 2, title: "Potential Data Export", description: "Large data export initiated outside business hours", timestamp: "2025-03-02 23:12:05", severity: "High" },
];

const SecurityAndComplianceDashboard: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    fraudDetection: true,
    dataPrivacy: true,
    userPermissions: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const getRiskLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return <Badge className="bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800">{level}</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-800">{level}</Badge>;
      case "low":
        return <Badge className="bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800">{level}</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return <Badge className="bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800">{status}</Badge>;
      case "failed":
        return <Badge className="bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 max-w-6xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Security & Compliance</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="ml-auto"
        >
          {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
        </Button>
      </div>

      {/* Fraud Detection Section */}
      <Collapsible 
        open={expandedSections.fraudDetection}
        className="mb-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold dark:text-white flex items-center">
            <FaShieldAlt className="mr-2" /> Fraud Detection
          </h2>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleSection("fraudDetection")}
            >
              {expandedSections.fraudDetection ? "Hide" : "Show"}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Fraudulent Activities</CardTitle>
                  <FaShieldAlt className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+5 from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blocked Accounts</CardTitle>
                  <MdBlock className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">+2 from last week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Suspicious Transactions</CardTitle>
                  <AiOutlineWarning className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">-3 from last week</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BiError className="mr-2" /> Suspicious Activities
                </CardTitle>
                <CardDescription>Monitor and review potentially fraudulent user actions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-72">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead><FaUserShield className="inline mr-1" /> User</TableHead>
                        <TableHead><BiError className="inline mr-1" /> Activity Type</TableHead>
                        <TableHead><MdAccessTime className="inline mr-1" /> Timestamp</TableHead>
                        <TableHead><AiOutlineExclamationCircle className="inline mr-1" /> Risk Level</TableHead>
                        <TableHead><MdGavel className="inline mr-1" /> Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suspiciousActivities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">{activity.userName}</TableCell>
                          <TableCell>{activity.activityType}</TableCell>
                          <TableCell>{activity.timestamp}</TableCell>
                          <TableCell>{getRiskLevelBadge(activity.riskLevel)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">Review</Button>
                              <Button size="sm" variant="destructive">Ban</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Export Report</Button>
                <Button>View All Activities</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>

      {/* Data Privacy Monitoring Section */}
      <Collapsible 
        open={expandedSections.dataPrivacy}
        className="mb-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold dark:text-white flex items-center">
            <BiShieldQuarter className="mr-2" /> Data Privacy Monitoring
          </h2>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleSection("dataPrivacy")}
            >
              {expandedSections.dataPrivacy ? "Hide" : "Show"}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              <div className="space-y-4">
                {dataBreaches.map(breach => (
                  <Alert key={breach.id} variant={breach.severity.toLowerCase() === "high" ? "destructive" : "default"}>
                    <BiShieldQuarter className="h-4 w-4" />
                    <AlertTitle className="flex items-center">
                      {breach.title} - {breach.timestamp}
                    </AlertTitle>
                    <AlertDescription>{breach.description}</AlertDescription>
                  </Alert>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MdHistory className="mr-2" /> Audit Logs
                  </CardTitle>
                  <CardDescription>Recent system access and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-72">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium">{log.userName}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>{log.ipAddress}</TableCell>
                            <TableCell>{log.timestamp}</TableCell>
                            <TableCell>{getStatusBadge(log.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Button variant="outline">Export Logs</Button>
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>

      {/* User Permissions Section */}
      <Collapsible 
        open={expandedSections.userPermissions}
        className="mb-6 space-y-4"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold dark:text-white flex items-center">
            <AiOutlineUserSwitch className="mr-2" /> User Permissions
          </h2>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => toggleSection("userPermissions")}
            >
              {expandedSections.userPermissions ? "Hide" : "Show"}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AiOutlineUserSwitch className="mr-2" /> Role Management
                </CardTitle>
                <CardDescription>Control access levels for system users</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.role}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                          <Switch 
                            checked={role.enabled} 
                            id={`role-${role.id}`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline">Reset Defaults</Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

export default SecurityAndComplianceDashboard;