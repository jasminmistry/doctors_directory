"use client"
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { CheckCircle, XCircle, Clock, FileText, AlertTriangle, Droplet } from 'lucide-react'


const testDetails = {
  "ClinicPage rendering": {
    "About Section": {
      description: "Validates presence, minimum length, and content integrity of About section.",
      checks: [
        "Section exists in DOM",
        "Text length > 50 characters",
        "Does not contain 'not listed'",
        "Does not contain 'not public'",
        "Does not contain corrupted characters (mojibake)"
      ]
    },
    "Accreditations": {
      description: "Validates accreditation section structure and content integrity.",
      checks: [
        "Section exists in DOM",
        "Contains <li> items",
        "List is not empty",
        "No item contains 'not listed'",
        "No item contains 'not public'",
        "No corrupted characters (mojibake)"
      ]
    },
    "Insurance": {
      description: "Validates insurance section structure and content integrity.",
      checks: [
        "Section exists in DOM",
        "Contains insurance entries",
        "Entries are not empty",
        "No corrupted characters (mojibake)"
      ]
    },
    "Fees": {
      description: "Validates fees table structure and content integrity.",
      checks: [
        "Fees table exists",
        "Contains <tr> rows",
        "Rows are not empty",
        "Table cells do not contain corrupted characters (mojibake)"
      ]
    },
    "Hours": {
      description: "Validates hours table structure and content integrity.",
      checks: [
        "Hours table exists",
        "Contains <tr> rows",
        "Rows are not empty",
        "No corrupted characters (mojibake)"
      ]
    },
    "Payments": {
      description: "Validates payments section structure and content integrity.",
      checks: [
        "Section exists in DOM",
        "Contains payment entries",
        "Entries are not empty",
        "No corrupted characters (mojibake)"
      ]
    }
  },
  "AccreditedClinicsPage rendering": {
    "Page Rendering": {
      description: "Validates that accredited clinics pages render successfully for different accreditation types and cities.",
      checks: [
        "Page renders without errors",
        "Practitioner cards are present in DOM",
        "At least one practitioner card is found"
      ]
    }
  },
  "AccreditedPractitionersPage rendering": {
    "Page Rendering": {
      description: "Validates that accredited practitioners pages render successfully for different accreditation types and cities.",
      checks: [
        "Page renders without errors",
        "Practitioner cards are present in DOM",
        "At least one practitioner card is found"
      ]
    }
  },
  "PractitionerCredentialsPage rendering": {
    "Page Rendering": {
      description: "Validates that practitioners filtered by credentials/qualifications render successfully.",
      checks: [
        "Page renders without errors",
        "Practitioner cards are present in DOM",
        "At least one practitioner card is found"
      ]
    }
  },
  "PractitionersByCityPage rendering": {
    "Page Rendering": {
      description: "Validates that practitioners list pages by city render successfully.",
      checks: [
        "Page renders without errors",
        "Practitioner cards are present in DOM",
        "At least one practitioner card is found"
      ]
    }
  },
  "CityClinicsPage rendering": {
    "Page Rendering": {
      description: "Validates that clinics list pages by city render successfully.",
      checks: [
      "Page renders without runtime errors",
      "At least one practitioner card is present in the DOM",
      "Population overview bullet list exists and is non-empty",
      "Lifestyle characteristics bullet list exists and is non-empty",
      "Medical infrastructure bullet list exists and is non-empty",
      "Market maturity level bullet list exists and is non-empty",
      "Primary regulator bullet list exists and is non-empty",
      "Prescribing requirements bullet list exists and is non-empty",
      "Inspection framework bullet list exists and is non-empty",
      "Insurance coverage bullet list exists and is non-empty",
      "Cosmetic finance availability bullet list exists and is non-empty",
      "Referral networks and teaching hospital links bullet list exists and is non-empty",
      "Public transport proximity bullet list exists and is non-empty",
      "Parking availability bullet list exists and is non-empty",
      "City centre vs suburban distribution bullet list exists and is non-empty",
      "Tourism volume indicator bullet list exists and is non-empty",
      "Hotel density near clinics bullet list exists and is non-empty",
      "Airport proximity bullet list exists and is non-empty",
      "Medical tourism viability bullet list exists and is non-empty",
      "Number of clinics metric is present",
      "Total reviews metric is present",
      "Average rating metric is present",
      "Treatments list contains at least one treatment link",
      "Peak booking periods list exists and is non-empty",
      "Social media trends list exists and is non-empty"
    ]
    }
  },
  "TreatmentsPage rendering": {
    "Page Rendering": {
      description: "Validates that treatment detail pages render successfully.",
      checks: [
        "Page renders without errors",
        "Practitioner cards are present in DOM",
        "At least one practitioner card is found"
      ]
    }
  },
  "PractitionerPage rendering": {
    "Roles": {
      description: "Validates roles section structure and content integrity.",
      checks: [
        "Section exists in DOM",
        "Contains <li> items",
        "No item contains 'not listed' or 'not public'",
        "No corrupted characters (mojibake)"
      ]
    },
    "Qualifications": {
      description: "Validates qualifications section structure and content integrity.",
      checks: [
        "Section exists in DOM",
        "Contains <li> items",
        "No item contains 'not listed' or 'not public'",
        "No corrupted characters (mojibake)"
      ]
    },
    "Experience": {
      description: "Validates experience section structure and content integrity.",
      checks: [
        "Section exists in DOM",
        "Contains <li> items",
        "No item contains 'not listed' or 'not public'",
        "No corrupted characters (mojibake)"
      ]
    },
    "Insurance": {
      description: "Validates insurance section structure and content integrity.",
      checks: [
        "Section exists in DOM",
        "Contains <li> items",
        "Entries are not empty",
        "No corrupted characters (mojibake)"
      ]
    },
    "Fees": {
      description: "Validates fees table structure and content integrity.",
      checks: [
        "Fees table exists",
        "Contains <tr> rows",
        "Table cells do not contain corrupted characters (mojibake)"
      ]
    },
    "Hours": {
      description: "Validates hours table structure and content integrity.",
      checks: [
        "Hours table exists",
        "Contains <tr> rows",
        "Table cells do not contain corrupted characters (mojibake)"
      ]
    },
    "Payments": {
      description: "Validates payments section structure and content integrity.",
      checks: [
        "Section exists in DOM",
        "Contains <li> items",
        "Entries are not empty",
        "No corrupted characters (mojibake)"
      ]
    }
  }
};

