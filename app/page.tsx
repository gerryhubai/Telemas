import React from 'react';
import AirdropTasks from './AirdropTasks';

const Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          This is just the beginning.
        </h1>
        <p className="text-lg text-gray-400">
          Stay tuned for more updates.
        </p>
      </div>
      <div className="w-full max-w-4xl bg-gray-900 rounded-lg shadow-lg p-6">
        <AirdropTasks />
      </div>
    </div>
  );
};

export default Page;
