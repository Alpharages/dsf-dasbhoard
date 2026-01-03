import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { LogOut, Mail, Shield, User } from 'lucide-react';

export const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Profile & Settings</h1>
                <p className="text-slate-400 mt-2">Manage your account settings and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center border-4 border-slate-800 shadow-xl mb-4">
                                <span className="text-3xl font-bold text-white">
                                    {user.fullName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-white">{user.fullName}</h2>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                            <div className="mt-4 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{user.role}</span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-center gap-3 text-slate-300 p-3 bg-slate-800/50 rounded-xl">
                                <User className="w-5 h-5 text-blue-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Full Name</p>
                                    <p className="font-medium">{user.fullName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300 p-3 bg-slate-800/50 rounded-xl">
                                <Mail className="w-5 h-5 text-blue-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">Email Address</p>
                                    <p className="font-medium truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300 p-3 bg-slate-800/50 rounded-xl">
                                <Shield className="w-5 h-5 text-blue-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 uppercase font-semibold">User Role</p>
                                    <p className="font-medium">{user.role}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800">
                            <button
                                onClick={logout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-semibold rounded-xl transition-all border border-rose-500/20"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Security Settings */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Shield className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Security Settings</h3>
                                <p className="text-sm text-slate-400">Update your password and security preferences</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-800 pt-6">
                            <ChangePasswordForm />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
