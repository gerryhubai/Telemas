import React from 'react';
import AirdropTasks from './AirdropTasks';

const Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-green flex flex-col items-center py-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          This is just the beginning.
        </h1>
        <p className="text-lg text-gray-600">
          Stay tuned for more updates.
        </p>
      </div>
      <div className="w-full max-w-4xl">
        <AirdropTasks />
      </div>
    </div>
  );
};

export default Page;
