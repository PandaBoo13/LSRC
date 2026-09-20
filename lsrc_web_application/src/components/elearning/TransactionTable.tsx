import { StatusPill } from './ui/StatusPill';

type Transaction = {
  id: string;
  course: string;
  date: string;
  amount: string;
  status: string;
};

type TransactionTableProps = {
  transactions: Transaction[];
  idLabel?: string;
};

export function TransactionTable({
  transactions,
  idLabel = 'Invoice',
}: TransactionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-slate-400">
          <tr>
            <th className="py-3">{idLabel}</th>
            <th>Course</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="py-4 font-semibold text-slate-900">{transaction.id}</td>
              <td className="text-slate-600">{transaction.course}</td>
              <td className="text-slate-500">{transaction.date}</td>
              <td className="font-semibold text-slate-900">{transaction.amount}</td>
              <td>
                <StatusPill tone={transaction.status === 'Paid' ? 'green' : 'rose'}>
                  {transaction.status}
                </StatusPill>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
