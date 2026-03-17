import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  type JobListing,
  JobStatus,
  formatDate,
  jobTypeLabel,
  useApplyForJob,
  useHasApplied,
} from "../../hooks/useQueries";

interface JobDetailModalProps {
  job: JobListing | null;
  open: boolean;
  onClose: () => void;
}

function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <Badge
      className={
        status === JobStatus.open
          ? "bg-success/15 text-success border-success/20"
          : "bg-muted text-muted-foreground"
      }
    >
      {status === JobStatus.open ? "Open" : "Closed"}
    </Badge>
  );
}

function JobTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    "Full Time": "bg-primary/10 text-primary border-primary/20",
    "Part Time": "bg-warning/10 text-warning-foreground border-warning/20",
    Contract: "bg-accent/10 text-accent-foreground border-accent/20",
    Remote: "bg-info/10 text-info-foreground border-info/20",
  };
  return (
    <Badge className={colors[type] ?? "bg-secondary text-secondary-foreground"}>
      {type}
    </Badge>
  );
}

export function JobDetailModal({ job, open, onClose }: JobDetailModalProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const { identity } = useInternetIdentity();
  const applicant = identity?.getPrincipal();

  const applyMutation = useApplyForJob();
  const { data: hasApplied, isLoading: checkingApplied } = useHasApplied(
    job?.id ?? BigInt(0),
    applicant,
  );

  const handleApply = async () => {
    if (!job) return;
    if (!coverLetter.trim()) {
      toast.error("Please write a cover letter before applying.");
      return;
    }
    try {
      await applyMutation.mutateAsync({ jobId: job.id, coverLetter });
      toast.success("Application submitted successfully!");
      setCoverLetter("");
      onClose();
    } catch {
      toast.error("Failed to submit application. Please try again.");
    }
  };

  if (!job) return null;

  const typeLabel = jobTypeLabel(job.jobType);
  const isClosed = job.status === JobStatus.closed;
  const isApplied = hasApplied === true;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
        data-ocid="job_detail.dialog"
      >
        <DialogHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <DialogTitle className="font-display text-xl font-700">
                {job.title}
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-1 text-base">
                <Building2 className="h-4 w-4" />
                {job.company}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <JobStatusBadge status={job.status} />
              <JobTypeBadge type={typeLabel} />
            </div>
          </div>
        </DialogHeader>

        {/* Meta Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            {job.salaryRange}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Posted {formatDate(job.postedDate)}
          </span>
        </div>

        <Separator />

        {/* Description */}
        <div>
          <h4 className="font-display mb-2 font-600 text-foreground">
            About the Role
          </h4>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {job.description}
          </p>
        </div>

        {/* Requirements */}
        <div>
          <h4 className="font-display mb-2 font-600 text-foreground">
            Requirements
          </h4>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {job.requirements}
          </p>
        </div>

        <Separator />

        {/* Apply Section */}
        {!isClosed && (
          <div>
            {isApplied ? (
              <div className="flex items-center gap-2 rounded-lg bg-success/10 p-4 text-success">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="text-sm font-500">
                  You&apos;ve already applied for this position.
                </span>
              </div>
            ) : (
              <>
                <h4 className="font-display mb-3 font-600 text-foreground">
                  Apply for this Role
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="cover-letter">Cover Letter *</Label>
                  <Textarea
                    id="cover-letter"
                    data-ocid="job_detail.cover_letter.textarea"
                    placeholder="Tell us why you're a great fit for this role..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {isClosed && (
          <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
            This position is no longer accepting applications.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!isClosed && !isApplied && (
            <Button
              onClick={handleApply}
              disabled={
                applyMutation.isPending ||
                checkingApplied ||
                !coverLetter.trim()
              }
              data-ocid="job_detail.apply_button"
            >
              {applyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          )}
          {!isClosed && !isApplied && coverLetter.trim() && (
            <span className="hidden" data-ocid="job_detail.submit_button" />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