export interface AssertionResult {
  ancestorTitles: string[]
  duration: number
  failing: boolean
  failureDetails: unknown[]
  failureMessages: string[]
  fullName: string
  invocations: number
  location: { column: number; line: number } | null
  numPassingAsserts: number
  retryReasons: string[]
  startAt: number
  status: 'passed' | 'failed' | 'pending' | 'skipped' | 'todo'
  title: string
}

export interface TestSuiteResult {
  assertionResults: AssertionResult[]
  endTime: number
  message: string
  name: string
  startTime: number
  status: 'passed' | 'failed' | 'pending' | 'skipped'
  summary: string
}

export interface TestReport {
  numFailedTestSuites: number
  numFailedTests: number
  numPassedTestSuites: number
  numPassedTests: number
  numPendingTestSuites: number
  numPendingTests: number
  numRuntimeErrorTestSuites: number
  numTodoTests: number
  numTotalTestSuites: number
  numTotalTests: number
  openHandles: unknown[]
  snapshot: {
    added: number
    didUpdate: boolean
    failure: boolean
    filesAdded: number
    filesRemoved: number
    filesRemovedList: string[]
    filesUnmatched: number
    filesUpdated: number
    matched: number
    total: number
    unchecked: number
    uncheckedKeysByFile: string[]
    unmatched: number
    updated: number
  }
  startTime: number
  success: boolean
  testResults: TestSuiteResult[]
  wasInterrupted: boolean
}


