import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  AlertCircle,
} from "lucide-react";
import { format, isPast, isWithinInterval, addDays } from "date-fns";

const statusBadge = (assignment) => {
  if (!assignment.mySubmission) {
    if (assignment.status === "closed" || isPast(new Date(assignment.dueDate))) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  }
  if (assignment.mySubmission.status === "evaluated") {
    return (
      <Badge className="bg-green-600 hover:bg-green-700 text-white">
        Evaluated: {assignment.mySubmission.score}/{assignment.maxScore}
      </Badge>
    );
  }
  return <Badge variant="outline">Submitted</Badge>;
};

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/assignments?limit=100");
      setAssignments(res.data.assignments);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: assignments.length,
    submitted: assignments.filter((a) => a.mySubmission).length,
    evaluated: assignments.filter((a) => a.mySubmission?.status === "evaluated").length,
    pending: assignments.filter(
      (a) => !a.mySubmission && a.status === "active" && !isPast(new Date(a.dueDate))
    ).length,
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    if (tab === "active") return matchesSearch && a.status === "active" && !a.mySubmission;
    if (tab === "submitted")
      return matchesSearch && a.mySubmission && a.mySubmission.status !== "evaluated";
    if (tab === "evaluated")
      return matchesSearch && a.mySubmission?.status === "evaluated";
    return matchesSearch;
  });

  const upcomingDeadlines = assignments
    .filter((a) => a.status === "active" && !a.mySubmission && !isPast(new Date(a.dueDate)))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const recentEvaluations = assignments
    .filter((a) => a.mySubmission?.status === "evaluated")
    .sort((a, b) => new Date(b.mySubmission.evaluatedAt) - new Date(a.mySubmission.evaluatedAt))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold">{stats.submitted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Evaluated</p>
                <p className="text-2xl font-bold">{stats.evaluated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines & Recent Evaluations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((a) => {
                  const dueDate = new Date(a.dueDate);
                  const isUrgent = isWithinInterval(dueDate, {
                    start: new Date(),
                    end: addDays(new Date(), 2),
                  });
                  return (
                    <Link
                      key={a._id}
                      to={`/dashboard/assignments/${a._id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{a.title}</p>
                        <p className={`text-xs ${isUrgent ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                          Due: {format(dueDate, "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Recent Evaluations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvaluations.length === 0 ? (
              <p className="text-muted-foreground text-sm">No evaluations yet</p>
            ) : (
              <div className="space-y-3">
                {recentEvaluations.map((a) => {
                  const pct = (a.mySubmission.score / a.maxScore) * 100;
                  const color =
                    pct >= 70 ? "text-green-600" : pct >= 40 ? "text-amber-600" : "text-red-600";
                  return (
                    <Link
                      key={a._id}
                      to={`/dashboard/assignments/${a._id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{a.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(a.mySubmission.evaluatedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <span className={`font-bold ${color}`}>
                        {a.mySubmission.score}/{a.maxScore}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assignment Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Assignments</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="submitted">Submitted</TabsTrigger>
              <TabsTrigger value="evaluated">Evaluated</TabsTrigger>
            </TabsList>
            <TabsContent value={tab} className="mt-4">
              {filteredAssignments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2" />
                  <p>No assignments found</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Max Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssignments.map((a) => (
                        <TableRow key={a._id}>
                          <TableCell className="font-medium">{a.title}</TableCell>
                          <TableCell>{format(new Date(a.dueDate), "MMM d, yyyy")}</TableCell>
                          <TableCell>{a.maxScore}</TableCell>
                          <TableCell>{statusBadge(a)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/dashboard/assignments/${a._id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
