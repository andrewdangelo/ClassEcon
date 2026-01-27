import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { GET_ALL_CLASSES, GET_STUDENTS_BY_CLASS } from '@/graphql/queries'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export function TransactionsPage() {
  const [selectedClassId, setSelectedClassId] = useState<string>('')

  const { data: classesData, loading: classesLoading } = useQuery(GET_ALL_CLASSES, {
    variables: { includeArchived: false },
  })

  const { data: studentsData, loading: studentsLoading } = useQuery(GET_STUDENTS_BY_CLASS, {
    variables: { classId: selectedClassId },
    skip: !selectedClassId,
  })

  const classes = classesData?.classes || []
  const students = studentsData?.studentsByClass || []

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case 'WITHDRAWAL':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'TRANSFER':
        return <ArrowLeftRight className="h-4 w-4 text-blue-500" />
      default:
        return <ArrowLeftRight className="h-4 w-4" />
    }
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <Badge variant="success">Deposit</Badge>
      case 'WITHDRAWAL':
        return <Badge variant="destructive">Withdrawal</Badge>
      case 'TRANSFER':
        return <Badge variant="default">Transfer</Badge>
      case 'PURCHASE':
        return <Badge variant="secondary">Purchase</Badge>
      case 'SALARY':
        return <Badge className="bg-blue-500">Salary</Badge>
      case 'FINE':
        return <Badge variant="destructive">Fine</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          View transactions and balances across classes
        </p>
      </div>

      {/* Class Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class to view transactions" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.period && `(P${cls.period})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedClassId ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a class to view student balances and transactions</p>
          </CardContent>
        </Card>
      ) : studentsLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Student Balances */}
          <Card>
            <CardHeader>
              <CardTitle>Student Balances</CardTitle>
              <CardDescription>
                Current balances for students in this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No students in this class
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student: any) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              student.balance >= 0 ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            {formatCurrency(student.balance)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Circulation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    students.reduce(
                      (sum: number, s: any) => sum + Math.max(0, s.balance),
                      0
                    )
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {students.length > 0
                    ? formatCurrency(
                        Math.round(
                          students.reduce((sum: number, s: any) => sum + s.balance, 0) /
                            students.length
                        )
                      )
                    : formatCurrency(0)}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
