'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const PAYORS = [
  'MVP', 'Fidelis', 'WellCare', 'Aetna', 'Cigna', 'Humana', 'NYSHIP', 'UHC', 'Medicare', 'Medicaid',
];

const PLAN_TYPES = ['Commercial', 'Medicaid', 'Medicare', 'Medicare Advantage', 'Medicare + Medicaid'];

const MEDICATIONS = [
  { name: 'Wegovy (semaglutide)', medClass: 'glp1', dose: '0.25-2.4 mg weekly' },
  { name: 'Mounjaro (tirzepatide)', medClass: 'glp1', dose: '2.5-15 mg weekly' },
  { name: 'Ozempic (semaglutide)', medClass: 'glp1', dose: '0.5-1 mg weekly' },
  { name: 'Saxenda (liraglutide)', medClass: 'glp1', dose: '1.2-3 mg daily' },
  { name: 'SGLT2 Inhibitors', medClass: 'sglt2', dose: 'Varies' },
  { name: 'Metformin', medClass: 'diabetes', dose: '500-2550 mg daily' },
  { name: 'Sertraline (SSRI)', medClass: 'depression', dose: '25-200 mg daily' },
  { name: 'Fluoxetine (SSRI)', medClass: 'depression', dose: '20-80 mg daily' },
  { name: 'Lisdexamfetamine (Vyvanse)', medClass: 'adhd', dose: '20-70 mg daily' },
  { name: 'Methylphenidate (Concerta)', medClass: 'adhd', dose: '18-72 mg daily' },
  { name: 'Budesonide/Salmeterol (Symbicort)', medClass: 'asthma', dose: '1-2 inhalations daily' },
  { name: 'Atorvastatin', medClass: 'cardio', dose: '10-80 mg daily' },
  { name: 'Rosuvastatin', medClass: 'cardio', dose: '5-40 mg daily' },
  { name: 'Gabapentin', medClass: 'pain', dose: '300-3600 mg daily' },
  { name: 'Pregabalin (Lyrica)', medClass: 'pain', dose: '150-600 mg daily' },
];

const ICD10_BY_CLASS = {
  glp1: [
    { code: 'E11.65', label: 'Type 2 diabetes with hyperglycemia' },
    { code: 'E66.01', label: 'Morbid obesity due to excess calories' },
    { code: 'E66.09', label: 'Other obesity, drug-induced' },
    { code: 'Z68.39', label: 'BMI 30-39.9 (specify weight status)' },
  ],
  sglt2: [
    { code: 'E11.9', label: 'Type 2 diabetes' },
    { code: 'I50.9', label: 'Heart failure, unspecified' },
    { code: 'Z9.4', label: 'Kidney transplant status' },
  ],
  diabetes: [
    { code: 'E11.9', label: 'Type 2 diabetes' },
    { code: 'E11.65', label: 'Type 2 diabetes with hyperglycemia' },
  ],
  depression: [
    { code: 'F33.1', label: 'Major depressive disorder, recurrent, moderate' },
    { code: 'F41.1', label: 'Generalized anxiety disorder' },
    { code: 'F43.23', label: 'Adjustment disorder with mixed emotions' },
  ],
  adhd: [
    { code: 'F90.2', label: 'ADHD, combined type' },
    { code: 'F41.1', label: 'Generalized anxiety disorder' },
    { code: 'Z55.9', label: 'School/work impairment' },
  ],
  asthma: [
    { code: 'J45.40', label: 'Moderate persistent asthma' },
    { code: 'J45.50', label: 'Severe persistent asthma' },
  ],
  cardio: [
    { code: 'I10', label: 'Essential hypertension' },
    { code: 'E78.5', label: 'Hyperlipidemia' },
    { code: 'I25.10', label: 'Atherosclerotic heart disease' },
  ],
  pain: [
    { code: 'M54.50', label: 'Low back pain, unspecified' },
    { code: 'G62.9', label: 'Polyneuropathy, unspecified' },
    { code: 'M79.7', label: 'Fibromyalgia' },
  ],
};

