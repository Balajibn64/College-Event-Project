const LoadingSkeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg dark:bg-gray-700 ${className}`} />
  );
};

export const EventCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden dark:bg-gray-800 dark:border-gray-700">
      {/* Image skeleton */}
      <LoadingSkeleton className="h-48 w-full rounded-none" />
      
      {/* Content skeleton */}
      <div className="p-6">
        <LoadingSkeleton className="h-6 w-3/4 mb-3" />
        <LoadingSkeleton className="h-4 w-full mb-2" />
        <LoadingSkeleton className="h-4 w-2/3 mb-5" />
        
        {/* Details skeleton */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center">
            <LoadingSkeleton className="h-8 w-8 rounded-lg mr-3" />
            <LoadingSkeleton className="h-4 w-1/2" />
          </div>
          <div className="flex items-center">
            <LoadingSkeleton className="h-8 w-8 rounded-lg mr-3" />
            <LoadingSkeleton className="h-4 w-1/3" />
          </div>
          <div className="flex items-center">
            <LoadingSkeleton className="h-8 w-8 rounded-lg mr-3" />
            <LoadingSkeleton className="h-4 w-2/3" />
          </div>
        </div>
        
        {/* Progress bar skeleton */}
        <div className="mb-5">
          <div className="flex justify-between mb-2">
            <LoadingSkeleton className="h-3 w-16" />
            <LoadingSkeleton className="h-3 w-8" />
          </div>
          <LoadingSkeleton className="h-2 w-full rounded-full" />
        </div>
        
        {/* Button skeleton */}
        <LoadingSkeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
};

export const TableRowSkeleton = () => {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      <td className="px-6 py-4">
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-32" />
          <LoadingSkeleton className="h-3 w-24" />
        </div>
      </td>
      <td className="px-6 py-4">
        <LoadingSkeleton className="h-4 w-20" />
      </td>
      <td className="px-6 py-4">
        <LoadingSkeleton className="h-6 w-16 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <LoadingSkeleton className="h-4 w-16" />
          <LoadingSkeleton className="h-2 w-24 rounded-full" />
        </div>
      </td>
      <td className="px-6 py-4">
        <LoadingSkeleton className="h-8 w-24 rounded-lg" />
      </td>
    </tr>
  );
};

export default LoadingSkeleton;