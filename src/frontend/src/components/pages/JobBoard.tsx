import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import {
  type JobListing,
  JobStatus,
  JobType,
  formatDate,
  jobTypeLabel,
  useAllJobs,
} from "../../hooks/useQueries";
import { JobDetailModal } from "./JobDetailModal";

const filterTabs = [
  { id: "all", label: "All Jobs" },
  { id: JobType.fullTime, label: "Full Time" },
  { id: JobType.partTime, label: "Part Time" },
  { id: JobType.contract, label: "Contract" },
  { id: JobType.remote, label: "Remote" },
] as const;

type FilterId = (typeof filterTabs)[number]["id"];

function JobTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    "Full Time": "bg-primary/10 text-primary border-primary/20",
    "Part Time": "bg-warning/10 text-warning-foreground border-warning/20",
    Contract: "bg-accent/10 text-accent-foreground border-accent/20",
    Remote: "bg-info/10 text-info-foreground border-info/20",
  };
  return (
    <Badge
      className={`text-xs ${colors[type] ?? "bg-secondary text-secondary-foreground"}`}
    >
      {type}
    </Badge>
  );
}

function JobCard({
  job,
  index,
  onClick,
}: {
  job: JobListing;
  index: number;
  onClick: () => void;
}) {
  const typeLabel = jobTypeLabel(job.jobType);
  const ocid = `jobs.item.${index}` as const;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      data-ocid={ocid}
      className="group cursor-pointer rounded-xl border border-border/50 bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-card-hover"
      onClick={onClick}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display mb-0.5 truncate font-700 text-foreground group-hover:text-primary">
            {job.title}
          </h3>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{job.company}</span>
          </p>
        </div>
        <JobTypeBadge type={typeLabel} />
      </div>

      {/* Meta */}
      <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {job.location}
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="h-3.5 w-3.5" />
          {job.salaryRange}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(job.postedDate)}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Badge
          className={
            job.status === JobStatus.open
              ? "border-success/20 bg-success/10 text-success text-xs"
              : "bg-muted text-muted-foreground text-xs"
          }
        >
          {job.status === JobStatus.open ? "Open" : "Closed"}
        </Badge>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs group-hover:border-primary/50 group-hover:text-primary"
        >
          <Briefcase className="h-3.5 w-3.5" />
          View & Apply
        </Button>
      </div>
    </motion.article>
  );
}

function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="mb-2 h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="mb-4 flex gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

export function JobBoard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: allJobs, isLoading, isError } = useAllJobs();

  const filteredJobs = useMemo(() => {
    if (!allJobs) return [];
    let jobs = allJobs.map(([, job]) => job);

    // Filter by type
    if (activeFilter !== "all") {
      jobs = jobs.filter((j) => j.jobType === activeFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      jobs = jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(term) ||
          j.company.toLowerCase().includes(term) ||
          j.location.toLowerCase().includes(term) ||
          j.description.toLowerCase().includes(term),
      );
    }

    return jobs;
  }, [allJobs, activeFilter, searchTerm]);

  const handleJobClick = useCallback((job: JobListing) => {
    setSelectedJob(job);
    setModalOpen(true);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="font-display mb-1 text-2xl font-700 tracking-tight">
          Browse Jobs
        </h1>
        <p className="text-muted-foreground">Discover your next opportunity</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          data-ocid="jobs.search_input"
          placeholder="Search jobs, companies, or locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Tabs */}
      <div className="mb-8 flex flex-wrap gap-2" data-ocid="jobs.filter.tab">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-500 transition-all ${
              activeFilter === tab.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          data-ocid="jobs.loading_state"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {["s1", "s2", "s3", "s4", "s5", "s6"].map((sk) => (
            <JobCardSkeleton key={sk} />
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div
          data-ocid="jobs.error_state"
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center"
        >
          <p className="font-500 text-destructive">
            Failed to load job listings
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please try refreshing the page.
          </p>
        </div>
      )}

      {/* Job Grid */}
      {!isLoading && !isError && (
        <>
          {filteredJobs.length > 0 && (
            <p className="mb-4 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-600 text-foreground">
                {filteredJobs.length}
              </span>{" "}
              {filteredJobs.length === 1 ? "job" : "jobs"}
            </p>
          )}

          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              data-ocid="jobs.list"
            >
              {filteredJobs.map((job, i) => (
                <JobCard
                  key={job.id.toString()}
                  job={job}
                  index={i + 1}
                  onClick={() => handleJobClick(job)}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {filteredJobs.length === 0 && (
            <div
              data-ocid="jobs.empty_state"
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-20 text-center"
            >
              <div className="mb-4 rounded-full bg-muted p-4">
                <Briefcase className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display mb-2 font-700 text-lg">
                No jobs found
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                {searchTerm
                  ? `No results for "${searchTerm}". Try adjusting your search.`
                  : "No jobs available in this category right now."}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setTimeout(() => setSelectedJob(null), 300);
        }}
      />
    </div>
  );
}
