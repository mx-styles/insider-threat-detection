'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  Users,
  Activity,
  FileText,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

const AwsIcon = ({ className }: { className?: string }) => (
  <img src="/aws-color.svg" alt="AWS" className={className} />
);

const navigation = [
  { name: 'Security Dashboard', href: '/', icon: Shield },
  { name: 'Alert Center', href: '/alerts', icon: AlertTriangle },
  { name: 'Investigation', href: '/investigation', icon: Search },
  { name: 'User Profiles', href: '/users', icon: Users },
  { name: 'Behavioral Analytics', href: '/analytics', icon: Activity },
  { name: 'Audit Logs', href: '/audit-logs', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--surface-container-lowest)]/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-[var(--surface-container)] border-r border-[var(--outline-variant)] transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--outline-variant)]">
            <div className="flex items-center gap-3">
              <div className="h-12 rounded-md bg-[var(--primary-container)] flex items-center justify-center">
                <AwsIcon className="w-10 h-5" />
              </div>
              <div>
                <h1 className="font-semibold text-[var(--on-surface)]">Insider Threat Detection</h1>
                <p className="text-xs text-[var(--on-surface-variant)] font-mono">Explainable Hybrid Graph-Sequence Model</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-l-2 border-[var(--primary)]'
                          : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-high)] hover:text-[var(--on-surface)]'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="px-4 py-4 border-t border-[var(--outline-variant)]">
            <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors">
              <div className="w-8 h-8 rounded-full bg-[var(--primary-container)] flex items-center justify-center">
                <span className="text-xs font-semibold text-[var(--on-primary)]">JD</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-[var(--on-surface)]">Jonathan Doe</p>
                <p className="text-xs text-[var(--on-surface-variant)]">SOC Analyst</p>
              </div>
              <ChevronDown className="w-4 h-4 text-[var(--on-surface-variant)]" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--outline-variant)]">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--on-surface-variant)]" />
                <input
                  type="text"
                  placeholder="Search threats, users, logs..."
                  className="w-64 lg:w-96 pl-10 pr-4 py-2 bg-[var(--surface-container)] border border-[var(--outline-variant)] rounded-lg text-sm text-[var(--on-surface)] placeholder-[var(--on-surface-variant)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg hover:bg-[var(--surface-container-high)] transition-colors">
                <Bell className="w-5 h-5 text-[var(--on-surface-variant)]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--secondary)] rounded-full" />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-container)] rounded-lg">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                <span className="text-xs font-mono text-[var(--on-surface-variant)]">LIVE</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
