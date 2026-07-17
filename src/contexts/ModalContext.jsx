import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const ModalContext = createContext();

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'info', // 'info', 'success', 'error', 'warning', 'confirm'
    title: '',
    message: '',
    danger: false,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: null,
    onCancel: null,
  });

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    // We don't nullify callbacks immediately to allow exit animations
  }, []);

  const showAlert = useCallback((title, message, type = 'info') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type,
        title,
        message,
        danger: false,
        confirmText: 'OK',
        onConfirm: () => {
          closeModal();
          resolve(true);
        },
        onCancel: () => {
          closeModal();
          resolve(true);
        },
      });
    });
  }, [closeModal]);

  const showConfirm = useCallback((title, message, options = {}) => {
    const { danger = false, confirmText = 'Confirm', cancelText = 'Cancel' } = options;
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: 'confirm',
        title,
        message,
        danger,
        confirmText,
        cancelText,
        onConfirm: () => {
          closeModal();
          resolve(true);
        },
        onCancel: () => {
          closeModal();
          resolve(false);
        },
      });
    });
  }, [closeModal]);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {modalState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={modalState.onCancel}
          />
          
          {/* Modal Panel */}
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 flex flex-col">
            
            {/* Header Icon & Close */}
            <div className={`p-6 pb-2 flex justify-between items-start`}>
              <div className={`
                p-3 rounded-2xl flex-shrink-0 flex items-center justify-center
                ${modalState.type === 'error' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' : ''}
                ${modalState.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                ${modalState.type === 'warning' || (modalState.type === 'confirm' && modalState.danger) ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                ${modalState.type === 'info' || (modalState.type === 'confirm' && !modalState.danger) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : ''}
              `}>
                {modalState.type === 'error' && <AlertCircle className="w-6 h-6" />}
                {modalState.type === 'success' && <CheckCircle2 className="w-6 h-6" />}
                {(modalState.type === 'warning' || (modalState.type === 'confirm' && modalState.danger)) && <AlertTriangle className="w-6 h-6" />}
                {(modalState.type === 'info' || (modalState.type === 'confirm' && !modalState.danger)) && <Info className="w-6 h-6" />}
              </div>
              
              <button 
                onClick={modalState.onCancel}
                className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="px-6 py-4 flex-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {modalState.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                {modalState.message}
              </p>
            </div>
            
            {/* Footer / Actions */}
            <div className="px-6 py-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-3xl mt-auto">
              {modalState.type === 'confirm' && (
                <button
                  onClick={modalState.onCancel}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  {modalState.cancelText}
                </button>
              )}
              
              <button
                onClick={modalState.onConfirm}
                className={`
                  px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-sm
                  ${modalState.danger || modalState.type === 'error' 
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20' 
                    : modalState.type === 'success'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20'
                      : 'bg-royal-blue hover:bg-blue-700 shadow-blue-900/20'
                  }
                `}
              >
                {modalState.confirmText}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
