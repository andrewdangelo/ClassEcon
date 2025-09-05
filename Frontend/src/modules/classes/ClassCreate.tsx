import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useClassContext } from "@/context/ClassContext";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CREATE_CLASS } from "@/graphql/mutations/createClass";

const jobPeriods = ["WEEKLY", "MONTHLY", "SEMESTER"] as const;
const currencyRegex = /^[A-Z$€£¥]{1,4}$/;

// ---------- Validation Schema ----------
const StudentSchema = z.object({
  name: z.string().min(1, "Student name is required"),
});

const JobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  payPeriod: z.enum(jobPeriods, { required_error: "Pick a pay period" }),
  salary: z.coerce.number().int().positive("Salary must be > 0"),
  slots: z.coerce.number().int().positive("Slots must be > 0"),
});

const StoreItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  price: z.coerce.number().int().positive("Price must be > 0"),
  stock: z.coerce.number().int().nonnegative("Stock must be ≥ 0"),
});

// 🔁 Rename form fields to period/subject
const FormSchema = z.object({
  name: z.string().min(2, "Class name is required"),
  period: z.string().optional(),
  subject: z.string().optional(),
  defaultCurrency: z
    .string()
    .regex(currencyRegex, "Use a short code like CE$, USD, EUR"),
  allowNegative: z.boolean(),
  requireFineReason: z.boolean(),
  perItemPurchaseLimit: z.union([
    z.literal(""),
    z.coerce.number().int().positive("Must be a positive integer"),
  ]),
  students: z
    .array(StudentSchema)
    .max(200, "Keep under 200 students")
    .default([]),
  jobs: z.array(JobSchema).max(50, "Keep under 50 jobs").default([]),
  storeItems: z
    .array(StoreItemSchema)
    .max(200, "Keep under 200 items")
    .default([]),
});

type FormValues = z.infer<typeof FormSchema>;
type Mode = "edit" | "review";

