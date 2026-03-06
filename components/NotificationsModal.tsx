
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { AppNotification } from '../types';
import { StudentService } from '../services/studentService';
import { formatLocalDisplayDate } from '../utils/dateUtils';

interface NotificationsModalProps {
    userId: string;
    userRole: 'STUDENT' | 'TRAINER';
    onClose: () => void;
    onUnreadChange?: (count: number) => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
    userId,
    userRole,
    onClose,
    onUnreadChange
}) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const data = await StudentService.getNotifications(userId, userRole);
            setNotifications(data);
            if (onUnreadChange) {
                const unreadCount = data.filter(n => !n.isRead).length;
                onUnreadChange(unreadCount);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [userId, userRole]);

    const handleMarkAsRead = async (notification: AppNotification) => {
        if (notification.isRead) return;

        try {
            await StudentService.markNotificationAsRead(notification.id);
            const updated = notifications.map(n =>
                n.id === notification.id ? { ...n, isRead: true } : n
            );
            setNotifications(updated);
            if (onUnreadChange) {
                const unreadCount = updated.filter(n => !n.isRead).length;
                onUnreadChange(unreadCount);
            }
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-950 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-zinc-950 shadow-lg">
                            <Icons.Bell size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-zinc-950 dark:text-white uppercase tracking-tight">Notificações</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">Suas mensagens e avisos</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all shadow-sm border border-zinc-100 dark:border-zinc-700"
                    >
                        <Icons.X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-8 h-8 border-4 border-zinc-950 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Carregando...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleMarkAsRead(notification)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${notification.isRead
                                    ? 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 opacity-60'
                                    : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 shadow-sm'
                                    }`}
                            >
                                {!notification.isRead && (
                                    <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                )}
                                <div className="space-y-1 pr-4">
                                    <h4 className={`text-sm font-black uppercase tracking-tight ${notification.isRead ? 'text-zinc-600 dark:text-zinc-400' : 'text-zinc-950 dark:text-white'}`}>
                                        {notification.title}
                                    </h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                        {notification.body}
                                    </p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Icons.Clock className="w-3 h-3 text-zinc-400" />
                                        <span className="text-[9px] font-bold text-zinc-400 uppercase">
                                            {formatLocalDisplayDate(notification.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 px-6 space-y-4">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto text-zinc-300 dark:text-zinc-700">
                                <Icons.Bell size={32} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-zinc-900 dark:text-white font-black uppercase text-xs tracking-widest">Nenhuma notificação</p>
                                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-tight">Você ainda não recebeu avisos.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                        onClick={onClose}
                        className="w-full bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationsModal;
