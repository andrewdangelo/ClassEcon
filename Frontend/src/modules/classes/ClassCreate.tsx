import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useClassContext } from "@/context/ClassContext";
import { apiCreateClass, apiSeedClassEntities } from "@/api/classes";
import { slugify } from "@/lib/slug";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

const FormSchema = z.object({
  name: z.string().min(2, "Class name is required"),
  term: z.string().optional(),
  room: z.string().optional(),
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

export default function ClassCreate() {
  const { role, addClass, setCurrentClassId } = useClassContext();
  const { push } = useToast();
  const navigate = useNavigate();

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
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      term: "Fall",
      room: "",
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

  const onSubmit = async (data: FormValues) => {
    try {
      // 1) create core class
      const created = await apiCreateClass({
        name: data.name.trim(),
        term: data.term || undefined,
        room: data.room || undefined,
        defaultCurrency: data.defaultCurrency || "CE$",
        policies: {
          allowNegative: data.allowNegative,
          requireFineReason: data.requireFineReason,
          perItemPurchaseLimit:
            data.perItemPurchaseLimit === ""
              ? null
              : Number(data.perItemPurchaseLimit),
        },
      });
      // 2) add to context + finalize id
      const baseId = slugify(created.name || "class");
      const finalId = addClass({ ...created, id: baseId });
      setCurrentClassId(finalId);

      // 3) seed entities (students, jobs, store items)
      const seed = {
        students: data.students.filter((s) => s.name.trim() !== ""),
        jobs: data.jobs.filter((j) => j.title.trim() !== ""),
        storeItems: data.storeItems.filter((i) => i.name.trim() !== ""),
      };
      if (seed.students.length || seed.jobs.length || seed.storeItems.length) {
        await apiSeedClassEntities(finalId, seed);
      }

      push({
        title: "Class created",
        description: `${created.name} (${created.term || "—"})`,
      });
      navigate(`/classes/${finalId}`);
    } catch (err: any) {
      push({
        title: "Failed to create class",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  // ---------- UI helpers ----------
  const Err = ({ msg }: { msg?: string }) =>
    msg ? <div className="mt-1 text-xs text-destructive">{msg}</div> : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
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
            <label className="mb-1 block text-sm font-medium">Term</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register("term")}
            >
              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="">Other / None</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Room</label>
            <Input placeholder="e.g., 201" {...register("room")} />
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
          {errors.students?.root?.message && (
            <Err msg={errors.students.root.message} />
          )}
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
                <label className="mb-1 block text-sm font-medium">Title</label>
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
                <label className="mb-1 block text-sm font-medium">Salary</label>
                <Input
                  type="number"
                  min={1}
                  {...register(`jobs.${idx}.salary` as const)}
                />
                <Err msg={errors.jobs?.[idx]?.salary?.message} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Slots</label>
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
                <label className="mb-1 block text-sm font-medium">Price</label>
                <Input
                  type="number"
                  min={1}
                  {...register(`storeItems.${idx}.price` as const)}
                />
                <Err msg={errors.storeItems?.[idx]?.price?.message} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Stock</label>
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create Class"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => history.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
