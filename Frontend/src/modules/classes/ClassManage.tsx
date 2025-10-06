// src/modules/classes/ClassManage.tsx
import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { 
  Save, 
  Trash2, 
  ArrowLeft, 
  AlertTriangle,
  Settings,
  Users,
  DollarSign,
  Plus,
  X
} from "lucide-react";
import { REASONS_BY_CLASS, SET_REASONS } from "@/graphql/queries/reasons";

// GraphQL Queries and Mutations
const GET_CLASS_DETAILS = gql`
  query GetClassDetails($id: ID!) {
    class(id: $id) {
      id
      name
      description
      subject
      period
      gradeLevel
      defaultCurrency
      joinCode
      status
      slug
      schoolName
      district
      payPeriodDefault
      startingBalance
      isArchived
      storeSettings
      reasons {
        id
        label
      }
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_CLASS = gql`
  mutation UpdateClass($id: ID!, $input: UpdateClassInput!) {
    updateClass(id: $id, input: $input) {
      id
      name
      description
      subject
      period
      gradeLevel
      defaultCurrency
      status
      slug
      schoolName
      district
      payPeriodDefault
      startingBalance
      isArchived
      storeSettings
    }
  }
`;

const DELETE_CLASS = gql`
  mutation DeleteClass($id: ID!) {
    deleteClass(id: $id)
  }
