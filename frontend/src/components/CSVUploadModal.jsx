import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';

export default function CSVUploadModal({ isOpen, onClose }) {
  const { uploadCSV } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
      setResultMessage(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrorMsg(null);
      setResultMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg('Please select a bank statement CSV file');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await uploadCSV(file);
      setResultMessage(`Processed ${res.count} transactions in RAM memory buffer!`);
      setTimeout(() => {
        onClose();
        setFile(null);
        setResultMessage(null);
      }, 1800);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process CSV file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="glass-panel border border-cyan-500/30 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-extrabold text-white">
              Import Bank CSV Statement
            </h3>
            <p className="text-xs text-slate-400">
              Streams into RAM buffer without writing temporary files to server disk.
            </p>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            file
              ? 'border-cyan-500 bg-cyan-950/20'
              : 'border-slate-800 hover:border-cyan-500/50 bg-slate-900/50'
          }`}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-file-input"
          />

          <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-cyan-400">
              <Upload className="w-6 h-6" />
            </div>
            {file ? (
              <div>
                <div className="text-sm font-bold text-cyan-300 flex items-center justify-center gap-1">
                  <FileText className="w-4 h-4" /> {file.name}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
              </div>
            ) : (
              <div>
                <span className="text-sm font-medium text-slate-200">
                  Drag and drop CSV statement here, or{' '}
                  <span className="text-cyan-400 underline font-bold">browse</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Supports standard Indian bank exports (Date, Narrative, Amount)
                </p>
              </div>
            )}
          </label>
        </div>

        {/* Result or Error Notifications */}
        {resultMessage && (
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resultMessage}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-cyan-500/20"
          >
            {loading ? 'Streaming CSV...' : 'Process in RAM Buffer'}
          </button>
        </div>
      </div>
    </div>
  );
}
