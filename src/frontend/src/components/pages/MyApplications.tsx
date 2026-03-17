import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Loader2 } from "lucide-react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  ApplicationStatus,
  type JobApplication,
  formatDate,
  useAllJobs,
  useMyApplications,
} from "../../hooks/useQueries";

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config: Record<ApplicationStatus, { label: string; classes: string }> =
    {
      [ApplicationStatus.pending]: {
        label: "Pending",
        classes: "bg-warning/15 text-warning-foreground border-warning/20",
      },
      [ApplicationStatus.reviewed]: {
        label: "Reviewed",
        classes: "bg-info/15 text-info-foreground border-info/20",
      },
      [ApplicationStatus.accepted]: {
        label: "Accepted",
        classes: "bg-success/15 text-success border-success/20",
      },
      [ApplicationStatus.rejected]: {
        label: "Rejected",
        classes: "bg-destructive/15 text-destructive border-destructive/20",
      },
    };

  const { label, classes } = config[status] ?? {
    label: status,
    classes: "bg-muted text-muted-foreground",
  };

  return <Badge className={`text-xs ${classes}`}>{label}</Badge>;
}

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16" />
      </TableCell>
    </TableRow>
  );
}

export function MyApplications() {
  const { identity } = useInternetIdentity();
  const applicant = identity?.getPrincipal();

  const {
    data: applications,
    isLoading,
    isError,
  } = useMyApplications(applicant);

  const { data: allJobs } = useAllJobs();

  // Build a map of jobId → title/company
  const jobMap = new Map<string, { title: string; company: string }>();
  if (allJobs) {
    for (const [id, job] of allJobs) {
      jobMap.set(id.toString(), { title: job.title, company: job.company });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display mb-1 text-2xl font-700 tracking-tight">
          My Applications
        </h1>
        <p className="text-muted-foreground">
          Track the status of your job applications
        </p>
      </div>

      {/* Loading */}
      {(isLoading || !applications) && (
        <div
          data-ocid="applications.loading_state"
          className="rounded-xl border border-border/50 overflow-hidden"
        >
          <Table data-ocid="applications.table">
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {["r1", "r2", "r3"].map((sk) => (
                <RowSkeleton key={sk} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <p className="font-500 text-destructive">
            Failed to load applications
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !isError && applications && applications.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border/50">
          <Table data-ocid="applications.table">
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-600">Job Title</TableHead>
                <TableHead className="font-600">Company</TableHead>
                <TableHead className="font-600">Applied</TableHead>
                <TableHead className="font-600">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app: JobApplication, i) => {
                const jobInfo = jobMap.get(app.jobId.toString());
                return (
                  <TableRow
                    key={`${app.jobId}-${i}`}
                    className="transition-colors hover:bg-muted/20"
                    data-ocid={"applications.row"}
                  >
                    <TableCell className="font-500">
                      {jobInfo?.title ?? `Job #${app.jobId}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {jobInfo?.company ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(app.appliedDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={app.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && applications && applications.length === 0 && (
        <div
          data-ocid="applications.empty_state"
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-20 text-center"
        >
          <div className="mb-4 rounded-full bg-muted p-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display mb-2 font-700 text-lg">
            No applications yet
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Browse available jobs and apply to start tracking your applications
            here.
          </p>
        </div>
      )}

      {/* Not logged in / no principal */}
      {!applicant && (
        <div className="flex items-center justify-center gap-2 p-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your identity...</span>
        </div>
      )}
    </div>
  );
}
