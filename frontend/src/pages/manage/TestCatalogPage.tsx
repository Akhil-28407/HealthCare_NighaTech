import { useQuery } from '@tanstack/react-query';
import { testMasterApi } from '../../api';

export default function TestCatalogPage() {
  const { data, isLoading } = useQuery({ queryKey: ['test-master'], queryFn: () => testMasterApi.getAll({ limit: 100 }) });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Test Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />) :
        data?.data?.tests?.map((test: any) => (
          <div key={test._id} className="glass-card-hover p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white font-semibold">{test.name}</h3>
                <span className="badge badge-primary mt-1">{test.code}</span>
              </div>
              <span className="text-xl font-bold text-primary-400">₹{test.price}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-surface-300">Category: {test.category}</p>
              <p className="text-xs text-surface-300">Sample: {test.sampleType}</p>
              <p className="text-xs text-surface-300">TAT: {test.turnaroundTime}</p>
              <p className="text-xs text-surface-300">{test.parameters?.length || 0} parameters</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