function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = (ms / 1000).toFixed(2)
  return `${seconds}s`
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function stripAnsiCodes(str: string): string {
  return str.replace(/\u001b\[[0-9;]*m/g, '')
}

function extractFileName(path: string): string {
  return path.split(/[/\\]/).pop() || path
}

export default function QATestReport({report}: {report: TestReport}) {
  const failedTests = report.testResults.flatMap(suite =>
    suite.assertionResults.filter(test => test.status === 'failed')
  )
  const failedTestMessages = new Set();
  report.testResults.forEach((suite) => {
  const failedTests = suite.assertionResults.filter(
    (test) => test.status === 'failed'
  );

  failedTests.forEach((test) => {
    console.log(test.failureMessages.length)
    const cleanedMessage = test.failureMessages
    
      .join('\n')
      .split('at ')[0]; // remove stack trace
    console.log(cleanedMessage)
    try {
    cleanedMessage.split("failed:")[1].split("-").forEach((part) => {
      failedTestMessages.add(part.trim());
    });} catch (e) {
      failedTestMessages.add(cleanedMessage)}
  });
  
});
console.log(failedTestMessages)

  return (
    <AdminLayout title="QA Test Report">
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="specs">Specs</TabsTrigger>
            <TabsTrigger value="failed">
              Failed Tests
              {report.numFailedTests > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {report.numFailedTests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">All Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500">Total Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{report.numTotalTests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500">Passed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="text-3xl font-bold text-green-600">{report.numPassedTests}</div>
                  </div>
                  <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                    {((report.numPassedTests / report.numTotalTests) * 100).toFixed(1)}% pass rate
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500">Failed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div className="text-3xl font-bold text-red-600">{report.numFailedTests}</div>
                  </div>
                  <Badge variant="destructive" className="mt-2">
                    {((report.numFailedTests / report.numTotalTests) * 100).toFixed(1)}% failure rate
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500">Test Suites</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{report.numTotalTestSuites}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {report.numPassedTestSuites} passed, {report.numFailedTestSuites} failed
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500">Test Run Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div className="text-3xl font-bold">
                      {formatDuration(report.testResults.reduce((acc, suite) => acc + (suite.endTime - suite.startTime), 0))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatTimestamp(report.startTime)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-500">Overall Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {report.success ? (
                    <Badge variant="default" className="text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Passed
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-sm">
                      <XCircle className="w-4 h-4 mr-1" />
                      Failed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="flex flex-col space-y-4 p-4">
              <CardHeader>
                <header className="space-y-4">
                      <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
                        The Workflow 
                      </h1>
                      <p className="text-lg text-slate-600 leading-relaxed">
                        This page explains how we test pages, what a failed test actually means,
                        and how this fits into our broader quality workflow. It is written for both technical
                        and non-technical team members. For illustration purposes, we will use clinic data as an example, 
                        but the same principles apply to all types of pages and data we manage.
                      </p>
                    </header>
              </CardHeader>
              <CardContent>
                <div className="min-h-screen bg-slate-50 py-12 px-6">
                  <div className="max-w-5xl mx-auto space-y-12">

                    


                    <section className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
                      <h2 className="text-2xl font-semibold text-slate-800">
                        1. One Test = One Page Render
                      </h2>
              

                      <ul className="list-disc pl-6 space-y-2 text-slate-700">
                        <li>We loop through every clinic in our dataset.</li>
                        <li>For each clinic, we render its page.</li>
                        <li>Each clinic page becomes its own independent test case.</li>
                      </ul>

                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                        <p className="text-black font-medium">
                          If we have 500 clinics, we automatically run 500 page render tests.
                        </p>
                      </div>

                      <p className="text-slate-700 leading-relaxed">
                        The goal at this stage is simple:
                      </p>

                      <p className="font-semibold text-slate-800">
                        Does the page render without crashing?
                      </p>
                    </section>


                    <section className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
                      <h2 className="text-2xl font-semibold text-slate-800">
                        2. A Failed Test Does Not Always Mean the Page Is Broken
                      </h2>

                      <p className="text-slate-700 leading-relaxed">
                        This is critical for everyone to understand.
                      </p>

                      <p className="text-slate-700 leading-relaxed">
                        A test can fail for multiple reasons:
                      </p>

                      <ul className="list-disc pl-6 space-y-2 text-slate-700">
                        <li>The page didn’t render at all.</li>
                        <li>The “About” section is too short.</li>
                        <li>The Insurance section has no entries.</li>
                        <li>The Fees table is empty.</li>
                        <li>The Hours section is missing rows.</li>
                        <li>The Payments list has no items.</li>
                        <li>There are encoding issues (“mojibake”).</li>
                      </ul>

                      <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                        <p className="text-amber-900 font-medium">
                          A failure message tells us which section failed.
                        </p>
                      </div>

                    
                    </section>


                    <section className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
                      <h2 className="text-2xl font-semibold text-slate-800">
                        3. The Testing Mindset & Workflow
                      </h2>

                      <div className="space-y-6">

                        <div>
                          <h3 className="text-xl font-semibold text-slate-800">
                            Step A – Manual Exploration
                          </h3>
                          <ul className="list-disc pl-6 space-y-2 text-slate-700 mt-2">
                            <li>Team members manually browse clinic pages.</li>
                            <li>They identify patterns of bugs (missing sections, broken tables, short descriptions).</li>
                            <li>They document repeatable issues.</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-slate-800">
                            Step B – Convert Bugs into Automated Tests
                          </h3>
                          <ul className="list-disc pl-6 space-y-2 text-slate-700 mt-2">
                            <li>If one page has a broken accreditation section, others may too.</li>
                            <li>We write a test that checks accreditation lists across all clinics.</li>
                            <li>The test detects the issue everywhere instantly.</li>
                          </ul>
                        </div>

                        <div>
                          <h3 className="text-xl font-semibold text-slate-800">
                            Step C – Use Tests to Verify Fixes
                          </h3>
                          <ul className="list-disc pl-6 space-y-2 text-slate-700 mt-2">
                            <li>Developers fix the issue.</li>
                            <li>Tests are re-run across all clinics.</li>
                            <li>If tests pass, we know the issue is resolved at scale.</li>
                          </ul>
                        </div>

                      </div>

                      <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded">
                        <p className="text-emerald-900 font-medium">
                          This approach ensures that the implemented change doesn't just fix one page, it fixes all of them without breaking other pages...
                        </p>
                      </div>
                    </section>


                    <section className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
                      <h2 className="text-2xl font-semibold text-slate-800">
                        4. Expanding the Horizon
                      </h2>

                      <p className="text-slate-700 leading-relaxed">
                        This approach scales beyond basic rendering tests.
                      </p>

                      <div className="grid md:grid-cols-2 gap-6">

                        <div className="bg-slate-100 rounded-xl p-6">
                          <h3 className="font-semibold text-slate-800 mb-3">Data Quality Testing</h3>
                          <ul className="list-disc pl-6 space-y-1 text-slate-700">
                            <li>Minimum content length checks</li>
                            <li>Structured data validation</li>
                            <li>Broken character detection</li>
                          </ul>
                        </div>

                        <div className="bg-slate-100 rounded-xl p-6">
                          <h3 className="font-semibold text-slate-800 mb-3">UX & Structural Testing</h3>
                          <ul className="list-disc pl-6 space-y-1 text-slate-700">
                            <li>Required section presence</li>
                            <li>Table row validation</li>
                            <li>List population checks</li>
                          </ul>
                        </div>

                        <div className="bg-slate-100 rounded-xl p-6">
                          <h3 className="font-semibold text-slate-800 mb-3">Regression Prevention</h3>
                          <ul className="list-disc pl-6 space-y-1 text-slate-700">
                            <li>Ensure future updates don’t break existing pages</li>
                            <li>Detect data pipeline issues early</li>
                            <li>Provide confidence before deployment</li>
                          </ul>
                        </div>

                        <div className="bg-slate-100 rounded-xl p-6">
                          <h3 className="font-semibold text-slate-800 mb-3">Team Alignment</h3>
                          <ul className="list-disc pl-6 space-y-1 text-slate-700">
                            <li>Clear, readable failure messages</li>
                            <li>Shared understanding of quality standards</li>
                            <li>Faster debugging cycles</li>
                          </ul>
                        </div>

                      </div>

                      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded">
                        <p className="text-indigo-900 font-medium">
                          The bigger vision: treat every bug as a signal to strengthen the system.
                        </p>
                      </div>
                      
                    </section>
                    <section className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
                      <h2 className="text-2xl font-semibold text-slate-800">CMS</h2>
                      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded">
                      <li className="text-indigo-900 font-medium">/directory/admin/clinics</li>
                        <li className="text-indigo-900 font-medium">/directory/admin/practitioners</li>
                       <li className="text-indigo-900 font-medium"> /directory/admin/treatments</li>
                      <li className="text-indigo-900 font-medium">  /directory/admin/products</li></div>
                        <p className="text-slate-700 leading-relaxed">
 
                        These links can be used to access the CMS and edit page data manually. 
                        
                        This is useful for quick fixes, but for systemic issues, the testing workflow described above is more effective.
                      </p>
                    </section>


                

                  </div>
                </div>
              </CardContent>

                  
            </Card>
          </TabsContent>
          <TabsContent value="specs" className="space-y-4">
            {Object.entries(testDetails).map((suite:any, section:any ) => (
              <Accordion type="single" collapsible className="space-y-4">
                
                <AccordionItem value={suite[0]}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-start text-lg font-bold">
                    {`${suite[0]}`}</div></AccordionTrigger>

                 <AccordionContent>
                      <div className="space-y-3">
                        {Object.entries(suite[1]).map((test:any, testIndex:any) => (
                          <>
                          <div
                            key={testIndex}
                            className={`p-3 rounded border`}
                            >
                          
                            
                      {Object.entries(test[1]).map((test:any, testIndex:any) => (
                        <div className='p-4 text-lg'>{Array.isArray(test[1]) ? test[1].map((item) => <li className='text-sm'>{item}</li>) :test[1]}</div>
                   
                      ))}</div></>
                    ))}
                    </div>
                    </AccordionContent></AccordionItem>
                  </Accordion>
            
                  ))}
          </TabsContent>

          <TabsContent value="failed" className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Unique Error Codes:
              <pre className="bg-slate-900 text-slate-100 text-sm p-4 rounded-xl overflow-x-auto"><code>{Array.from(failedTestMessages).join('\n')}</code></pre>
            </h3>
            {failedTests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900">All Tests Passed!</h3>
                  <p className="text-gray-500 mt-2">No failed tests to display.</p>
                </CardContent>
              </Card>
            ) : (
              failedTests.map((test, index) => (
                <Card key={index} className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-900">
                      <XCircle className="w-5 h-5" />
                      {test.fullName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        Duration: {formatDuration(test.duration)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        {extractFileName(report.testResults.find(s => s.assertionResults.includes(test))?.name || '')}
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Error Message:</h4>
                        <pre className="bg-red-50 p-3 rounded text-sm text-red-900 overflow-x-auto">
                          {stripAnsiCodes(test.failureMessages.join('\n').split('at ')[0])}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <Accordion type="single" collapsible className="space-y-4">
              {report.testResults.map((suite, suiteIndex) => {
                const suiteDuration = suite.endTime - suite.startTime
                const suitePassed = suite.status === 'passed'

                return (
                  <AccordionItem key={suiteIndex} value={`suite-${suiteIndex}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        {suitePassed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span className="font-medium">{extractFileName(suite.name)}</span>
                        <Badge variant={suitePassed ? "default" : "destructive"} className="ml-auto">
                          {suitePassed ? 'Passed' : 'Failed'}
                        </Badge>
                        <Badge variant="outline">
                          {suite.assertionResults.length} tests
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {formatDuration(suiteDuration)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div>
                        {}
                      </div>
                      <div className="pl-8 pt-2 space-y-2">
                        {suite.assertionResults.map((test, testIndex) => (
                          <div
                            key={testIndex}
                            className={`p-3 rounded border ${
                              test.status === 'failed'
                                ? 'bg-red-50 border-red-200'
                                : 'bg-green-50 border-green-200'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {test.status === 'failed' ? (
                                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                              ) : (
                                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900">{test.title}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Duration: {formatDuration(test.duration)}
                                </div>
                                {test.status === 'failed' && test.failureMessages.length > 0 && (
                                  <details className="mt-2">
                                    <summary className="cursor-pointer text-sm text-red-700 font-medium hover:text-red-800">
                                      View error details
                                    </summary>
                                    <pre className="mt-2 p-3 bg-white rounded text-sm text-red-900 overflow-x-auto whitespace-pre-wrap">
                                      {stripAnsiCodes(test.failureMessages.join('\n').split('at ')[0])}
                                    </pre>
                                  </details>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
