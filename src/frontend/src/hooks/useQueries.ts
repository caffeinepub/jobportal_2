import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApplicationStatus,
  type JobApplication,
  type JobListing,
  JobStatus,
  JobType,
  type UserProfile,
  UserRole,
} from "../backend.d";
import { useActor } from "./useActor";

// ─── Utility ──────────────────────────────────────────────────────────────────

export function nanosToDate(nanos: bigint): Date {
  return new Date(Number(nanos / BigInt(1_000_000)));
}

export function formatDate(nanos: bigint): string {
  return nanosToDate(nanos).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function jobTypeLabel(jt: JobType): string {
  switch (jt) {
    case JobType.fullTime:
      return "Full Time";
    case JobType.partTime:
      return "Part Time";
    case JobType.contract:
      return "Contract";
    case JobType.remote:
      return "Remote";
  }
}

export { JobType, JobStatus, ApplicationStatus, UserRole };
export type { JobListing, JobApplication, UserProfile };

// ─── Auth / Role ──────────────────────────────────────────────────────────────

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<UserRole>({
    queryKey: ["callerRole", actor],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin", actor],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export function useAllJobs() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[bigint, JobListing]>>({
    queryKey: ["allJobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllJobListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchJobs(term: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[bigint, JobListing]>>({
    queryKey: ["searchJobs", term],
    queryFn: async () => {
      if (!actor) return [];
      if (!term.trim()) return actor.getAllJobListings();
      return actor.searchJobListings(term);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFilterByJobType(jobType: JobType | "all") {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[bigint, JobListing]>>({
    queryKey: ["filterJobs", jobType],
    queryFn: async () => {
      if (!actor) return [];
      if (jobType === "all") return actor.getAllJobListings();
      return actor.filterByJobType(jobType);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      company: string;
      location: string;
      description: string;
      requirements: string;
      salaryRange: string;
      jobType: JobType;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createJobListing(
        data.title,
        data.company,
        data.location,
        data.description,
        data.requirements,
        data.salaryRange,
        data.jobType,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["allJobs"] });
      void qc.invalidateQueries({ queryKey: ["searchJobs"] });
      void qc.invalidateQueries({ queryKey: ["filterJobs"] });
    },
  });
}

export function useUpdateJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      title: string;
      company: string;
      location: string;
      description: string;
      requirements: string;
      salaryRange: string;
      jobType: JobType;
      status: JobStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateJobListing(
        data.id,
        data.title,
        data.company,
        data.location,
        data.description,
        data.requirements,
        data.salaryRange,
        data.jobType,
        data.status,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["allJobs"] });
      void qc.invalidateQueries({ queryKey: ["searchJobs"] });
      void qc.invalidateQueries({ queryKey: ["filterJobs"] });
    },
  });
}

export function useDeleteJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteJobListing(id);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["allJobs"] });
      void qc.invalidateQueries({ queryKey: ["searchJobs"] });
      void qc.invalidateQueries({ queryKey: ["filterJobs"] });
    },
  });
}

// ─── Applications ─────────────────────────────────────────────────────────────

export function useApplyForJob() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { jobId: bigint; coverLetter: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.applyForJob(data.jobId, data.coverLetter);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["myApplications"] });
      void qc.invalidateQueries({ queryKey: ["hasApplied"] });
    },
  });
}

export function useMyApplications(applicant: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<JobApplication>>({
    queryKey: ["myApplications", applicant?.toString()],
    queryFn: async () => {
      if (!actor || !applicant) return [];
      return actor.getApplicantJobApplications(applicant);
    },
    enabled: !!actor && !isFetching && !!applicant,
  });
}

export function useJobApplications(jobId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Array<JobApplication>>({
    queryKey: ["jobApplications", jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === null) return [];
      return actor.getJobApplications(jobId);
    },
    enabled: !!actor && !isFetching && jobId !== null,
  });
}

export function useHasApplied(jobId: bigint, applicant: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["hasApplied", jobId.toString(), applicant?.toString()],
    queryFn: async () => {
      if (!actor || !applicant) return false;
      return actor.hasUserApplied(jobId, applicant);
    },
    enabled: !!actor && !isFetching && !!applicant,
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      jobId: bigint;
      applicant: Principal;
      status: ApplicationStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateApplicationStatus(
        data.jobId,
        data.applicant,
        data.status,
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["jobApplications"] });
    },
  });
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}

export function useGetUserProfile(user: Principal | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}
