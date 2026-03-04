import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/lib/api";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, Upload, CheckCircle2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: null,
    maxScore: 100,
    attachmentUrl: "",
    attachmentName: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const { upload, isUploading, progress, fileUrl, fileName, error: uploadError, reset } =
    useFileUpload();

  useEffect(() => {
    if (isEdit) {
      api
        .get(`/assignments/${id}`)
        .then((res) => {
          const a = res.data.assignment;
          setForm({
            title: a.title,
            description: a.description,
            dueDate: new Date(a.dueDate),
            maxScore: a.maxScore,
            attachmentUrl: a.attachmentUrl || "",
            attachmentName: a.attachmentName || "",
          });
        })
        .catch(() => toast.error("Failed to load assignment"))
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await upload(file);
      setForm((prev) => ({
        ...prev,
        attachmentUrl: result.url,
        attachmentName: result.fileName,
      }));
    } catch {
      // error shown by hook
    }
  };

  const removeAttachment = () => {
    setForm((prev) => ({ ...prev, attachmentUrl: "", attachmentName: "" }));
    reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.dueDate || form.maxScore == null) {
      return toast.error("Please fill in all required fields");
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate.toISOString(),
      };

      if (isEdit) {
        await api.put(`/assignments/${id}`, payload);
        toast.success("Assignment updated");
      } else {
        await api.post("/assignments", payload);
        toast.success("Assignment created");
      }
      navigate("/admin/assignments");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "Edit Assignment" : "Create Assignment"}
      </h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Assignment title"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe the assignment..."
                rows={5}
              />
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.dueDate ? format(form.dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.dueDate}
                    onSelect={(date) => setForm((p) => ({ ...p, dueDate: date }))}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Max Score */}
            <div className="space-y-2">
              <Label htmlFor="maxScore">Max Score *</Label>
              <Input
                id="maxScore"
                type="number"
                min={1}
                value={form.maxScore}
                onChange={(e) => setForm((p) => ({ ...p, maxScore: Number(e.target.value) }))}
              />
            </div>

            {/* Attachment */}
            <div className="space-y-2">
              <Label>Attachment (optional)</Label>
              {form.attachmentUrl ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <a
                      href={form.attachmentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {form.attachmentName || "Attachment"}
                    </a>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={removeAttachment}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="cursor-pointer"
                    />
                  </div>
                  {isUploading && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} />
                    </div>
                  )}
                  {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
                </>
              )}
            </div>

            <Button type="submit" disabled={loading || isUploading} className="w-full">
              {loading
                ? "Saving..."
                : isEdit
                  ? "Update Assignment"
                  : "Create Assignment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
