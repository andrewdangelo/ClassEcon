import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import { Briefcase, DollarSign, Users, Calendar, FileText } from "lucide-react";
import { JOBS, JOB_APPLICATIONS } from "../../graphql/queries/jobs";
import { APPLY_FOR_JOB, WITHDRAW_JOB_APPLICATION } from "../../graphql/mutations/jobs";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "../../hooks/useAuth";
import { useClassContext } from "@/context/ClassContext";

export function JobBoardPage() {
  const { currentClassId } = useClassContext();
  const { user } = useAuth();
  const { push: toast } = useToast();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    applicationText: "",
    qualifications: "",
    availability: "",
  });

  const { data: jobsData, loading: jobsLoading, refetch: refetchJobs } = useQuery(JOBS, {
    variables: { classId: currentClassId, activeOnly: true },
    skip: !currentClassId,
  });

  const { data: applicationsData, loading: applicationsLoading, refetch: refetchApplications } = useQuery(
    JOB_APPLICATIONS,
    {
      variables: { classId: currentClassId, studentId: user?.id },
      skip: !currentClassId || !user?.id,
    }
  );

  const [applyForJob, { loading: applying }] = useMutation(APPLY_FOR_JOB, {
    onCompleted: () => {
      toast({ title: "Application submitted successfully!" });
      setIsApplyDialogOpen(false);
      setApplicationForm({ applicationText: "", qualifications: "", availability: "" });
      refetchApplications();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const [withdrawApplication] = useMutation(WITHDRAW_JOB_APPLICATION, {
    onCompleted: () => {
      toast({ title: "Application withdrawn" });
      refetchApplications();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleApply = (job: any) => {
    setSelectedJob(job);
    setIsApplyDialogOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    await applyForJob({
      variables: {
        input: {
          jobId: selectedJob.id,
          applicationText: applicationForm.applicationText,
          qualifications: applicationForm.qualifications || undefined,
          availability: applicationForm.availability || undefined,
        },
      },
    });
  };

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    await withdrawApplication({ variables: { id: applicationId } });
  };

  const jobs = jobsData?.jobs || [];
  const applications = applicationsData?.jobApplications || [];
  
  // Get IDs of jobs the student has already applied to or been approved for
  const appliedJobIds = new Set(
    applications
      .filter((app: any) => ["PENDING", "APPROVED"].includes(app.status))
      .map((app: any) => app.jobId)
  );

  const formatSalary = (job: any) => {
    const periodMap: Record<string, string> = {
      WEEKLY: "week",
      BIWEEKLY: "2 weeks",
      MONTHLY: "month",
      SEMESTER: "semester",
    };
    return `$${job.salary.amount}/${periodMap[job.period] || job.period}`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: "default",
      APPROVED: "success",
      REJECTED: "destructive",
      WITHDRAWN: "secondary",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Board</h1>
        <p className="text-muted-foreground">Browse and apply for available class jobs</p>
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList>
          <TabsTrigger value="available">
            Available Jobs ({jobs.filter((j: any) => !appliedJobIds.has(j.id) && j.capacity.current < j.capacity.max).length})
          </TabsTrigger>
          <TabsTrigger value="my-applications">
            My Applications ({applications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {jobsLoading ? (
            <p>Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No jobs available at the moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job: any) => {
                const hasApplied = appliedJobIds.has(job.id);
                const isFull = job.capacity.current >= job.capacity.max;
                const canApply = !hasApplied && !isFull;

                return (
                  <Card key={job.id} className={!canApply ? "opacity-60" : ""}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {job.title}
                        {hasApplied && <Badge variant="secondary">Applied</Badge>}
                        {isFull && <Badge variant="destructive">Full</Badge>}
                      </CardTitle>
                      <CardDescription>{job.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{formatSalary(job)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {job.capacity.current}/{job.capacity.max} positions filled
                        </span>
                      </div>
                      {job.rolesResponsibilities && (
                        <div className="text-sm text-muted-foreground pt-2 border-t">
                          <div className="flex items-start gap-2">
                            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <strong>Responsibilities:</strong>
                              <p className="mt-1">{job.rolesResponsibilities.substring(0, 150)}
                                {job.rolesResponsibilities.length > 150 && "..."}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {canApply && (
                        <Button
                          onClick={() => handleApply(job)}
                          className="w-full mt-4"
                        >
                          Apply Now
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-applications" className="space-y-4">
          {applicationsLoading ? (
            <p>Loading applications...</p>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">You haven't applied to any jobs yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application: any) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {application.job.title}
                          {getStatusBadge(application.status)}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {application.job.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{formatSalary(application.job)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-sm pt-2 border-t">
                      <strong>Your Application:</strong>
                      <p className="mt-1 text-muted-foreground whitespace-pre-wrap">
                        {application.applicationText}
                      </p>
                    </div>
                    {application.status === "PENDING" && (
                      <Button
                        onClick={() => handleWithdraw(application.id)}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        Withdraw Application
                      </Button>
                    )}
                    {application.status === "APPROVED" && (
                      <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 rounded-md text-sm">
                        <strong className="text-green-700 dark:text-green-300">Congratulations!</strong>
                        <p className="text-green-600 dark:text-green-400 mt-1">
                          You've been hired for this position. Check your employment details in your profile.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Apply Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Tell us why you'd be great for this job
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitApplication} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="applicationText">Why do you want this job? *</Label>
              <Textarea
                id="applicationText"
                value={applicationForm.applicationText}
                onChange={(e) =>
                  setApplicationForm({ ...applicationForm, applicationText: e.target.value })
                }
                placeholder="Explain why you're interested in this position and what you can bring to it..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications (Optional)</Label>
              <Textarea
                id="qualifications"
                value={applicationForm.qualifications}
                onChange={(e) =>
                  setApplicationForm({ ...applicationForm, qualifications: e.target.value })
                }
                placeholder="Any relevant skills or experience..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability (Optional)</Label>
              <Textarea
                id="availability"
                value={applicationForm.availability}
                onChange={(e) =>
                  setApplicationForm({ ...applicationForm, availability: e.target.value })
                }
                placeholder="When are you available to work? Any schedule constraints?"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsApplyDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={applying}>
                {applying ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