export default function ClassCreate() {
  const { role, setCurrentClassId } = useClassContext();
  const { push } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<Mode>("edit");

  const [createClassMutation] = useMutation(CREATE_CLASS);

  if (role !== "TEACHER") {
    return (
      <div className="text-sm text-muted-foreground">
        This page is for teachers only.
      </div>
    );
  }

  const {
    control,
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      period: "Fall",
      subject: "",
      defaultCurrency: "CE$",
      allowNegative: false,
      requireFineReason: true,
      perItemPurchaseLimit: "",
      students: [{ name: "" }],
      jobs: [{ title: "", payPeriod: "WEEKLY", salary: 20, slots: 1 }],
      storeItems: [{ name: "", price: 10, stock: 10 }],
    },
  });

  const studentsFA = useFieldArray({ control, name: "students" });
  const jobsFA = useFieldArray({ control, name: "jobs" });
  const storeFA = useFieldArray({ control, name: "storeItems" });

  // ---- submit handler (final confirm) ----
  const onSubmit = async (data: FormValues) => {
    try {
      // Map UI fields (period/subject) → resolver input (term/room)
      const input = {
        name: data.name.trim(),
        term: data.period || undefined, // backend expects `term`
        room: data.subject || undefined, // backend expects `room`
        defaultCurrency: data.defaultCurrency || "CE$",
        storeSettings: {
          allowNegative: data.allowNegative,
          requireFineReason: data.requireFineReason,
          perItemPurchaseLimit:
            data.perItemPurchaseLimit === ""
              ? null
              : Number(data.perItemPurchaseLimit),
        },
        students: data.students
          .filter((s) => s.name.trim() !== "")
          .map((s) => ({ name: s.name.trim() })),
        jobs: data.jobs
          .filter((j) => j.title.trim() !== "")
          .map((j) => ({
            title: j.title.trim(),
            payPeriod: j.payPeriod,
            salary: j.salary,
            slots: j.slots,
          })),
        storeItems: data.storeItems
          .filter((i) => i.name.trim() !== "")
          .map((i) => ({
            title: i.name.trim(), // resolver expects `title`
            price: i.price,
            stock: i.stock,
          })),
      };

      const { data: result } = await createClassMutation({
        variables: { input },
      });
      const created = result?.createClass;
      if (!created) throw new Error("CreateClass returned no data");

      setCurrentClassId(created.id);

      push({
        title: "Class created",
        description: `${created.name} (${created.period || "—"})`, // selection set returns period/subject
      });

      navigate(`/classes/${created.id}`);
    } catch (err: any) {
      push({
        title: "Failed to create class",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  // ---- move to review if valid ----
  const goToReview = async () => {
    const ok = await trigger();
    if (ok) setMode("review");
  };

  // ---- tiny error component ----
  const Err = ({ msg }: { msg?: string }) =>
    msg ? <div className="mt-1 text-xs text-destructive">{msg}</div> : null;

  // =========================
  // EDIT MODE
  // =========================
  if (mode === "edit") {
    return (
      <form className="grid gap-6" onSubmit={(e) => e.preventDefault()}>
        {/* Basics */}
        <Card>
          <CardHeader>
            <CardTitle>New Class</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Class Name *
              </label>
              <Input placeholder="e.g., Algebra I" {...register("name")} />
              <Err msg={errors.name?.message} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Period</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...register("period")}
              >
                <option value="Fall">Fall</option>
                <option value="Winter">Winter</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="">Other / None</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Subject</label>
              <Input
                placeholder="e.g., 201 or Algebra"
                {...register("subject")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Default Currency
              </label>
              <Input placeholder="CE$" {...register("defaultCurrency")} />
              <div className="mt-1 text-xs text-muted-foreground">
                Short code like CE$, USD, EUR.
              </div>
              <Err msg={errors.defaultCurrency?.message} />
            </div>
          </CardContent>
        </Card>

        {/* Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Policies</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("allowNegative")} />
              Allow negative balances (debt)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("requireFineReason")} />
              Require reason when issuing fines
            </label>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                Per-item purchase limit
              </label>
              <Input
                placeholder="e.g., 2"
                {...register("perItemPurchaseLimit")}
              />
              <div className="mt-1 text-xs text-muted-foreground">
                Leave blank for no limit.
              </div>
              <Err
                msg={errors.perItemPurchaseLimit?.message as string | undefined}
              />
            </div>
          </CardContent>
        </Card>

        {/* Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Students</CardTitle>
            <Button
              type="button"
              variant="secondary"
              onClick={() => studentsFA.append({ name: "" })}
            >
              Add Student
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {studentsFA.fields.map((field, idx) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <Input
                    placeholder="e.g., Jordan P."
                    {...register(`students.${idx}.name` as const)}
                  />
                  <Err msg={errors.students?.[idx]?.name?.message} />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => studentsFA.remove(idx)}
                  aria-label={`Remove student ${idx + 1}`}
                >
                  Remove
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Jobs</CardTitle>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                jobsFA.append({
                  title: "",
                  payPeriod: "WEEKLY",
                  salary: 20,
                  slots: 1,
                })
              }
            >
              Add Job
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobsFA.fields.map((field, idx) => (
              <div key={field.id} className="grid gap-3 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Title
                  </label>
                  <Input
                    placeholder="e.g., Board Cleaner"
                    {...register(`jobs.${idx}.title` as const)}
                  />
                  <Err msg={errors.jobs?.[idx]?.title?.message} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Pay Period
                  </label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register(`jobs.${idx}.payPeriod` as const)}
                  >
                    {jobPeriods.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <Err msg={errors.jobs?.[idx]?.payPeriod?.message} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Salary
                  </label>
                  <Input
                    type="number"
                    min={1}
                    {...register(`jobs.${idx}.salary` as const)}
                  />
                  <Err msg={errors.jobs?.[idx]?.salary?.message} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Slots
                  </label>
                  <Input
                    type="number"
                    min={1}
                    {...register(`jobs.${idx}.slots` as const)}
                  />
                  <Err msg={errors.jobs?.[idx]?.slots?.message} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Store Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Store Items</CardTitle>
            <Button
              type="button"
              variant="secondary"
              onClick={() => storeFA.append({ name: "", price: 10, stock: 10 })}
            >
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {storeFA.fields.map((field, idx) => (
              <div key={field.id} className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Item Name
                  </label>
                  <Input
                    placeholder="e.g., Homework Pass"
                    {...register(`storeItems.${idx}.name` as const)}
                  />
                  <Err msg={errors.storeItems?.[idx]?.name?.message} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Price
                  </label>
                  <Input
                    type="number"
                    min={1}
                    {...register(`storeItems.${idx}.price` as const)}
                  />
                  <Err msg={errors.storeItems?.[idx]?.price?.message} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Stock
                  </label>
                  <Input
                    type="number"
                    min={0}
                    {...register(`storeItems.${idx}.stock` as const)}
                  />
                  <Err msg={errors.storeItems?.[idx]?.stock?.message} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button type="button" onClick={goToReview}>
            Review & Confirm
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => history.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  // =========================
  // REVIEW MODE
  // =========================
  const vals = getValues();
  const currency = vals.defaultCurrency || "CE$";
  const cleanStudents = vals.students.filter((s) => s.name.trim() !== "");
  const cleanJobs = vals.jobs.filter((j) => j.title.trim() !== "");
  const cleanItems = vals.storeItems.filter((i) => i.name.trim() !== "");

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Class Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Name</div>
            <div className="font-medium">{vals.name}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Period</div>
            <div className="font-medium">{vals.period || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Subject</div>
            <div className="font-medium">{vals.subject || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Currency</div>
            <div className="font-medium">{currency}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Policies</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-3">
          <div>
            <div className="text-sm text-muted-foreground">Allow Negative</div>
            <div className="font-medium">
              {vals.allowNegative ? "Yes" : "No"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              Require Fine Reason
            </div>
            <div className="font-medium">
              {vals.requireFineReason ? "Yes" : "No"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Per-item Limit</div>
            <div className="font-medium">
              {vals.perItemPurchaseLimit === ""
                ? "None"
                : vals.perItemPurchaseLimit}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students ({cleanStudents.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {cleanStudents.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No students added.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                </tr>
              </thead>
              <tbody>
                {cleanStudents.map((s, i) => (
                  <tr key={`${s.name}-${i}`} className="border-b last:border-0">
                    <td className="py-2 pr-4">{s.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jobs ({cleanJobs.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {cleanJobs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No jobs added.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left">
                <tr>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Pay Period</th>
                  <th className="py-2 pr-4">Salary</th>
                  <th className="py-2 pr-0 text-right">Slots</th>
                </tr>
              </thead>
              <tbody>
                {cleanJobs.map((j, i) => (
                  <tr
                    key={`${j.title}-${i}`}
                    className="border-b last:border-0"
                  >
                    <td className="py-2 pr-4">{j.title}</td>
                    <td className="py-2 pr-4">{j.payPeriod}</td>
                    <td className="py-2 pr-4">{`${currency} ${j.salary}`}</td>
                    <td className="py-2 pr-0 text-right">{j.slots}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store Items ({cleanItems.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {cleanItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No store items added.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b text-left">
                <tr>
                  <th className="py-2 pr-4">Item</th>
                  <th className="py-2 pr-4">Price</th>
                  <th className="py-2 pr-0 text-right">Stock</th>
                </tr>
              </thead>
              <tbody>
                {cleanItems.map((it, i) => (
                  <tr
                    key={`${it.name}-${i}`}
                    className="border-b last:border-0"
                  >
                    <td className="py-2 pr-4">{it.name}</td>
                    <td className="py-2 pr-4">{`${currency} ${it.price}`}</td>
                    <td className="py-2 pr-0 text-right">{it.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setMode("edit")}
          disabled={isSubmitting}
        >
          Back & Edit
        </Button>
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating…" : "Confirm & Create"}
        </Button>
      </div>
    </div>
  );
}
