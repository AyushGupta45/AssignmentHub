import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Download,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";
import { format, isPast } from "date-fns";
import { toast } from "sonner";

export default function StudentAssignmentDetail() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const { upload, isUploading, progress, fileUrl, fileName, fileSize, error, reset } =
    useFileUpload();

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

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await upload(file);
    } catch {
      // error is set in hook
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      await upload(file);
    } catch {
      // error is set in hook
    }
  };

  const handleSubmit = async () => {
    if (!fileUrl) return toast.error("Please upload a file first");
    setSubmitting(true);
    try {
      await api.post(`/assignments/${id}/submissions`, {
        fileUrl,
        fileName,
        fileSize,
      });
      toast.success("Submission uploaded successfully!");
      reset();
      fetchAssignment();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Assignment not found</p>
        <Button variant="ghost" asChild className="mt-4">
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const sub = assignment.mySubmission;
  const isOverdue = isPast(new Date(assignment.dueDate));
  const canSubmit = !sub && assignment.status === "active" && !isOverdue;

  const scorePercentage = sub?.status === "evaluated" ? (sub.score / assignment.maxScore) * 100 : 0;
  const scoreColor =
    scorePercentage >= 70
      ? "text-green-600"
      : scorePercentage >= 40
        ? "text-amber-600"
        : "text-red-600";
  const progressColor =
    scorePercentage >= 70
      ? "[&>div]:bg-green-500"
      : scorePercentage >= 40
        ? "[&>div]:bg-amber-500"
        : "[&>div]:bg-red-500";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/dashboard" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      {/* Assignment Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{assignment.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Due: {format(new Date(assignment.dueDate), "MMM d, yyyy h:mm a")}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Max Score: {assignment.maxScore}
                </span>
              </div>
            </div>
            <Badge variant={assignment.status === "active" ? "default" : "secondary"}>
              {assignment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{assignment.description}</p>
          {assignment.attachmentUrl && (
            <a
              href={assignment.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600 hover:underline"
            >
              <Download className="h-4 w-4" />
              {assignment.attachmentName || "Download Attachment"}
            </a>
          )}
        </CardContent>
      </Card>

      {/* Submission Section */}
      {canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submit Your Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">
                {fileUrl ? fileName : "Drag & drop your file here or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Max file size: 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            {fileUrl && !isUploading && (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">{fileName}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Remove
                </Button>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!fileUrl || isUploading || submitting}
              className="w-full"
            >
              {submitting ? "Submitting..." : "Submit Assignment"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submitted — awaiting evaluation */}
      {sub && sub.status !== "evaluated" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Submitted — Awaiting Evaluation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <a
                href={sub.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {sub.fileName}
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Submitted on {format(new Date(sub.createdAt), "MMM d, yyyy h:mm a")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Evaluated */}
      {sub?.status === "evaluated" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Evaluation Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Score */}
            <div className="text-center">
              <p className={`text-4xl font-bold ${scoreColor}`}>
                {sub.score}/{assignment.maxScore}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round(scorePercentage)}%
              </p>
              <Progress value={scorePercentage} className={`mt-3 ${progressColor}`} />
            </div>

            {/* Feedback */}
            {sub.feedback && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Feedback</p>
                <p className="text-sm whitespace-pre-wrap">{sub.feedback}</p>
              </div>
            )}

            {/* File link */}
            <div className="flex items-center gap-2 pt-2">
              <FileText className="h-4 w-4" />
              <a
                href={sub.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {sub.fileName}
              </a>
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Submitted: {format(new Date(sub.createdAt), "MMM d, yyyy")}</span>
              <span>Evaluated: {format(new Date(sub.evaluatedAt), "MMM d, yyyy")}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overdue / closed — no submission */}
      {!sub && !canSubmit && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>
              {assignment.status === "closed"
                ? "This assignment has been closed."
                : "The due date for this assignment has passed."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
