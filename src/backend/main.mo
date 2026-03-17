import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type UserRole = AccessControl.UserRole;

  public type JobType = { #fullTime; #partTime; #contract; #remote };
  public type JobStatus = { #open; #closed };
  public type ApplicationStatus = { #pending; #reviewed; #accepted; #rejected };

  public type UserProfile = {
    name : Text;
    email : Text;
    bio : Text;
    role : UserRole;
  };

  public type JobListing = {
    id : Nat;
    title : Text;
    company : Text;
    location : Text;
    description : Text;
    requirements : Text;
    salaryRange : Text;
    jobType : JobType;
    status : JobStatus;
    postedDate : Int;
  };

  public type JobApplication = {
    jobId : Nat;
    applicant : Principal;
    coverLetter : Text;
    status : ApplicationStatus;
    appliedDate : Int;
  };

  module JobListing {
    public func compare(job1 : JobListing, job2 : JobListing) : Order.Order {
      Nat.compare(job1.id, job2.id);
    };
  };

  module JobApplication {
    public func compare(app1 : JobApplication, app2 : JobApplication) : Order.Order {
      if (app1.jobId == app2.jobId) {
        Principal.compare(app1.applicant, app2.applicant);
      } else {
        Nat.compare(app1.jobId, app2.jobId);
      };
    };
  };

  let jobListings = Map.empty<Nat, JobListing>();
  var nextJobId = 1;

  let jobApplications = Map.empty<Nat, Set.Set<Principal>>();

  module ApplicationKey {
    public func compare(key1 : (Nat, Principal), key2 : (Nat, Principal)) : Order.Order {
      if (key1.0 == key2.0) {
        Principal.compare(key1.1, key2.1);
      } else {
        Nat.compare(key1.0, key2.0);
      };
    };
  };

  let applicationDetails = Map.empty<(Nat, Principal), JobApplication>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();

  func getJobOrTrap(id : Nat) : JobListing {
    switch (jobListings.get(id)) {
      case (null) { Runtime.trap("Job not found") };
      case (?job) { job };
    };
  };

  func verifyOwnershipOrAdmin(caller : Principal, owner : Principal) {
    if (caller != owner and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
  };

  // Authorization mixin
  include MixinAuthorization(accessControlState);

  // Job Listing Management
  public shared ({ caller }) func createJobListing(title : Text, company : Text, location : Text, description : Text, requirements : Text, salaryRange : Text, jobType : JobType) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let job : JobListing = {
      id = nextJobId;
      title;
      company;
      location;
      description;
      requirements;
      salaryRange;
      jobType;
      status = #open;
      postedDate = Time.now();
    };

    jobListings.add(nextJobId, job);
    nextJobId += 1;
    job.id;
  };

  public shared ({ caller }) func updateJobListing(id : Nat, title : Text, company : Text, location : Text, description : Text, requirements : Text, salaryRange : Text, jobType : JobType, status : JobStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let oldJob = getJobOrTrap(id);

    let updatedJob : JobListing = {
      id;
      title;
      company;
      location;
      description;
      requirements;
      salaryRange;
      jobType;
      status;
      postedDate = oldJob.postedDate;
    };

    jobListings.add(id, updatedJob);
  };

  public shared ({ caller }) func deleteJobListing(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (jobListings.get(id) == null) {
      Runtime.trap("Job not found");
    };

    jobListings.remove(id);
  };

  public query ({ caller }) func getJobListing(id : Nat) : async JobListing {
    getJobOrTrap(id);
  };

  public query ({ caller }) func getAllJobListings() : async [(Nat, JobListing)] {
    jobListings.toArray();
  };

  public query ({ caller }) func searchJobListings(searchTerm : Text) : async [(Nat, JobListing)] {
    jobListings.toArray().filter(func((_, job)) { job.title.contains(#text searchTerm) });
  };

  public query ({ caller }) func filterByLocation(location : Text) : async [(Nat, JobListing)] {
    jobListings.toArray().filter(func((_, job)) { job.location.contains(#text location) });
  };

  public query ({ caller }) func filterByJobType(jobType : JobType) : async [(Nat, JobListing)] {
    jobListings.toArray().filter(func((_, job)) { job.jobType == jobType });
  };

  // Job Application Management
  public shared ({ caller }) func applyForJob(jobId : Nat, coverLetter : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can apply for jobs");
    };

    let _ = getJobOrTrap(jobId);

    let application : JobApplication = {
      jobId;
      applicant = caller;
      coverLetter;
      status = #pending;
      appliedDate = Time.now();
    };

    var applicants = switch (jobApplications.get(jobId)) {
      case (null) { Set.empty<Principal>() };
      case (?existing) { existing };
    };

    if (applicants.contains(caller)) {
      Runtime.trap("Already applied for this job");
    };

    applicants.add(caller);
    jobApplications.add(jobId, applicants);
    applicationDetails.add((jobId, caller), application);
  };

  public query ({ caller }) func getApplicantJobApplications(applicant : Principal) : async [JobApplication] {
    verifyOwnershipOrAdmin(caller, applicant);
    applicationDetails.toArray().filter(func((key, _)) { key.1 == applicant }).map(func((_, app)) { app });
  };

  public query ({ caller }) func getJobApplications(jobId : Nat) : async [JobApplication] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    applicationDetails.toArray().filter(func((key, _)) { key.0 == jobId }).map(func((_, app)) { app });
  };

  public shared ({ caller }) func updateApplicationStatus(jobId : Nat, applicant : Principal, status : ApplicationStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (applicationDetails.get((jobId, applicant))) {
      case (null) { Runtime.trap("Application not found") };
      case (?application) {
        let updatedApplication = {
          jobId = application.jobId;
          applicant = application.applicant;
          coverLetter = application.coverLetter;
          status;
          appliedDate = application.appliedDate;
        };
        applicationDetails.add((jobId, applicant), updatedApplication);
      };
    };
  };

  // User Profile Management - Required interface functions
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func setJobStatus(jobId : Nat, status : JobStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let job = getJobOrTrap(jobId);

    let updatedJob : JobListing = {
      id = job.id;
      title = job.title;
      company = job.company;
      location = job.location;
      description = job.description;
      requirements = job.requirements;
      salaryRange = job.salaryRange;
      jobType = job.jobType;
      status;
      postedDate = job.postedDate;
    };

    jobListings.add(jobId, updatedJob);
  };

  public query ({ caller }) func hasUserApplied(jobId : Nat, applicant : Principal) : async Bool {
    if (caller != applicant and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own application status");
    };
    switch (jobApplications.get(jobId)) {
      case (null) { false };
      case (?applicants) { applicants.contains(applicant) };
    };
  };
};
