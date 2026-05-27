'use client';

import Link from 'next/link';
import { useState } from 'react';

const IMAGING_STUDIES = [
  {
    name: 'MRI Brain',
    cpt: '70553',
    description: 'Brain MRI with and without contrast',
    commonIndications: ['R51.9', 'G89.29', 'G40.909'],
  },
  {
    name: 'MRI Lumbar Spine',
    cpt: '72148',
    description: 'MRI lumbar spine with contrast',
    commonIndications: ['M54.5', 'M54.6', 'M99.03'],
  },
  {
    name: 'MRI Knee',
    cpt: '73610',
    description: 'MRI knee, unilateral',
    commonIndications: ['M17.11', 'M23.201', 'S83.201'],
  },
  {
    name: 'CT Chest',
    cpt: '71260',
    description: 'CT chest with contrast',
    commonIndications: ['R06.02', 'J43.9', 'R05.9'],
  },
  {
    name: 'CT Abdomen/Pelvis',
    cpt: '74177',
    description: 'CT abdomen and pelvis with contrast',
    commonIndications: ['R10.9', 'K21.9', 'N39.0'],
  },
  {
    name: 'Ultrasound Abdomen',
    cpt: '76700',
    description: 'Abdominal ultrasound, complete',
    commonIndications: ['K80.20', 'R10.9', 'R19.7'],
  },
];

const ICD10_FOR_IMAGING = [
  { code: 'R51.9', label: 'Headache, unspecified' },
  { code: 'M54.5', label: 'Low back pain' },
  { code: 'M17.11', label: 'Primary osteoarthritis, right knee' },
  { code: 'R06.02', label: 'Shortness of breath' },
  { code: 'R10.9', label: 'Unspecified abdominal pain' },
  { code: 'G40.909', label: 'Unspecified epilepsy' },
  { code: 'J43.9', label: 'Emphysema' },
  { code: 'K80.20', label: 'Calculus of gallbladder without cholecystitis' },
];

export default function ImagingPA() {
  const [selectedStudy, setSelectedStudy] = useState('');
  const [selectedIndications, setSelectedIndications] = useState<string[]>([]);
  const [clinicalRationale, setClinicalRationale] = useState('');
  const [priorImagingDetails, setPriorImagingDetails] = useState('');

  const study = IMAGING_STUDIES.find(s => s.name === selectedStudy);

  const toggleIndication = (code: string) => {
    setSelectedIndications(prev =>
      prev.includes(code) ? prev.filter(i => i !== code) : [...prev, code]
    );
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-purple-600 hover:text-purple-800 mb-4 inline-block">
            ← Back to Tools
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Imaging Prior Authorization</h1>
          <p className="text-slate-600 mt-1">Select imaging study with CPT codes and ICD-10 optimization</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-8 space-y-6">
            {/* Imaging Study Selection */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Select Imaging Study</h2>
              <div className="space-y-2">
                {IMAGING_STUDIES.map(img => (
                  <label
                    key={img.name}
                    className={`block p-3 border rounded-md cursor-pointer transition ${
                      selectedStudy === img.name
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-300 hover:border-purple-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="study"
                      value={img.name}
                      checked={selectedStudy === img.name}
                      onChange={e => {
                        setSelectedStudy(e.target.value);
                        setSelectedIndications([]);
                      }}
                      className="w-4 h-4 text-purple-600"
                    />
                    <div className="ml-2 inline-block">
                      <div className="font-medium text-slate-900">{img.name}</div>
                      <div className="text-xs text-slate-600">CPT: {img.cpt} - {img.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* ICD-10 Indications */}
            {selectedStudy && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Clinical Indications (ICD-10)</h2>
                <p className="text-sm text-slate-600 mb-3">
                  Common indications for {selectedStudy}:
                </p>
                <div className="space-y-2">
                  {study?.commonIndications.map(code => {
                    const indication = ICD10_FOR_IMAGING.find(i => i.code === code);
                    return (
                      <label key={code} className="flex items-center p-3 bg-purple-50 border border-purple-200 rounded-md">
                        <input
                          type="checkbox"
                          checked={selectedIndications.includes(code)}
                          onChange={() => toggleIndication(code)}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="ml-3 text-sm">
                          <strong>{code}</strong> - {indication?.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Clinical Rationale */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Clinical Rationale</h2>
              <textarea
                value={clinicalRationale}
                onChange={e => setClinicalRationale(e.target.value)}
                placeholder={`This ${selectedStudy || 'imaging study'} is medically necessary to evaluate the patient's documented condition and guide clinical management. The study will provide essential diagnostic information needed for treatment planning and risk assessment...`}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </section>

            {/* Prior Imaging */}
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Prior Imaging (if any)</h2>
              <textarea
                value={priorImagingDetails}
                onChange={e => setPriorImagingDetails(e.target.value)}
                placeholder="e.g., CT chest 3 months ago showed... OR No prior imaging"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
            </section>

            {/* Generate Button */}
            <button className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 font-medium">
              Generate PA Letter
            </button>
          </div>

          {/* Sidebar - Study Details */}
          <div className="space-y-4">
            {/* Study Summary */}
            {selectedStudy && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Study Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-slate-600">Study Name</div>
                    <div className="font-medium text-slate-900">{study?.name}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">CPT Code</div>
                    <div className="font-mono font-medium text-slate-900">{study?.cpt}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Description</div>
                    <div className="text-slate-700">{study?.description}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Indications Selected</div>
                    <div className="font-medium text-purple-600">
                      {selectedIndications.length} / {study?.commonIndications.length}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="font-semibold text-purple-900 mb-3">💡 Documentation Tips</h3>
              <ul className="text-sm text-purple-800 space-y-2">
                <li>• Include specific ICD-10 codes for diagnosis</li>
                <li>• Reference clinical guidelines supporting the study</li>
                <li>• Explain why this imaging is necessary</li>
                <li>• Mention impact on clinical decision-making</li>
                <li>• Document medical necessity clearly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
