'use client'

import { AdminLayout } from '@/components/admin/AdminLayout'
import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-6">
        <nav className="flex gap-4 border-b border-gray-200 pb-4">
          <Link
            href="/admin/clinics"
            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Clinics
          </Link>
          <Link
            href="/admin/practitioners"
            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Practitioners
          </Link>
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Products
          </Link>
          <Link
            href="/admin/treatments"
            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Treatments
          </Link>
          <Link
            href="/admin/qa"
            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            QA Test Report
          </Link>
          <Link
            href="/admin/tracking"
            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Tracking
          </Link>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Clinics</h3>
            <Link href="/admin/clinics" className="text-2xl font-bold block">
              {/* Fetch count from API */}
              -
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Practitioners</h3>
            <Link href="/admin/practitioners" className="text-2xl font-bold block">
              -
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Products</h3>
            <Link href="/admin/products" className="text-2xl font-bold block">
              -
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Treatments</h3>
            <Link href="/admin/treatments" className="text-2xl font-bold block">
              -
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
