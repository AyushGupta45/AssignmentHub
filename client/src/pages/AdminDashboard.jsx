import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Users,
  FileText,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/assignments?limit=100"),
      api.get("/user/students"),
    ])
      .then(([aRes, sRes]) => {
        setAssignments(aRes.data.assignments);
        setStudents(sRes.data.students);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeAssignments = assignments.filter((a) => a.status === "active");
  const pendingSubmissions = assignments.reduce(
    (sum, a) => sum + ((a.submissionCount || 0) - (a.evaluatedCount || 0)),
    0
  );

  // Recent submissions = flatten assignments with their submission counts, sorted
  // We fetch the last 10 submissions separately
  const [recentSubs, setRecentSubs] = useState([]);
  useEffect(() => {
    if (assignments.length > 0) {
      // Get recent submissions from the first active assignment or all
      api
        .get("/assignments?limit=5&status=active")
        .then(async (res) => {
          const subs = [];
          for (const a of res.data.assignments.slice(0, 3)) {
            try {
              const subRes = await api.get(
                `/assignments/${a._id}/submissions?limit=5`
              );
              subRes.data.submissions.forEach((s) => {
                subs.push({ ...s, assignmentTitle: a.title, assignmentId: a._id });
              });
            } catch {
              // skip
            }
          }
          subs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentSubs(subs.slice(0, 10));
        })
        .catch(() => {});
    }
  }, [assignments]);

  // Top 5 active assignments with submission progress
  const topActive = activeAssignments
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button asChild>
          <Link to="/admin/assignments/new" className="gap-2">
            <Plus className="h-4 w-4" /> Create Assignment
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeAssignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{pendingSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSubs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No submissions yet</p>
            ) : (
              <div className="space-y-3">
                {recentSubs.map((s) => (
                  <Link
                    key={s._id}
                    to={`/admin/assignments/${s.assignmentId}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {s.studentId?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.assignmentTitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          s.status === "evaluated"
                            ? "default"
                            : s.status === "submitted"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {s.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(s.createdAt), "MMM d")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignment Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Assignment Progress</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/assignments" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {topActive.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active assignments</p>
            ) : (
              <div className="space-y-4">
                {topActive.map((a) => {
                  const pct =
                    a.totalStudents > 0
                      ? Math.round(((a.submissionCount || 0) / a.totalStudents) * 100)
                      : 0;
                  return (
                    <Link
                      key={a._id}
                      to={`/admin/assignments/${a._id}`}
                      className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium text-sm">{a.title}</p>
                        <span className="text-xs text-muted-foreground">
                          {a.submissionCount || 0}/{a.totalStudents} submitted
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {format(new Date(a.dueDate), "MMM d, yyyy")}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
