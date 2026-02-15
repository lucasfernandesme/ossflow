
import React from 'react';

const LoadingScreen: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex flex-col items-center justify-center z-[9999] animate-in fade-in duration-500">
            <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-zinc-900 dark:bg-white rounded-full blur-2xl opacity-10 animate-logo-pulse"></div>

                {/* Logo Image */}
                <div className="relative animate-logo-pulse">
                    <img
                        src="/logo.png"
                        alt="OssFlow Logo"
                        className="w-32 h-32 rounded-full object-cover shadow-2xl border-4 border-white dark:border-zinc-900"
                    />
                </div>
            </div>

            <div className="mt-12 flex flex-col items-center gap-3">
                <h2 className="text-2xl font-black italic tracking-tighter text-zinc-900 dark:text-white uppercase">OssFlow</h2>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
