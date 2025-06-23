"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Transaction } from "@/types";

const TransactionTable = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  //const [selectedIds, setSelectedIds] = useState([]);
  // const [sortConfig, setSortConfig] = useState({
  //   field: "date",
  //   direction: "desc",
  // });
  //const [searchTerm, setSearchTerm] = useState("");
  //const [typeFilter, setTypeFilter] = useState("");
  // const [recurringFilter, setRecurringFilter] = useState("");
  //const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const filteredAndSortedTransactions = transactions;
  //  const handleSort = () => {};
  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[50px]'>
                <Checkbox />
              </TableHead>
              <TableHead
                className='cursor-pointer'
                //  onClick={() => handleSort("date")}
              >
                <div className='flex items-center justify-start'>Date</div>
              </TableHead>
              <TableHead
                className='cursor-pointer'
                //  onClick={() => handleSort("date")}
              >
                <div className='flex items-center justify-start'>
                  Description
                </div>
              </TableHead>
              <TableHead
                className='cursor-pointer'
                //  onClick={() => handleSort("date")}
              >
                <div className='flex items-center justify-start'>Category</div>
              </TableHead>
              <TableHead
                className='cursor-pointer'
                //  onClick={() => handleSort("date")}
              >
                <div className='flex items-center justify-start'>Type</div>
              </TableHead>
              <TableHead
                className='cursor-pointer'
                //  onClick={() => handleSort("date")}
              >
                <div className='flex items-center justify-start'>Amount</div>
              </TableHead>
              <TableHead className='w-[50px] ' />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-center text-muted-foreground'
                >
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>
                  <TableCell>{transaction.description} </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "text-white bg-green-500",
                        transaction.category?.type === "EXPENSE" && "bg-red-500"
                      )}
                    >
                      {transaction.category?.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* <Badge
                      className={cn(
                        "text-muted-foreground bg-red-300",
                        transaction.type === "SALE" && "bg-green-200"
                      )}
                    >
                      {" "}
                      {transaction.type}
                    </Badge> */}

                    <span className='uppercase text-muted-foreground'>
                      {transaction.type}
                    </span>
                  </TableCell>
                  <TableCell
                    className='font-medium text-right'
                    style={{
                      color:
                        transaction.category?.type === "EXPENSE"
                          ? "red"
                          : "green",
                    }}
                  >
                    {transaction.category?.type === "EXPENSE" ? "-" : "+"}
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className='text-destructive'
                          //onClick={() => deleteFn([transaction.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
