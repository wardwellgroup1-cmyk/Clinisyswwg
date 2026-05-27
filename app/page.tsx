'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            CliniSys Prior Authorization Suite
          </h1>
          <p className="text-lg text-slate-600">
            Specialized prior authorization tools for healthcare providers
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Home Health */}
          <Link href="/home-health">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="text-4xl mb-4">🏥</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Home Health</h2>
              <p className="text-slate-600 mb-4">
                VN home health referral forms with patient details population and clinical documentation.
              </p>
              <ul className="text-sm text-slate-700 space-y-2 mb-6">
                <li>✓ Patient data integration</li>
                <li>✓ Diagnosis suggestions</li>
                <li>✓ Referral generation</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium">
                Launch Tool
              </button>
            </div>
          </Link>

          {/* Medication PA */}
          <Link href="/medication">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="text-4xl mb-4">💊</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Medication PA</h2>
              <p className="text-slate-600 mb-4">
                Specialized for common medications: Wegovy, Mounjaro, SGLT2i, GLP-1 agonists & more.
              </p>
              <ul className="text-sm text-slate-700 space-y-2 mb-6">
                <li>✓ Popular med database</li>
                <li>✓ ICD-10 optimization</li>
                <li>✓ Approval scoring</li>
              </ul>
              <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-medium">
                Launch Tool
              </button>
            </div>
          </Link>

          {/* Imaging PA */}
          <Link href="/imaging">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer h-full">
              <div className="text-4xl mb-4">🔬</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Imaging PA</h2>
              <p className="text-slate-600 mb-4">
                Complete imaging studies with CPT codes, indications, and clinical justification.
              </p>
              <ul className="text-sm text-slate-700 space-y-2 mb-6">
                <li>✓ CPT code selection</li>
                <li>✓ ICD-10 matching</li>
                <li>✓ Evidence library</li>
              </ul>
              <button className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 font-medium">
                Launch Tool
              </button>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
