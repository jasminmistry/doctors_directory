import { AdminLayout } from '@/components/admin/AdminLayout'
import QAClient from '@/components/admin/QAClient'
import type { TestReport } from '@/components/admin/QAClient'
import { FileText } from 'lucide-react'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let testReport: TestReport | null = null

  try {
    const filePath = path.join(process.cwd(), 'test-reports', 'output.json')
    const fileContents = fs.readFileSync(filePath, 'utf-8')
    testReport = JSON.parse(fileContents) as TestReport
  } catch {
    // file missing or malformed — show empty state below
  }

  if (!testReport) {
    return (
      <AdminLayout title="QA Report">
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <FileText className="h-12 w-12 text-gray-300" />
          <p className="text-lg font-medium text-gray-600">No report data available</p>
          <p className="text-sm text-gray-500">
            Run the test suite to generate <code>test-reports/output.json</code>.
          </p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="QA Report">
      <QAClient report={testReport} />
    </AdminLayout>
  )
}
