import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface JobApplication {
    status: ApplicationStatus;
    applicant: Principal;
    jobId: bigint;
    coverLetter: string;
    appliedDate: bigint;
}
export interface JobListing {
    id: bigint;
    status: JobStatus;
    title: string;
    jobType: JobType;
    postedDate: bigint;
    description: string;
    company: string;
    salaryRange: string;
    requirements: string;
    location: string;
}
export interface UserProfile {
    bio: string;
    name: string;
    role: UserRole;
    email: string;
}
export enum ApplicationStatus {
    pending = "pending",
    rejected = "rejected",
    reviewed = "reviewed",
    accepted = "accepted"
}
export enum JobStatus {
    closed = "closed",
    open = "open"
}
export enum JobType {
    remote = "remote",
    contract = "contract",
    partTime = "partTime",
    fullTime = "fullTime"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    applyForJob(jobId: bigint, coverLetter: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createJobListing(title: string, company: string, location: string, description: string, requirements: string, salaryRange: string, jobType: JobType): Promise<bigint>;
    deleteJobListing(id: bigint): Promise<void>;
    filterByJobType(jobType: JobType): Promise<Array<[bigint, JobListing]>>;
    filterByLocation(location: string): Promise<Array<[bigint, JobListing]>>;
    getAllJobListings(): Promise<Array<[bigint, JobListing]>>;
    getApplicantJobApplications(applicant: Principal): Promise<Array<JobApplication>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJobApplications(jobId: bigint): Promise<Array<JobApplication>>;
    getJobListing(id: bigint): Promise<JobListing>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasUserApplied(jobId: bigint, applicant: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchJobListings(searchTerm: string): Promise<Array<[bigint, JobListing]>>;
    setJobStatus(jobId: bigint, status: JobStatus): Promise<void>;
    updateApplicationStatus(jobId: bigint, applicant: Principal, status: ApplicationStatus): Promise<void>;
    updateJobListing(id: bigint, title: string, company: string, location: string, description: string, requirements: string, salaryRange: string, jobType: JobType, status: JobStatus): Promise<void>;
}
