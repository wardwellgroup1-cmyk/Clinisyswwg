'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

type Payor = 'UHC' | 'BCBS' | 'Aetna' | 'Cigna' | 'Humana' | 'Molina' | 'Centene' | 'CVS' | 'Kaiser' | 'Medicare' | 'Medicaid' | 'TRICARE' | 'Other';
type Severity = 'mild' | 'moderate' | 'severe' | 'refractory';
type FunctionalImpairment = 'none' | 'mild' | 'moderate' | 'severe';

const PAYORS: Payor[] = [
  'UHC', 'BCBS', 'Aetna', 'Cigna', 'Humana', 'Molina', 'Centene', 'CVS', 'Kaiser', 'Medicare', 'Medicaid', 'TRICARE', 'Other',
];

const PLAN_TYPES = [
  'Commercial / Employer', 'Medicare Part A', 'Medicare Part B', 'Medicare Advantage (Part C)', 'Medicare Part D',
  'Medicaid / CHIP', 'Marketplace / ACA', 'TRICARE / Military', 'Workers Compensation'
];

const MED_CLASSES = ['Biologic / Specialty', 'Brand (Non-Specialty)', 'Generic', 'Durable Medical Equipment', 'IV Infusion / Injectable', 'Imaging / Procedure', 'Surgical Procedure'];

const FAILURE_REASONS = [
  'Lack of Efficacy', 'Adverse Effects / Intolerance', 'Medical Contraindication', 'Drug Allergy', 'Both Inefficacy & Adverse Effects', 'Step Therapy Not Required'
];

const PAYOOR_REQUIREMENTS: Record<Payor, { requiresStepTherapy: boolean; avgProcessingDays: number; denialRate: number }> = {
  'UHC': { requiresStepTherapy: true, avgProcessingDays: 3, denialRate: 28 },
  'BCBS': { requiresStepTherapy: true, avgProcessingDays: 5, denialRate: 32 },
  'Aetna': { requiresStepTherapy: true, avgProcessingDays: 3, denialRate: 25 },
  'Cigna': { requiresStepTherapy: true, avgProcessingDays: 4, denialRate: 30 },
  'Humana': { requiresStepTherapy: false, avgProcessingDays: 2, denialRate: 20 },
  'Molina': { requiresStepTherapy: true, avgProcessingDays: 5, denialRate: 35 },
  'Centene': { requiresStepTherapy: true, avgProcessingDays: 4, denialRate: 33 },
  'CVS': { requiresStepTherapy: true, avgProcessingDays: 3, denialRate: 29 },
  'Kaiser': { requiresStepTherapy: false, avgProcessingDays: 1, denialRate: 18 },
  'Medicare': { requiresStepTherapy: false, avgProcessingDays: 7, denialRate: 22 },
  'Medicaid': { requiresStepTherapy: true, avgProcessingDays: 10, denialRate: 40 },
  'TRICARE': { requiresStepTherapy: false, avgProcessingDays: 14, denialRate: 15 },
  'Other': { requiresStepTherapy: true, avgProcessingDays: 5, denialRate: 30 },
};

interface FailedMedication {
  name: string;
  duration: string;
  reason: string;
}

