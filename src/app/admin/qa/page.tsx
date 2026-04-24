import { AdminLayout } from '@/components/admin/AdminLayout'
import QAClient from '@/components/admin/QAClient'
import type { TestReport } from '@/components/admin/QAClient'
import fs from 'fs'
import path from 'path'

export default async function Page() {
  const filePath = path.join(process.cwd(), 'test-reports', 'output.json')
  const fileContents = fs.readFileSync(filePath, 'utf-8')
  const testReport: TestReport = JSON.parse(fileContents)

  return (
    <AdminLayout title="QA Report">
      <QAClient report={testReport} />
    </AdminLayout>
  )
}