`;

interface ClassFormData {
  name: string;
  description: string;
  subject: string;
  period: string;
  gradeLevel: string;
  defaultCurrency: string;
  allowNegative: boolean;
  requireFineReason: boolean;
  perItemPurchaseLimit: string;
  schoolName: string;
  district: string;
  payPeriodDefault: string;
  startingBalance: string;
  slug: string;
  status: string;
  isArchived: boolean;
  reasons: string[];
}

export default function ClassManage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  
  const [formData, setFormData] = React.useState<ClassFormData>({
    name: "",
    description: "",
    subject: "",
    period: "",
    gradeLevel: "",
    defaultCurrency: "",
    allowNegative: false,
    requireFineReason: true,
    perItemPurchaseLimit: "",
    schoolName: "",
    district: "",
    payPeriodDefault: "",
    startingBalance: "",
    slug: "",
    status: "",
    isArchived: false,
    reasons: [],
  });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [newReason, setNewReason] = React.useState("");

  // Fetch class details
  const { data, loading, error } = useQuery(GET_CLASS_DETAILS, {
    variables: { id: classId },
    skip: !classId,
  });

  // Update form data when class data is loaded
  React.useEffect(() => {
    if ((data as any)?.class) {
      const cls = (data as any).class;
      const storeSettings: any = cls.storeSettings || {};
      setFormData({
        name: cls.name || "",
        description: cls.description || "",
        subject: cls.subject || "",
        period: cls.period || "",
        gradeLevel: cls.gradeLevel ? cls.gradeLevel.toString() : "",
        defaultCurrency: cls.defaultCurrency || "CE$",
        allowNegative: !!storeSettings.allowNegative,
        requireFineReason: storeSettings.requireFineReason !== undefined ? !!storeSettings.requireFineReason : true,
        perItemPurchaseLimit: storeSettings.perItemPurchaseLimit != null ? String(storeSettings.perItemPurchaseLimit) : "",
        schoolName: cls.schoolName || "",
        district: cls.district || "",
        payPeriodDefault: cls.payPeriodDefault || "",
        startingBalance: cls.startingBalance ? cls.startingBalance.toString() : "",
        slug: cls.slug || "",
        status: cls.status || "ACTIVE",
        isArchived: !!cls.isArchived,
        reasons: cls.reasons?.map((r: any) => r.label) || [],
      });
    }
  }, [data]);

  // Mutations
  const [updateClass] = useMutation(UPDATE_CLASS, {
    onCompleted: () => {
      push({
        title: "Class updated",
        description: "Your class has been successfully updated.",
      });
      setIsSaving(false);
    },
    onError: (error) => {
      push({
        title: "Failed to update class",
        description: error.message,
        variant: "destructive",
      });
      setIsSaving(false);
    },
  });

  const [setReasons] = useMutation(SET_REASONS, {
    onCompleted: () => {
      push({
        title: "Reasons updated",
        description: "Fine reasons have been updated successfully.",
      });
    },
    onError: (error) => {
      push({
        title: "Failed to update reasons",
        description: error.message,
        variant: "destructive",
      });
    },
    refetchQueries: [
      { query: REASONS_BY_CLASS, variables: { classId } },
      { query: GET_CLASS_DETAILS, variables: { id: classId } }
    ],
    awaitRefetchQueries: true,
  });

  const [deleteClass] = useMutation(DELETE_CLASS, {
    onCompleted: () => {
      push({
        title: "Class deleted",
        description: "The class has been permanently deleted.",
      });
      navigate("/classes");
    },
    onError: (error) => {
      push({
        title: "Failed to delete class",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      setDeleteConfirmText("");
    },
  });

  const handleInputChange = (field: keyof ClassFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReasonAdd = () => {
    if (newReason.trim() && !formData.reasons.includes(newReason.trim())) {
      setFormData(prev => ({
        ...prev,
        reasons: [...prev.reasons, newReason.trim()]
      }));
      setNewReason("");
    }
  };

  const handleReasonRemove = (reasonToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      reasons: prev.reasons.filter(r => r !== reasonToRemove)
    }));
  };

  const handleSave = async () => {
    if (!classId) return;
    
    setIsSaving(true);
    try {
      // Clean the form data to handle empty strings properly
      const cleanedInput = {
        name: formData.name || undefined,
        description: formData.description || undefined,
        subject: formData.subject || undefined,
        period: formData.period || undefined,
        gradeLevel: formData.gradeLevel ? parseInt(formData.gradeLevel, 10) : undefined,
        defaultCurrency: formData.defaultCurrency || undefined,
        schoolName: formData.schoolName || undefined,
        district: formData.district || undefined,
        payPeriodDefault: formData.payPeriodDefault || undefined,
        startingBalance: formData.startingBalance ? parseInt(formData.startingBalance, 10) : undefined,
        slug: formData.slug || undefined,
        status: formData.status || undefined,
        isArchived: formData.isArchived,
        storeSettings: {
          allowNegative: formData.allowNegative,
          requireFineReason: formData.requireFineReason,
          perItemPurchaseLimit: formData.perItemPurchaseLimit === "" ? null : parseInt(formData.perItemPurchaseLimit, 10)
        }
      };

      // Remove undefined values to avoid sending them
      const input = Object.fromEntries(
        Object.entries(cleanedInput).filter(([key, value]) => {
          if (value === undefined) return false;
          if (key === 'storeSettings') return true; // always send policies block
          return true;
        })
      );

      // Update class data
      await updateClass({
        variables: {
          id: classId,
          input: input
        }
      });

      // Update reasons separately if they've changed
      const originalReasons = ((data as any)?.class?.reasons || []).map((r: any) => r.label).sort();
      const currentReasons = formData.reasons.slice().sort();
      
      if (JSON.stringify(originalReasons) !== JSON.stringify(currentReasons)) {
        await setReasons({
          variables: {
            classId: classId,
            labels: formData.reasons
          }
        });
      }
    } catch (error) {
      console.error("Error updating class:", error);
    }
  };

  const handleDelete = async () => {
    if (!classId || !(data as any)?.class) return;
    
    if (deleteConfirmText !== (data as any).class.name) {
      push({
        title: "Confirmation failed",
        description: "Please type the exact class name to confirm deletion.",
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteClass({
        variables: { id: classId }
      });
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">Loading class details...</CardContent>
      </Card>
    );
  }

  if (error || !(data as any)?.class) {
    return (
      <Card>
        <CardContent className="p-6 text-red-600">
          {error?.message || "Class not found"}
        </CardContent>
      </Card>
    );
  }

  const classData = (data as any).class;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/classes/${classId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Class
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Manage Class
            </h1>
            <p className="text-muted-foreground">
              Update class information and settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Class Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Class Information
          </CardTitle>
          <CardDescription>
            Update basic class information and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter class name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="e.g., Math, Science, English"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Input
                id="period"
                value={formData.period}
                onChange={(e) => handleInputChange("period", e.target.value)}
                placeholder="e.g., 1st, 2nd, 3rd"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Input
                id="gradeLevel"
                type="number"
                min="0"
                max="12"
                value={formData.gradeLevel}
                onChange={(e) => handleInputChange("gradeLevel", e.target.value)}
                placeholder="e.g., 5, 9, 12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Input
                id="defaultCurrency"
                value={formData.defaultCurrency}
                onChange={(e) => handleInputChange("defaultCurrency", e.target.value)}
                placeholder="e.g., CE$, Points, Tokens"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name</Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => handleInputChange("schoolName", e.target.value)}
                placeholder="Enter school name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                placeholder="Enter district name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payPeriodDefault">Default Pay Period</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.payPeriodDefault || undefined}
                  onValueChange={(value) => handleInputChange("payPeriodDefault", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pay period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="BIWEEKLY">Bi-weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="SEMESTER">Semester</SelectItem>
                  </SelectContent>
                </Select>
                {formData.payPeriodDefault && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange("payPeriodDefault", "")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startingBalance">Starting Balance</Label>
              <Input
                id="startingBalance"
                type="number"
                min="0"
                value={formData.startingBalance}
                onChange={(e) => handleInputChange("startingBalance", e.target.value)}
                placeholder="e.g., 100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (Optional)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                placeholder="e.g., mr-smith-math"
              />
              <p className="text-xs text-muted-foreground">Unique identifier for URL access</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex items-center">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.isArchived}
                  onChange={(e) => handleInputChange('isArchived', e.target.checked)}
                />
                Archive this class
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your classroom economy..."
              rows={3}
            />
          </div>

          {/* Policies */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold">Policies</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.allowNegative}
                  onChange={(e) => handleInputChange('allowNegative', e.target.checked)}
                />
                Allow negative balances
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.requireFineReason}
                  onChange={(e) => handleInputChange('requireFineReason', e.target.checked)}
                />
                Require fine reason
              </label>
              <div className="space-y-2">
                <Label htmlFor="perItemPurchaseLimit">Per-item purchase limit</Label>
                <Input
                  id="perItemPurchaseLimit"
                  value={formData.perItemPurchaseLimit}
                  onChange={(e) => handleInputChange('perItemPurchaseLimit', e.target.value)}
                  placeholder="Blank = no limit"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Adjust classroom economy policies set during creation.</p>
          </div>
        </CardContent>
      </Card>

      {/* Fine Reasons Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fine Reasons
          </CardTitle>
          <CardDescription>
            Manage the reasons available for pay requests and fines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {formData.reasons.map((reason) => (
              <div
                key={reason}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <span>{reason}</span>
                <button
                  type="button"
                  onClick={() => handleReasonRemove(reason)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {formData.reasons.length === 0 && (
              <p className="text-sm text-muted-foreground">No fine reasons configured</p>
            )}
          </div>
          
          <div className="flex gap-2">
            <Input
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Enter new reason..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleReasonAdd();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleReasonAdd}
              disabled={!newReason.trim() || formData.reasons.includes(newReason.trim())}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            These reasons will be available when students submit pay requests or when teachers issue fines.
          </p>
        </CardContent>
      </Card>

      {/* Class Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Class Statistics
          </CardTitle>
          <CardDescription>
            Read-only information about your class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Join Code</p>
              <p className="text-lg font-mono font-bold">{classData.joinCode}</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-lg font-semibold">
                {new Date(classData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-lg font-semibold capitalize">{classData.status?.toLowerCase()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently affect your class
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-semibold text-red-800">Delete Class</h3>
              <p className="text-sm text-red-600">
                Permanently delete this class and all associated data. This action cannot be undone.
              </p>
            </div>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Class: {classData.name}
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete the class
                    and remove all associated data including student records, transactions,
                    and store items.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="deleteConfirm">
                      Type the class name "{classData.name}" to confirm deletion:
                    </Label>
                    <Input
                      id="deleteConfirm"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={classData.name}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDeleteDialogOpen(false);
                        setDeleteConfirmText("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteConfirmText !== classData.name}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Class
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
