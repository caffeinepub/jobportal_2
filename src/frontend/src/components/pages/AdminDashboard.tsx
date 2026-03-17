import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Briefcase,
  ChevronDown,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ApplicationStatus,
  type JobApplication,
  type JobListing,
  JobStatus,
  JobType,
  formatDate,
  jobTypeLabel,
  useAllJobs,
  useCreateJob,
  useDeleteJob,
  useJobApplications,
  useUpdateApplicationStatus,
  useUpdateJob,
} from "../../hooks/useQueries";
import { useGetUserProfile } from "../../hooks/useQueries";

// ─── Types ────────────────────────────────────────────────────────────────────

interface JobFormData {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string;
  salaryRange: string;
  jobType: JobType;
  status: JobStatus;
}

const defaultForm: JobFormData = {
  title: "",
  company: "",
  location: "",
  description: "",
  requirements: "",
  salaryRange: "",
  jobType: JobType.fullTime,
  status: JobStatus.open,
};

// ─── Job Form Modal ───────────────────────────────────────────────────────────

interface JobFormModalProps {
  open: boolean;
  onClose: () => void;
  editJob?: JobListing | null;
}

function JobFormModal({ open, onClose, editJob }: JobFormModalProps) {
  const [form, setForm] = useState<JobFormData>(
    editJob
      ? {
          title: editJob.title,
          company: editJob.company,
          location: editJob.location,
          description: editJob.description,
          requirements: editJob.requirements,
          salaryRange: editJob.salaryRange,
          jobType: editJob.jobType,
          status: editJob.status,
        }
      : defaultForm,
  );

  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const isEditing = !!editJob;
  const isPending = createJob.isPending || updateJob.isPending;

  const handleChange = (field: keyof JobFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.title ||
      !form.company ||
      !form.location ||
      !form.description ||
      !form.requirements ||
      !form.salaryRange
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      if (isEditing && editJob) {
        await updateJob.mutateAsync({ id: editJob.id, ...form });
        toast.success("Job updated successfully!");
      } else {
        await createJob.mutateAsync(form);
        toast.success("Job posted successfully!");
        setForm(defaultForm);
      }
      onClose();
    } catch {
      toast.error("Failed to save job. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        className="max-h-[90vh] max-w-2xl overflow-y-auto"
        data-ocid="admin.job_form.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-700">
            {isEditing ? "Edit Job" : "Post New Job"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title *</Label>
              <Input
                id="job-title"
                placeholder="e.g. Senior Frontend Engineer"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-company">Company *</Label>
              <Input
                id="job-company"
                placeholder="e.g. Acme Corp"
                value={form.company}
                onChange={(e) => handleChange("company", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="job-location">Location *</Label>
              <Input
                id="job-location"
                placeholder="e.g. New York, NY or Remote"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-salary">Salary Range *</Label>
              <Input
                id="job-salary"
                placeholder="e.g. $100k–$130k"
                value={form.salaryRange}
                onChange={(e) => handleChange("salaryRange", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Job Type *</Label>
              <Select
                value={form.jobType}
                onValueChange={(v) => handleChange("jobType", v as JobType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={JobType.fullTime}>Full Time</SelectItem>
                  <SelectItem value={JobType.partTime}>Part Time</SelectItem>
                  <SelectItem value={JobType.contract}>Contract</SelectItem>
                  <SelectItem value={JobType.remote}>Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isEditing && (
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => handleChange("status", v as JobStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={JobStatus.open}>Open</SelectItem>
                    <SelectItem value={JobStatus.closed}>Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-desc">Description *</Label>
            <Textarea
              id="job-desc"
              placeholder="Describe the role, responsibilities, team culture..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-reqs">Requirements *</Label>
            <Textarea
              id="job-reqs"
              placeholder="List required skills, experience, education..."
              value={form.requirements}
              onChange={(e) => handleChange("requirements", e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            data-ocid="admin.job_form.submit_button"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Saving..." : "Posting..."}
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Post Job"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Applicant Status Row ─────────────────────────────────────────────────────

function ApplicantRow({
  application,
  jobId,
}: {
  application: JobApplication;
  jobId: bigint;
}) {
  const updateStatus = useUpdateApplicationStatus();
  const { data: profile } = useGetUserProfile(application.applicant);

  const handleStatusChange = async (status: ApplicationStatus) => {
    try {
      await updateStatus.mutateAsync({
        jobId,
        applicant: application.applicant,
        status,
      });
      toast.success("Application status updated.");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const principalStr = `${application.applicant.toString().slice(0, 12)}...`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/30 px-4 py-3">
      <div>
        <p className="font-500 text-sm text-foreground">
          {profile?.name ?? principalStr}
        </p>
        {profile?.email && (
          <p className="text-xs text-muted-foreground">{profile.email}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Applied {formatDate(application.appliedDate)}
        </p>
      </div>
      <Select
        value={application.status}
        onValueChange={(v) => handleStatusChange(v as ApplicationStatus)}
        disabled={updateStatus.isPending}
      >
        <SelectTrigger className="w-36 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ApplicationStatus.pending}>Pending</SelectItem>
          <SelectItem value={ApplicationStatus.reviewed}>Reviewed</SelectItem>
          <SelectItem value={ApplicationStatus.accepted}>Accepted</SelectItem>
          <SelectItem value={ApplicationStatus.rejected}>Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Job Applications Accordion ───────────────────────────────────────────────

function JobApplicationsAccordion({ job }: { job: JobListing }) {
  const { data: applications, isLoading } = useJobApplications(job.id);

  return (
    <AccordionItem value={job.id.toString()} className="border-border/50">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-3 text-left">
          <div className="min-w-0">
            <p className="font-600 text-sm truncate">{job.title}</p>
            <p className="text-xs text-muted-foreground">{job.company}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs">
            <Users className="mr-1 h-3 w-3" />
            {isLoading ? "..." : (applications?.length ?? 0)}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}
        {!isLoading && applications && applications.length === 0 && (
          <p className="text-sm text-muted-foreground">No applicants yet.</p>
        )}
        {!isLoading && applications && applications.length > 0 && (
          <div className="space-y-2">
            {applications.map((app, i) => (
              <ApplicantRow
                key={`${app.applicant.toString()}-${i}`}
                application={app}
                jobId={job.id}
              />
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

// ─── Jobs Management Table ────────────────────────────────────────────────────

function AdminJobsTab() {
  const { data: jobs, isLoading } = useAllJobs();
  const deleteJob = useDeleteJob();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<JobListing | null>(null);

  const handleDelete = async (id: bigint) => {
    if (!confirm("Delete this job listing?")) return;
    try {
      await deleteJob.mutateAsync(id);
      toast.success("Job deleted.");
    } catch {
      toast.error("Failed to delete job.");
    }
  };

  const handleEdit = (job: JobListing) => {
    setEditTarget(job);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setTimeout(() => setEditTarget(null), 300);
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {jobs ? `${jobs.length} jobs listed` : "Loading..."}
        </p>
        <Button
          onClick={() => setFormOpen(true)}
          data-ocid="admin.post_job_button"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Post New Job
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {["sk1", "sk2", "sk3"].map((sk) => (
            <Skeleton key={sk} className="h-12 w-full" />
          ))}
        </div>
      )}

      {!isLoading && jobs && jobs.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Briefcase className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-500">No jobs posted yet</p>
          <p className="text-sm text-muted-foreground">
            Click "Post New Job" to get started.
          </p>
        </div>
      )}

      {!isLoading && jobs && jobs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-600">Title</TableHead>
                <TableHead className="font-600 hidden sm:table-cell">
                  Company
                </TableHead>
                <TableHead className="font-600 hidden md:table-cell">
                  Type
                </TableHead>
                <TableHead className="font-600 hidden md:table-cell">
                  Status
                </TableHead>
                <TableHead className="font-600 hidden lg:table-cell">
                  Posted
                </TableHead>
                <TableHead className="font-600 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map(([id, job], i) => (
                <TableRow
                  key={id.toString()}
                  className="transition-colors hover:bg-muted/20"
                  data-ocid={`admin.jobs.item.${i + 1}`}
                >
                  <TableCell className="font-500">{job.title}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {job.company}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary" className="text-xs">
                      {jobTypeLabel(job.jobType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      className={
                        job.status === JobStatus.open
                          ? "border-success/20 bg-success/10 text-success text-xs"
                          : "bg-muted text-muted-foreground text-xs"
                      }
                    >
                      {job.status === JobStatus.open ? "Open" : "Closed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground text-sm lg:table-cell">
                    {formatDate(job.postedDate)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(job)}
                        data-ocid={`admin.jobs.edit_button.${i + 1}`}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(id)}
                        disabled={deleteJob.isPending}
                        data-ocid={`admin.jobs.delete_button.${i + 1}`}
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        {deleteJob.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <JobFormModal
        open={formOpen}
        onClose={handleCloseForm}
        editJob={editTarget}
      />
    </>
  );
}

// ─── Applications Tab ─────────────────────────────────────────────────────────

function AdminApplicationsTab() {
  const { data: jobs, isLoading } = useAllJobs();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {["sk1", "sk2", "sk3"].map((sk) => (
          <Skeleton key={sk} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center">
        <Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-500">No jobs to review applications for</p>
        <p className="text-sm text-muted-foreground">
          Post a job first to start receiving applications.
        </p>
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/50"
    >
      {jobs.map(([, job]) => (
        <JobApplicationsAccordion key={job.id.toString()} job={job} />
      ))}
    </Accordion>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display mb-1 text-2xl font-700 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage job listings and review applications
        </p>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList className="mb-6">
          <TabsTrigger value="jobs" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Job Listings
          </TabsTrigger>
          <TabsTrigger value="applications" className="gap-2">
            <Users className="h-4 w-4" />
            Applications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <AdminJobsTab />
        </TabsContent>

        <TabsContent value="applications">
          <AdminApplicationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