export default function MedicationPA() {
  // Payer & Plan
  const [payor, setPayor] = useState<Payor | ''>('');
  const [planType, setPlanType] = useState('');
  const [policyId, setPolicyId] = useState('');
  const [dateOfService, setDateOfService] = useState('');

  // Medication & Therapy
  const [medication, setMedication] = useState('');
  const [medClass, setMedClass] = useState('');
  const [dose, setDose] = useState('');
  const [provider, setProvider] = useState('');
  const [npi, setNpi] = useState('');

  // Diagnosis
  const [diagnosis, setDiagnosis] = useState('');
  const [icd10Codes, setIcd10Codes] = useState<string[]>([]);
  const [icd10Input, setIcd10Input] = useState('');

  // Step Therapy
  const [failedMeds, setFailedMeds] = useState<FailedMedication[]>([]);
  const [tempMedName, setTempMedName] = useState('');
  const [tempMedDuration, setTempMedDuration] = useState('');
  const [tempMedReason, setTempMedReason] = useState('');

  // Clinical Evidence
  const [severity, setSeverity] = useState<Severity>('moderate');
  const [symptoms, setSymptoms] = useState('');
  const [functionalImpairment, setFunctionalImpairment] = useState<FunctionalImpairment>('moderate');
  const [labResults, setLabResults] = useState('');

  // Scoring
  const [approvalScore, setApprovalScore] = useState(0);
  const [generatedNote, setGeneratedNote] = useState('');

  const addFailedMed = () => {
    if (tempMedName && tempMedDuration && tempMedReason) {
      setFailedMeds([...failedMeds, { name: tempMedName, duration: tempMedDuration, reason: tempMedReason }]);
      setTempMedName('');
      setTempMedDuration('');
      setTempMedReason('');
    }
  };

  const removeFailedMed = (index: number) => {
    setFailedMeds(failedMeds.filter((_, i) => i !== index));
  };

  const addIcd10 = () => {
    if (icd10Input && !icd10Codes.includes(icd10Input)) {
      setIcd10Codes([...icd10Codes, icd10Input]);
      setIcd10Input('');
    }
  };

  const calculateScore = () => {
    let score = 0;

    if (payor) score += 15;
    if (planType) score += 5;
    if (medication && medClass) score += 15;
    if (diagnosis && icd10Codes.length > 0) score += 20;
    if (failedMeds.length >= 2) score += 20;
    else if (failedMeds.length === 1) score += 10;
    if (['severe', 'refractory'].includes(severity)) score += 10;
    if (['moderate', 'severe'].includes(functionalImpairment)) score += 10;
    if (labResults) score += 5;

    setApprovalScore(Math.min(100, score));

    if (medication && diagnosis && failedMeds.length > 0) {
      const note = `PRIOR AUTHORIZATION REQUEST – MEDICAL NECESSITY

PATIENT & INSURANCE INFORMATION
Insurance Payer: ${payor || 'TBD'}
Plan Type: ${planType || 'TBD'}
Policy ID: ${policyId || 'Not provided'}
Date of Service: ${dateOfService || 'TBD'}

MEDICATION & THERAPY DETAILS
Requested Medication/Device: ${medication}
Medication Class: ${medClass || 'TBD'}
Dose/Frequency: ${dose || 'TBD'}
Prescribing Provider: ${provider || 'TBD'}

CLINICAL DIAGNOSIS
Primary Diagnosis: ${diagnosis}
ICD-10 Codes: ${icd10Codes.join(', ') || 'None entered'}

STEP THERAPY / FAILED MEDICATIONS
Prior Medications Tried (${failedMeds.length}):
${failedMeds.map(m => `• ${m.name} (${m.duration}) - ${m.reason}`).join('\n') || 'None documented'}

CLINICAL SEVERITY & FUNCTIONAL IMPACT
Disease Severity: ${severity.toUpperCase()}
Active Symptoms: ${symptoms || 'Not documented'}
Functional Impairment: ${functionalImpairment.toUpperCase()}
Supporting Lab/Imaging: ${labResults || 'None provided'}

MEDICAL JUSTIFICATION
The requested medication/therapy is medically necessary for treatment of documented ${diagnosis}. Patient has demonstrated inadequate response to ${failedMeds.length} prior therapy option(s) and requires escalation to ${medication} per clinical guidelines.

APPROVAL RECOMMENDATION
PA Readiness Score: ${approvalScore}%
${approvalScore >= 70 ? '✓ STRONG - Ready for submission' : approvalScore >= 50 ? '⚠ MODERATE - Add more clinical detail' : '❌ WEAK - Strengthen documentation'}`;

      setGeneratedNote(note);
    }
  };

  useEffect(() => {
    calculateScore();
  }, [payor, planType, medication, medClass, diagnosis, icd10Codes, failedMeds, severity, functionalImpairment, labResults]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-green-600 hover:text-green-800 mb-4 inline-block">
            ← Back to Tools
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">PriorAuthPro</h1>
          <p className="text-slate-600 mt-1">Pre-Prior Authorization Clinical Planner | 🏥 Clinical Decision Support Tool</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Payer & Plan */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <h2 className="text-xl font-bold text-slate-900 mb-4">📋 PAYER & PLAN INFORMATION</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold mb-1">Insurance Payer</label>
                  <select
                    value={payor}
                    onChange={e => setPayor(e.target.value as Payor | '')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">— Select Payer —</option>
                    {PAYORS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Plan Type</label>
                  <select
                    value={planType}
                    onChange={e => setPlanType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">— Select Plan Type —</option>
                    {PLAN_TYPES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Policy / Member ID (optional)</label>
                  <input
                    type="text"
                    value={policyId}
                    onChange={e => setPolicyId(e.target.value)}
                    placeholder="Enter member ID"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Date of Service</label>
                  <input
                    type="date"
                    value={dateOfService}
                    onChange={e => setDateOfService(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Medication & Therapy */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <h2 className="text-xl font-bold text-slate-900 mb-4">💊 MEDICATION & THERAPY</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Requested Medication / Device</label>
                  <input
                    type="text"
                    value={medication}
                    onChange={e => setMedication(e.target.value)}
                    placeholder="e.g., Dupilumab, Ozempic, Mounjaro"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Medication Class / Type</label>
                  <select
                    value={medClass}
                    onChange={e => setMedClass(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">— Select Class —</option>
                    {MED_CLASSES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Requested Dose / Frequency</label>
                  <input
                    type="text"
                    value={dose}
                    onChange={e => setDose(e.target.value)}
                    placeholder="e.g., 300mg weekly"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Prescribing Provider</label>
                  <input
                    type="text"
                    value={provider}
                    onChange={e => setProvider(e.target.value)}
                    placeholder="Provider name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">NPI Number (optional)</label>
                  <input
                    type="text"
                    value={npi}
                    onChange={e => setNpi(e.target.value)}
                    placeholder="10-digit NPI"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Diagnosis */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <h2 className="text-xl font-bold text-slate-900 mb-4">🔬 DIAGNOSIS & CLINICAL</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Primary Diagnosis</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={e => setDiagnosis(e.target.value)}
                    placeholder="e.g., Type 2 Diabetes Mellitus, Moderate to Severe Atopic Dermatitis"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">ICD-10 Code(s) — Press Enter after each code</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={icd10Input}
                      onChange={e => setIcd10Input(e.target.value.toUpperCase())}
                      onKeyPress={e => e.key === 'Enter' && addIcd10()}
                      placeholder="e.g., E11.9"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <button
                      onClick={addIcd10}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-semibold text-sm"
                    >
                      Add
                    </button>
                  </div>
                  {icd10Codes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {icd10Codes.map(code => (
                        <span key={code} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          {code}
                          <button
                            onClick={() => setIcd10Codes(icd10Codes.filter(c => c !== code))}
                            className="text-purple-600 hover:text-purple-900 font-bold"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Step Therapy */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <h2 className="text-xl font-bold text-slate-900 mb-4">🔄 STEP THERAPY / FAILED MEDICATIONS</h2>
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    type="text"
                    value={tempMedName}
                    onChange={e => setTempMedName(e.target.value)}
                    placeholder="Medication name"
                    className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                  <input
                    type="text"
                    value={tempMedDuration}
                    onChange={e => setTempMedDuration(e.target.value)}
                    placeholder="Duration (e.g., 6 months)"
                    className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                  <select
                    value={tempMedReason}
                    onChange={e => setTempMedReason(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="">— Select Reason —</option>
                    {FAILURE_REASONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={addFailedMed}
                  className="w-full px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-semibold text-sm"
                >
                  Add Failed Medication
                </button>

                {failedMeds.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {failedMeds.map((med, idx) => (
                      <div key={idx} className="bg-orange-50 p-3 rounded-md border border-orange-200 flex justify-between items-start">
                        <div className="text-sm">
                          <strong>{med.name}</strong> • {med.duration} • {med.reason}
                        </div>
                        <button
                          onClick={() => removeFailedMed(idx)}
                          className="text-orange-600 hover:text-orange-900 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Symptom Severity */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <h2 className="text-xl font-bold text-slate-900 mb-4">📊 SYMPTOM SEVERITY & FUNCTIONAL IMPACT</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold mb-1">Disease Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as Severity)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="refractory">Severe / Refractory</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Functional Impairment</label>
                  <select
                    value={functionalImpairment}
                    onChange={e => setFunctionalImpairment(e.target.value as FunctionalImpairment)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="none">None documented</option>
                    <option value="mild">Mild — minor limitations</option>
                    <option value="moderate">Moderate — affects daily activities</option>
                    <option value="severe">Severe — disabling / work impaired</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Active Symptoms</label>
                  <input
                    type="text"
                    value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                    placeholder="e.g., pruritus, excoriation, sleep disturbance"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1">Recent Lab / Imaging Supporting Medical Necessity</label>
                  <input
                    type="text"
                    value={labResults}
                    onChange={e => setLabResults(e.target.value)}
                    placeholder="e.g., HbA1c 9.2%, BMI 35.2, CT scan showing..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Generated Note */}
            {generatedNote && (
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-slate-500">
                <h2 className="text-lg font-bold text-slate-900 mb-3">📝 Generated PA Note</h2>
                <pre className="bg-slate-100 p-4 rounded-md text-xs overflow-x-auto border border-slate-300 text-slate-800 whitespace-pre-wrap">
                  {generatedNote}
                </pre>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Approval Score */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">⚡ PA APPROVAL SCORE</h3>
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-green-600 mb-2">{approvalScore}</div>
                <div className="text-sm text-slate-600">out of 100 points</div>
                <div className="w-full bg-slate-200 rounded-full h-3 mt-4 mb-4">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      approvalScore >= 70 ? 'bg-green-600' : approvalScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${approvalScore}%` }}
                  />
                </div>
                <p className="text-sm font-semibold">
                  {approvalScore >= 70 ? '✓ STRONG - Ready for submission' : approvalScore >= 50 ? '⚠ MODERATE - Add more details' : '❌ STOP — Not Ready'}
                </p>
              </div>
            </div>

            {/* Readiness Checklist */}
            <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">✅ PA READINESS CHECKLIST</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className={payor ? '✓' : '○'} > Payer selected</li>
                <li className={planType ? '✓' : '○'} > Plan type selected</li>
                <li className={medication && medClass ? '✓' : '○'} > Medication & class entered</li>
                <li className={diagnosis && icd10Codes.length > 0 ? '✓' : '○'} > Diagnosis with ICD-10 codes</li>
                <li className={failedMeds.length >= 2 ? '✓' : '○'} > 2+ prior medications documented</li>
                <li className={['severe', 'refractory'].includes(severity) ? '✓' : '○'} > Severity documented</li>
                <li className={labResults ? '✓' : '○'} > Supporting labs/imaging</li>
              </ul>
            </div>

            {/* Payer Intelligence */}
            {payor && payor !== '' && (
              <div className="bg-amber-50 rounded-lg shadow-md p-6 border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-3">🧠 PAYER INTELLIGENCE</h3>
                <div className="text-sm text-amber-800 space-y-2">
                  {(() => {
                    const req = PAYOOR_REQUIREMENTS[payor as Payor];
                    return (
                      <>
                        <p><strong>Step Therapy Required:</strong> {req.requiresStepTherapy ? 'Yes' : 'No'}</p>
                        <p><strong>Avg Processing:</strong> {req.avgProcessingDays} days</p>
                        <p><strong>Historical Denial Rate:</strong> {req.denialRate}%</p>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
