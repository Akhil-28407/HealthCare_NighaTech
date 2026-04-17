import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { invoicesApi } from '../../api';
import toast from 'react-hot-toast';
import { FiDownload, FiPrinter } from 'react-icons/fi';

export default function InvoiceViewPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.getById(id!),
    enabled: !!id,
  });

  const invoice = data?.data;

  const downloadPdf = async () => {
    try {
      const { data } = await invoicesApi.downloadPdf(id!);
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice?.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Download failed'); }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !invoice) return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="glass-card p-8 text-center">
        <p className="text-red-400 text-lg">Invoice not found</p>
      </div>
    </div>
  );

  const client = invoice.clientId as any;
  const branch = invoice.branchId as any;

  return (
    <div className="min-h-screen bg-surface-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mb-6">
          <button onClick={downloadPdf} className="btn-primary flex items-center gap-2"><FiDownload /> Download PDF</button>
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2"><FiPrinter /> Print</button>
        </div>

        {/* Invoice Card */}
        <div className="glass-card p-8 print:shadow-none print:border-none" id="invoice-content">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-primary-500 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-primary-400">{branch?.labName || branch?.name || 'HealthCare Lab'}</h1>
              <p className="text-sm text-surface-300 mt-1">{branch?.address}</p>
              <p className="text-sm text-surface-300">Phone: {branch?.phone} | Email: {branch?.email}</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-primary-400 uppercase">Invoice</h2>
              <p className="text-sm text-surface-300 mt-1"><strong>Number:</strong> {invoice.invoiceNumber}</p>
              <p className="text-sm text-surface-300"><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
              <p className="text-sm text-surface-300"><strong>Status:</strong> <span className={`font-semibold ${invoice.status === 'PAID' ? 'text-green-400' : 'text-yellow-400'}`}>{invoice.status}</span></p>
            </div>
          </div>

          {/* Parties */}
          <div className="flex justify-between mb-8">
            <div className="bg-surface-800/30 p-4 rounded-xl w-[45%]">
              <span className="text-xs text-primary-400 font-medium uppercase tracking-wider">Bill To:</span>
              <p className="text-lg text-white font-bold mt-1">{client?.name}</p>
              <p className="text-sm text-surface-300">{client?.email}</p>
              <p className="text-sm text-surface-300">{client?.mobile}</p>
              {client?.address && <p className="text-sm text-surface-300 mt-2">{client.address}</p>}
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-primary-700 text-white">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item: any, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-surface-800/20' : ''}>
                    <td className="px-4 py-3 text-sm text-white">{i + 1}</td>
                    <td className="px-4 py-3 text-sm text-white font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-right text-surface-300">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-right text-surface-300">₹{item.unitPrice}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-white">₹{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end space-y-2 border-t border-surface-700 pt-6">
            <div className="flex justify-between w-64 text-sm">
              <span className="text-surface-400">Subtotal:</span>
              <span className="text-white">₹{invoice.subtotal}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between w-64 text-sm">
                <span className="text-surface-400">Tax:</span>
                <span className="text-white">₹{invoice.tax}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex justify-between w-64 text-sm">
                <span className="text-surface-400">Discount:</span>
                <span className="text-red-400">-₹{invoice.discount}</span>
              </div>
            )}
            <div className="flex justify-between w-64 text-lg font-bold border-t-2 border-primary-500 pt-2 mt-2">
              <span className="text-primary-400 uppercase">Total:</span>
              <span className="text-white">₹{invoice.total}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center border-t border-surface-800 pt-6">
            <p className="text-sm text-white font-medium">Thank you for choosing our services.</p>
            <p className="text-[10px] text-surface-400 mt-2">
              Generated on {new Date().toLocaleString()} • This is a computer-generated invoice
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
