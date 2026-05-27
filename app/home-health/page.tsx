'use client';

import Link from 'next/link';
import { useState } from 'react';

const COMMON_DIAGNOSES = [
  { code: 'I10', label: 'Essential Hypertension' },
  { code: 'E11.9', label: 'Type 2 Diabetes' },
  { code: 'J44.9', label: 'COPD' },
  { code: 'I50.9', label: 'Heart Failure' },
  { code: 'I63.9', label: 'Ischemic Stroke' },
  { code: 'E78.5', label: 'Hyperlipidemia' },
  { code: 'M79.3', label: 'Panniculitis' },
  { code: 'Z79.4', label: 'Long-term insulin use' },
];

export default function HomeHealthTool() {
  const [patientName, setPatientName] = useState('');
  const [patientDOB, setPatientDOB] = useState('');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [secondaryDiagnoses, setSecondaryDiagnoses] = useState<string[]>([]);
  const [referralReason, setReferralReason] = useState('');
  const [functionalStatus, setFunctionalStatus] = useState('');

  const toggleDiagnosis = (code: string) => {
    setSecondaryDiagnoses(prev =>
      prev.includes(code) ? prev.filter(d => d !== code) : [...prev, code]
    );
  };

  const generateReferral = () => {
    alert('Referral generated!\n\nPatient: ' + patientName + '\nPrimary: ' + primaryDiagnosis);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Home Health VN Referral</h1>
          <p className="text-slate-600 mt-1">Complete referral form with diagnosis optimization</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Patient Information */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Patient Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={patientDOB}
                  onChange={e => setPatientDOB(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Diagnosis Selection */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Clinical Diagnosis</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Primary Diagnosis (ICD-10)</label>
              <select
                value={primaryDiagnosis}
                onChange={e => setPrimaryDiagnosis(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              >
                <option value="">Select primary diagnosis...</option>
                {COMMON_DIAGNOSES.map(d => (
                  <option key={d.code} value={d.code}>
                    {d.code} - {d.label}
                  </option>
                ))}
              </select>

              <label className="block text-sm font-medium text-slate-700 mb-3">Secondary Diagnoses</label>
              <div className="grid gap-2">
                {COMMON_DIAGNOSES.map(d => (
                  <label key={d.code} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={secondaryDiagnoses.includes(d.code)}
                      onChange={() => toggleDiagnosis(d.code)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="ml-2 text-sm text-slate-700">{d.code} - {d.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Referral Reason */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Referral Details</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason for Referral</label>
              <textarea
                value={referralReason}
                onChange={e => setReferralReason(e.target.value)}
                placeholder="e.g., Post-discharge care, medication management, wound care, etc."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </section>

          {/* Functional Status */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Functional Status</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Functional Abilities</label>
              <textarea
                value={functionalStatus}
                onChange={e => setFunctionalStatus(e.target.value)}
                placeholder="ADLs, mobility, self-care abilities..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </section>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              onClick={generateReferral}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              Generate Referral
            </button>
            <button
              onClick={() => {
                setPatientName('');
                setPatientDOB('');
                setPrimaryDiagnosis('');
                setSecondaryDiagnoses([]);
                setReferralReason('');
                setFunctionalStatus('');
              }}
              className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-md hover:bg-slate-50 font-medium"
            >
              Clear Form
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
