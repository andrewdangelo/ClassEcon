import * as React from "react";
import { useQuery } from "@apollo/client/react";
import { STUDENTS_BY_TEACHER } from "@/graphql/queries/studentsByTeacher";
import { StudentsByTeacherQuery } from "@/graphql/__generated__/graphql";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";

export default function Students() {
  const { push } = useToast();
  const [q, setQ] = React.useState("");

  const { data, loading, error } = useQuery<StudentsByTeacherQuery>(
    STUDENTS_BY_TEACHER,
    { fetchPolicy: "cache-and-network" }
  );

  React.useEffect(() => {
    if (error) {
      push({
        title: "Failed to load students",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, push]);

  const all = data?.studentsByTeacher ?? [];
  const filtered = all.filter((s) =>
    s.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Students</h2>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={loading ? "Loading..." : "Search students..."}
          className="max-w-sm"
          disabled={loading}
        />
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading students…</div>
      ) : filtered.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>
                  {s.class?.name}
                  {s.class?.period ? ` · ${s.class.period}` : ""}
                </TableCell>
                <TableCell className="text-right">
                  CE$ {s.balance ?? 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-sm text-muted-foreground">
          No students match your search.
        </div>
      )}
    </div>
  );
}
