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
  DollarSign
} from "lucide-react";

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
  });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  // Fetch class details
  const { data, loading, error } = useQuery(GET_CLASS_DETAILS, {
    variables: { id: classId },
    skip: !classId,
    onCompleted: (data) => {
      if (data?.class) {
        const cls = data.class;
        setFormData({
          name: cls.name || "",
          description: cls.description || "",
          subject: cls.subject || "",
          period: cls.period || "",
          gradeLevel: cls.gradeLevel ? cls.gradeLevel.toString() : "",
          defaultCurrency: cls.defaultCurrency || "CE$",
        });
      }
    },
  });

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

  const handleInputChange = (field: keyof ClassFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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
      };

      // Remove undefined values to avoid sending them
      const input = Object.fromEntries(
        Object.entries(cleanedInput).filter(([_, value]) => value !== undefined)
      );

      await updateClass({
        variables: {
          id: classId,
          input: input
        }
      });
    } catch (error) {
      console.error("Error updating class:", error);
    }
  };

  const handleDelete = async () => {
    if (!classId || !data?.class) return;
    
    if (deleteConfirmText !== data.class.name) {
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

  if (error || !data?.class) {
    return (
      <Card>
        <CardContent className="p-6 text-red-600">
          {error?.message || "Class not found"}
        </CardContent>
      </Card>
    );
  }

  const classData = data.class;

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
