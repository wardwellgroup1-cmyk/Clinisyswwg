'use client';

import Link from 'next/link';
import { useState } from 'react';

const COMMON_MEDICATIONS = [
  { name: 'Wegovy (semaglutide)', indication: 'Weight management', icd10: ['E66.9', 'E78.5'] },
  { name: 'Mounjaro (tirzepatide)', indication: 'Type 2 Diabetes/Weight loss', icd10: ['E11.9', 'E66.9'] },
  { name: 'Ozempic (semaglutide)', indication: 'Type 2 Diabetes', icd10: ['E11.9'] },
  { name: 'GLP-1 Agonists', indication: 'Diabetes/Cardiovascular', icd10: ['E11.9', 'I10'] },
  { name: 'SGLT2 Inhibitors', indication: 'Diabetes/Heart Failure', icd10: ['E11.9', 'I50.9'] },
  { name: 'Trzepatide (off-label)', indication: 'PCOS/Metabolic', icd10: ['E28.2', 'E66.9'] },
];

const ICD10_DIAGNOSES = [
  { code: 'E66.9', label: 'Obesity, unspecified' },
  { code: 'E11.9', label: 'Type 2 Diabetes' },
  { code: 'I10', label: 'Essential Hypertension' },
  { code: 'I50.9', label: 'Heart Failure, unspecified' },
  { code: 'E78.5', label: 'Hyperlipidemia, unspecified' },
  { code: 'E28.2', label: 'Polycystic ovarian syndrome' },
  { code: 'E65', label: 'Localized adiposity' },
];

export default function MedicationPA() {
  const [selectedMed, setSelectedMed] = useState('');
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [priorTrials, setPriorTrials] = useState('');
  const [clinicalJustification, setClinicalJustification] = useState('');
  const [approvalScore, setApprovalScore] = useState(0);

  const handleDiagnosisChange = (code: string) => {
    setSelectedDiagnoses(prev =>
      prev.includes(code) ? prev.filter(d => d !== code) : [...prev, code]
    );
    calculateScore();
  };

  const calculateScore = () => {
    let score = 0;
    if (selectedMed) score += 20;
    if (selectedDiagnoses.length > 0) score += 30;
    if (priorTrials) score += 25;
    if (clinicalJustification.length > 50) score += 25;
    setApprovalScore(Math.min(100, score));
  };

  const getMedICD10s = () => {
    const med = COMMON_MEDICATIONS.find(m => m.name === selectedMed);
    return med ? med.icd10 : [];
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-green-600 hover:text-green-800 mb-4 inline-block">
            ← Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Medication Prior Authorization</h1>
          <p className="text-slate-600 mt-1">Specialized for common GLP-1s, weight loss, & endocrine meds</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-8 space-y-6">
            {/* Medication Selection */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Select Medication</h2>
              <select
                value={selectedMed}
                onChange={e => {
                  setSelectedMed(e.target.value);
                  setSelectedDiagnoses([]);
                  calculateScore();
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose medication...</option>
                {COMMON_MEDICATIONS.map(med => (
                  <option key={med.name} value={med.name}>
                    {med.name} - {med.indication}
                  </option>
                ))}
              </select>
            </section>

            {/* ICD-10 Suggestions for Selected Medication */}
            {selectedMed && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Recommended ICD-10 Codes</h2>
                <p className="text-sm text-slate-600 mb-3">
                  For {selectedMed}, these diagnoses typically have stronger approval rates:
                </p>
                <div className="space-y-2">
                  {getMedICD10s().map(code => {
                    const diag = ICD10_DIAGNOSES.find(d => d.code === code);
                    return (
                      <label key={code} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
                        <input
                          type="checkbox"
                          checked={selectedDiagnoses.includes(code)}
                          onChange={() => handleDiagnosisChange(code)}
                          className="w-4 h-4 text-green-600 rounded"
                        />
                        <span className="ml-3 text-sm">
                          <strong>{code}</strong> - {diag?.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Prior Treatment Trials */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Prior Treatment Attempts</h2>
              <textarea
                value={priorTrials}
                onChange={e => {
                  setPriorTrials(e.target.value);
                  calculateScore();
                }}
                placeholder="e.g., Metformin 2000mg daily x 6 months - inadequate control; Lisinopril 20mg daily x 3 months - well-tolerated but insufficient..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </section>

            {/* Clinical Justification */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Clinical Justification</h2>
              <textarea
                value={clinicalJustification}
                onChange={e => {
                  setClinicalJustification(e.target.value);
                  calculateScore();
                }}
                placeholder="Patient has documented [diagnosis] with functional impairment despite [prior treatments]. [Medication] is indicated per [guideline/evidence]. Risk of non-approval includes [patient-specific consequences]..."
                rows={5}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </section>

            {/* Generate Button */}
            <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-medium">
              Generate PA Letter
            </button>
          </div>

          {/* Sidebar - Score & Tips */}
          <div className="space-y-4">
            {/* Approval Score */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Approval Likelihood</h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">{approvalScore}%</div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${approvalScore}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600">
                  {approvalScore >= 80
                    ? '✓ Strong approval likelihood'
                    : approvalScore >= 60
                    ? '⚠ Moderate - add more details'
                    : '✗ Weak - strengthen documentation'}
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">💡 Pro Tips</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Use recommended ICD-10 codes for higher approval</li>
                <li>• Document at least 2 prior medication trials</li>
                <li>• Emphasize functional impact</li>
                <li>• Include specific patient risk factors</li>
                <li>• Reference clinical guidelines</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