const PAYOOR_HISTORICAL = {
  'MVP': { glp1: 55, diabetes: 75, depression: 80, adhd: 60 },
  'Fidelis': { glp1: 50, diabetes: 70, depression: 65, adhd: 40 },
  'WellCare': { glp1: 60, diabetes: 75, depression: 75, adhd: 55 },
  'UHC': { glp1: 70, diabetes: 80, depression: 85, adhd: 65 },
  'Medicare': { glp1: 45, diabetes: 75, depression: 80, adhd: 70 },
  'Medicaid': { glp1: 40, diabetes: 60, depression: 70, adhd: 50 },
};

export default function MedicationPA() {
  const [payor, setPayor] = useState('');
  const [planType, setPlanType] = useState('');
  const [selectedMed, setSelectedMed] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [failedTherapies, setFailedTherapies] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [selectedIcds, setSelectedIcds] = useState<string[]>([]);
  const [approvalScore, setApprovalScore] = useState(0);
  const [scoreDetails, setScoreDetails] = useState({ C: 0, D: 0, H: 0 });
  const [generatedNote, setGeneratedNote] = useState('');

  const getMedClass = (): string => {
    const med = MEDICATIONS.find(m => m.name === selectedMed);
    return med?.medClass || 'generic';
  };

  const getRecommendedIcds = () => {
    const medClass = getMedClass();
    return (ICD10_BY_CLASS as any)[medClass] || [];
  };

  const calculateScore = () => {
    const medClass = getMedClass();

    // Criteria match (40%)
    let C = 80;
    if (!payor) C -= 20;
    if (medClass === 'glp1' || medClass === 'adhd') C -= 10;
    if (C < 10) C = 10;
    if (C > 100) C = 100;

    // Documentation (35%)
    let D = 100;
    if (!diagnosis) D -= 40;
    if (!failedTherapies) D -= 30;
    if (!symptoms) D -= 20;
    if (D < 10) D = 10;

    // Historical (25%)
    const payorKey = payor as keyof typeof PAYOOR_HISTORICAL;
const H = payor && (PAYOOR_HISTORICAL[payorKey]?.[medClass as keyof typeof PAYOOR_HISTORICAL] ?? 60) || 60;
    const weighted = Math.round((C * 0.4) + (D * 0.35) + (H * 0.25));

    setScoreDetails({ C, D, H });
    setApprovalScore(weighted);

    // Generate note
    if (selectedMed && diagnosis) {
      const note = `MEDICATION PRIOR AUTHORIZATION – MEDICAL NECESSITY

Payor: ${payor || 'TBD'} | Plan: ${planType || 'TBD'}
Medication: ${selectedMed}
Primary Diagnosis: ${diagnosis}

CLINICAL SUMMARY
Patient has documented ${diagnosis} with symptoms of ${symptoms || '[provide symptoms]'}. Prior therapies attempted: ${failedTherapies || '[list failed treatments]'}.

MEDICAL JUSTIFICATION
The requested medication is medically necessary per clinical guidelines for this condition. Patient has demonstrated inadequate response to standard therapies and is at clinical risk without escalation.

APPROVAL LIKELIHOOD: ${weighted}%
${weighted >= 50 ? '✓ PROCEED to submission' : '⚠ NEEDS CLARIFICATION – add more documentation'}`;
      setGeneratedNote(note);
    }
  };

  useEffect(() => {
    calculateScore();
  }, [payor, selectedMed, diagnosis, failedTherapies, symptoms]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-green-600 hover:text-green-800 mb-4 inline-block">
            ← Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Medication Prior Authorization</h1>
          <p className="text-slate-600 mt-1">Pre-PA planner with payor intelligence & approval scoring</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Main Form */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-8 space-y-6">
            {/* Payor & Plan */}
            <div className="grid gap-4 md:grid-cols-2">
              <section>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Payor</label>
                <select
                  value={payor}
                  onChange={e => setPayor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select payor...</option>
                  {PAYORS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </section>
              <section>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Plan Type</label>
                <select
                  value={planType}
                  onChange={e => setPlanType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select plan type...</option>
                  {PLAN_TYPES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </section>
            </div>

            {/* Medication */}
            <section>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Medication</label>
              <select
                value={selectedMed}
                onChange={e => setSelectedMed(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Choose medication...</option>
                {MEDICATIONS.map(med => (
                  <option key={med.name} value={med.name}>
                    {med.name} – {med.dose}
                  </option>
                ))}
              </select>
            </section>

            {/* Primary Diagnosis */}
            <section>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Primary Diagnosis</label>
              <input
                type="text"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                placeholder="e.g., Type 2 diabetes with obesity, uncontrolled A1c"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </section>

            {/* Failed Therapies */}
            <section>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Failed Therapies</label>
              <input
                type="text"
                value={failedTherapies}
                onChange={e => setFailedTherapies(e.target.value)}
                placeholder="e.g., Metformin 2000mg x 6mo, Lisinopril 20mg x 3mo"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </section>

            {/* Symptoms */}
            <section>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Symptoms / Severity</label>
              <textarea
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="e.g., Uncontrolled blood glucose, weight gain, fatigue, functional impairment"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
            </section>

            {/* Recommended ICD-10 */}
            {selectedMed && (
              <section>
                <label className="block text-sm font-semibold text-slate-900 mb-3">Suggested ICD-10 Codes</label>
                <div className="space-y-2">
                  {getRecommendedIcds().map(icd => (
                    <label key={icd.code} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md cursor-pointer hover:bg-green-100">
                      <input
                        type="checkbox"
                        checked={selectedIcds.includes(icd.code)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedIcds([...selectedIcds, icd.code]);
                          } else {
                            setSelectedIcds(selectedIcds.filter(c => c !== icd.code));
                          }
                        }}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="ml-3 text-sm">
                        <strong>{icd.code}</strong> – {icd.label}
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {/* Generated Note */}
            {generatedNote && (
              <section>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Generated PA Note</label>
                <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-x-auto border border-slate-300 text-slate-800">
                  {generatedNote}
                </pre>
              </section>
            )}

            {/* Generate Button */}
            <button className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-semibold transition">
              Export PA Letter
            </button>
          </div>

          {/* Sidebar - Scoring */}
          <div className="space-y-4">
            {/* Approval Score */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Approval Score</h3>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-green-600 mb-2">{approvalScore}%</div>
                <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      approvalScore >= 50 ? 'bg-green-600' : 'bg-red-500'
                    }`}
                    style={{ width: `${approvalScore}%` }}
                  />
                </div>
                <p className="text-sm font-semibold">
                  {approvalScore >= 50 ? '✓ PROCEED' : '⚠ NEEDS CLARIFICATION'}
                </p>
              </div>

              {/* Score Breakdown */}
              <div className="text-sm space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span>Criteria Match (40%)</span>
                  <span className="font-semibold">{scoreDetails.C}</span>
                </div>
                <div className="flex justify-between">
                  <span>Documentation (35%)</span>
                  <span className="font-semibold">{scoreDetails.D}</span>
                </div>
                <div className="flex justify-between">
                  <span>Historical {payor ? `(${payor})` : '(Default)'} (25%)</span>
                  <span className="font-semibold">{scoreDetails.H}</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">💡 Approval Tips</h3>
              <ul className="text-xs text-blue-800 space-y-2">
                <li>✓ Always specify payor for accurate scoring</li>
                <li>✓ Document 2+ failed prior therapies</li>
                <li>✓ Use suggested ICD-10 codes (RAF-friendly)</li>
                <li>✓ Describe functional impact clearly</li>
                <li>✓ Reference clinical guidelines in note</li>
              </ul>
            </div>

            {/* Quick Status */}
            {approvalScore > 0 && (
              <div className={`rounded-lg p-4 text-sm text-center font-semibold ${
                approvalScore >= 60 ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              }`}>
                {approvalScore >= 80 && '🎯 Strong likelihood – submit now'}
                {approvalScore >= 60 && approvalScore < 80 && '⚠️ Moderate – add more clinical detail'}
                {approvalScore < 60 && '❌ Weak – strengthen all sections'}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
