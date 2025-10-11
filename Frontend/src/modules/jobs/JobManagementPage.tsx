import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Plus, Edit, Trash2, Users, DollarSign, Calendar } from "lucide-react";
import { JOBS, JOB_APPLICATIONS } from "../../graphql/queries/jobs";
import { DELETE_JOB, APPROVE_JOB_APPLICATION, REJECT_JOB_APPLICATION } from "../../graphql/mutations/jobs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { CreateEditJobDialog } from "./CreateEditJobDialog";
import { JobApplicationDialog } from "./JobApplicationDialog";
import { useToast } from "@/components/ui/toast";
import { useClassContext } from "@/context/ClassContext";

export function JobManagementPage() {
  const { currentClassId } = useClassContext();
  const { push: toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isApplicationDialogOpen, setIsApplicationDialogOpen] = useState(false);

  const { data: jobsData, loading: jobsLoading, refetch: refetchJobs } = useQuery(JOBS, {
    variables: { classId: currentClassId, activeOnly: false },
    skip: !currentClassId,
  });

  const { data: applicationsData, loading: applicationsLoading, refetch: refetchApplications } = useQuery(
    JOB_APPLICATIONS,
    {
      variables: { classId: currentClassId },
      skip: !currentClassId,
    }
  );

  const [deleteJob] = useMutation(DELETE_JOB, {
    onCompleted: () => {
      toast({ title: "Job deleted successfully" });
      refetchJobs();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const [approveApplication] = useMutation(APPROVE_JOB_APPLICATION, {
    onCompleted: () => {
      toast({ title: "Application approved! Student has been hired." });
      refetchApplications();
      refetchJobs();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const [rejectApplication] = useMutation(REJECT_JOB_APPLICATION, {
    onCompleted: () => {
      toast({ title: "Application rejected" });
      refetchApplications();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job? This cannot be undone.")) return;
    await deleteJob({ variables: { id: jobId } });
  };

  const handleEditJob = (job: any) => {
    setSelectedJob(job);
    setIsEditDialogOpen(true);
  };

  const handleViewApplication = (application: any) => {
    setSelectedApplication(application);
    setIsApplicationDialogOpen(true);
  };

  const handleApproveApplication = async (applicationId: string) => {
    if (!confirm("Approve this application and hire the student?")) return;
    await approveApplication({ variables: { id: applicationId } });
    setIsApplicationDialogOpen(false);
  };

  const handleRejectApplication = async (applicationId: string) => {
    const reason = prompt("Optional: Provide a reason for rejection");
    await rejectApplication({ variables: { id: applicationId, reason: reason || undefined } });
    setIsApplicationDialogOpen(false);
  };

  const jobs = jobsData?.jobs || [];
  const applications = applicationsData?.jobApplications || [];
  const pendingApplications = applications.filter((app: any) => app.status === "PENDING");

  const formatSalary = (job: any) => {
    const periodMap: Record<string, string> = {
      WEEKLY: "week",
      BIWEEKLY: "2 weeks",
      MONTHLY: "month",
      SEMESTER: "semester",
    };
    return `$${job.salary.amount}/${periodMap[job.period] || job.period}`;
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Management</h1>
          <p className="text-muted-foreground">Create and manage class jobs</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </div>

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList>
          <TabsTrigger value="jobs">
            Jobs ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="applications">
            Applications ({pendingApplications.length} pending)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          {jobsLoading ? (
            <p>Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No jobs created yet</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job: any) => (
                <Card key={job.id} className={!job.active ? "opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {job.title}
                          {!job.active && <Badge variant="secondary">Inactive</Badge>}
                        </CardTitle>
                        <CardDescription className="mt-2">{job.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditJob(job)}
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{formatSalary(job)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {job.capacity.current}/{job.capacity.max} filled
                      </span>
                    </div>
                    {job.rolesResponsibilities && (
                      <div className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                        <strong>Roles:</strong> {job.rolesResponsibilities.substring(0, 100)}
                        {job.rolesResponsibilities.length > 100 && "..."}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {applicationsLoading ? (
            <p>Loading applications...</p>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No applications yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {["PENDING", "APPROVED", "REJECTED"].map((status) => {
                const filtered = applications.filter((app: any) => app.status === status);
                if (filtered.length === 0) return null;

                return (
                  <div key={status}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      {status.charAt(0) + status.slice(1).toLowerCase()} Applications
                      <Badge variant="secondary">{filtered.length}</Badge>
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filtered.map((application: any) => (
                        <Card key={application.id} className="cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => handleViewApplication(application)}>
                          <CardHeader>
                            <CardTitle className="text-base">{application.student.name}</CardTitle>
                            <CardDescription>{application.job.title}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {application.applicationText}
                            </p>
                            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(application.createdAt).toLocaleDateString()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Job Dialog */}
      <CreateEditJobDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        classId={currentClassId!}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          refetchJobs();
        }}
      />

      {/* Edit Job Dialog */}
      <CreateEditJobDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        classId={currentClassId!}
        job={selectedJob}
        onSuccess={() => {
          setIsEditDialogOpen(false);
          refetchJobs();
          setSelectedJob(null);
        }}
      />

      {/* View Application Dialog */}
      {selectedApplication && (
        <Dialog open={isApplicationDialogOpen} onOpenChange={setIsApplicationDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Application from {selectedApplication.student.name}</DialogTitle>
              <DialogDescription>
                For: {selectedApplication.job.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Application Statement</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedApplication.applicationText}
                </p>
              </div>
              {selectedApplication.qualifications && (
                <div>
                  <h4 className="font-semibold mb-2">Qualifications</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.qualifications}
                  </p>
                </div>
              )}
              {selectedApplication.availability && (
                <div>
                  <h4 className="font-semibold mb-2">Availability</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.availability}
                  </p>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Applied on: {new Date(selectedApplication.createdAt).toLocaleString()}
              </div>
              {selectedApplication.status === "PENDING" && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleApproveApplication(selectedApplication.id)}
                    className="flex-1"
                  >
                    Approve & Hire
                  </Button>
                  <Button
                    onClick={() => handleRejectApplication(selectedApplication.id)}
                    variant="outline"
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
