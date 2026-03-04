import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  Download,
  Star,
  Pencil,
  Lock,
  Unlock,
  Trash2,
  FileText,
  Users,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

function EvaluateDialog({ open, onClose, submission, maxScore, onEvaluated }) {
  const [score, setScore] = useState(submission?.score ?? "");
  const [feedback, setFeedback] = useState(submission?.feedback ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (submission) {
      setScore(submission.score ?? "");
      setFeedback(submission.feedback ?? "");
    }
  }, [submission]);

  const handleSubmit = async () => {
    if (score === "" || score === null) return toast.error("Score is required");
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > maxScore) {
      return toast.error(`Score must be between 0 and ${maxScore}`);
    }

    setLoading(true);
    try {
      await api.patch(
        `/assignments/${submission.assignmentId}/submissions/${submission._id}/evaluate`,
        { score: numScore, feedback }
      );
      toast.success("Evaluation submitted");
      onEvaluated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to evaluate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Evaluate Submission</DialogTitle>
          <DialogDescription>
            Student: {submission?.studentId?.name || "Unknown"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Submitted File</Label>
            <a
              href={submission?.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 mt-1 text-sm text-blue-600 hover:underline"
            >
              <FileText className="h-4 w-4" />
              {submission?.fileName}
            </a>
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">Score (out of {maxScore}) *</Label>
            <Input
              id="score"
              type="number"
              min={0}
              max={maxScore}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder={`0 - ${maxScore}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Optional feedback..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Submit Evaluation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminAssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evalTarget, setEvalTarget] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      const res = await api.get(`/assignments/${id}`);
      setAssignment(res.data.assignment);
    } catch {
      toast.error("Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    try {
      const res = await api.patch(`/assignments/${id}/close`);
      setAssignment((prev) => ({ ...prev, status: res.data.assignment.status }));
      toast.success(
        `Assignment ${res.data.assignment.status === "closed" ? "closed" : "reopened"}`
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/assignments/${id}`);
      toast.success("Assignment deleted");
      navigate("/admin/assignments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Assignment not found</p>
        <Button variant="ghost" asChild className="mt-4">
          <Link to="/admin/assignments">Back</Link>
        </Button>
      </div>
    );
  }

  const stats = assignment.stats || {
    totalStudents: 0,
    submissionCount: 0,
    evaluatedCount: 0,
    averageScore: 0,
  };
  const submissions = assignment.submissions || [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/admin/assignments" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Assignments
        </Link>
      </Button>

      {/* Assignment Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-xl">{assignment.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Due: {format(new Date(assignment.dueDate), "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Max Score: {assignment.maxScore}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={assignment.status === "active" ? "default" : "secondary"}>
                {assignment.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap mb-4">{assignment.description}</p>
          {assignment.attachmentUrl && (
            <a
              href={assignment.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <Download className="h-4 w-4" />
              {assignment.attachmentName || "Download Attachment"}
            </a>
          )}
          <div className="flex flex-wrap gap-2 mt-6">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/admin/assignments/${id}/edit`} className="gap-1">
                <Pencil className="h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleClose}>
              {assignment.status === "active" ? (
                <>
                  <Lock className="h-4 w-4 mr-1" /> Close
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 mr-1" /> Reopen
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-6 w-6 mx-auto text-blue-500" />
            <p className="text-2xl font-bold mt-1">{stats.totalStudents}</p>
            <p className="text-xs text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-6 w-6 mx-auto text-amber-500" />
            <p className="text-2xl font-bold mt-1">{stats.submissionCount}</p>
            <p className="text-xs text-muted-foreground">Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="h-6 w-6 mx-auto text-green-500" />
            <p className="text-2xl font-bold mt-1">{stats.evaluatedCount}</p>
            <p className="text-xs text-muted-foreground">Evaluated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-6 w-6 mx-auto text-purple-500" />
            <p className="text-2xl font-bold mt-1">{stats.averageScore}</p>
            <p className="text-xs text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Submissions ({submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No submissions yet</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell className="font-medium">
                        {s.studentId?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(s.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <a
                          href={s.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {s.fileName}
                        </a>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        {s.status === "evaluated"
                          ? `${s.score}/${assignment.maxScore}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEvalTarget(s)}
                        >
                          {s.status === "evaluated" ? "Re-evaluate" : "Evaluate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluate Dialog */}
      {evalTarget && (
        <EvaluateDialog
          open={!!evalTarget}
          onClose={() => setEvalTarget(null)}
          submission={evalTarget}
          maxScore={assignment.maxScore}
          onEvaluated={fetchAssignment}
        />
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{assignment.title}"? This will also delete all
              submissions. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
