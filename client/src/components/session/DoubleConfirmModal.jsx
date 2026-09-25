import React, { useState } from 'react';
import Modal from '../common/Modal';
import { CheckCircle2, ShieldCheck, Coins, AlertCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

export default function DoubleConfirmModal({ isOpen, onClose, session, onConfirmSuccess }) {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!session) return null;

  const isTeacher = session.teacher?._id?.toString() === user?._id?.toString();
  const creditChange = session.creditAmount;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.patch(`/sessions/${session._id}/confirm`);
      if (res.data.success) {
        await refreshUser();
        onClose();
        if (onConfirmSuccess) onConfirmSuccess(res.data.session);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Session Completion"
      subtitle="Double-Confirmation Trust Protocol"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>How Double-Confirmation Works</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            To prevent fraud and maintain community trust, credits are finalized <strong>only after both participants confirm</strong> that the session took place.
          </p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-950">Economic Impact</p>
            <p className="text-xs text-emerald-800">
              {isTeacher
                ? `You will earn +${creditChange} Knowledge Credit upon double confirmation.`
                : `${creditChange} Reserved Credit will be permanently settled from your account.`}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center italic">
          Are you sure you want to mark this {session.skill?.name} session as successfully completed?
        </p>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Not Yet
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Confirming...' : 'Yes, Confirm Completion'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
