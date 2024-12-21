'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Users, CheckSquare } from 'lucide-react';

const NavLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center space-x-2 ${isActive ? 'text-yellow-400' : 'text-white hover:text-yellow-200'}`}
    >
      {icon}
      <span className="text-lg">{label}</span>
    </Link>
  );
};

const Footer = () => {
  return (
    <footer className="bg-red-900 text-white py-4 px-6 flex justify-between items-center fixed bottom-0 left-0 right-0 z-30">
      <div className="flex items-center space-x-4">
        <NavLink
          href="/dailychest"
          icon={<img src="telemas-treasure-chest.png" alt="Quest Chest" className="w-8 h-8" />}
          label=""
        />
        <Link href="/">
          <span className="font-bold text-4xl cursor-pointer">🎅</span>
        </Link>
      </div>
      <nav className="flex space-x-8">
        <NavLink href="/friends" icon={<Users size={24} />} label="Friends" />
        <NavLink href="/tasks" icon={<CheckSquare size={24} />} label="Tasks" />
        <NavLink href="/airdrop" icon={<span>🥇</span>} label="Airdrop" />
      </nav>
    </footer>
  );
};

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isMainPage = pathname === '/';

  const [isLoading, setIsLoading] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor;
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

    setIsAllowed(isMobile);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-center">
        <div className="p-4 bg-red-800 text-white rounded-lg">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p>This web app can only be accessed on a mobile device.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className={`flex-grow ${isMainPage ? '' : 'overflow-auto pb-20'}`}>{children}</main>
      <Footer />
    </div>
  );
};

export default ClientLayout;
