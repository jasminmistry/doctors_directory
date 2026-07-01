import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const [
      totalPatients,
      newThisMonth,
      newLastMonth,
      googleAccounts,
      appleAccounts,
      totalLeads,
      leadsThisMonth,
      leadsLastMonth,
      unlockedLeads,
      ghostLeads,
      pricingLeads,
      patientsWithBookings,
      patientsWithChats,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.patient.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.patient.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
      prisma.patientOAuthAccount.count({ where: { provider: 'google' } }),
      prisma.patientOAuthAccount.count({ where: { provider: 'apple' } }),
      prisma.consultationLead.count(),
      prisma.consultationLead.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.consultationLead.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
      prisma.consultationLead.count({ where: { isUnlocked: true } }),
      prisma.consultationLead.count({ where: { isGhostLead: true } }),
      prisma.consultationLead.count({ where: { treatment: 'Pricing Enquiry' } }),
      prisma.patient.count({ where: { bookings: { some: {} } } }),
      prisma.patient.count({ where: { chatSessions: { some: {} } } }),
    ])

    const magicLinkOnly = totalPatients - googleAccounts - appleAccounts
    const callbackLeads = totalLeads - pricingLeads

    return NextResponse.json({
      patients: {
        total: totalPatients,
        newThisMonth,
        newLastMonth,
        authMethods: {
          google: googleAccounts,
          apple: appleAccounts,
          magicLink: Math.max(0, magicLinkOnly),
        },
        withBookings: patientsWithBookings,
        withChats: patientsWithChats,
      },
      leads: {
        total: totalLeads,
        thisMonth: leadsThisMonth,
        lastMonth: leadsLastMonth,
        unlocked: unlockedLeads,
        ghost: ghostLeads,
        byType: {
          pricing: pricingLeads,
          callback: callbackLeads,
        },
      },
    })
  } catch (err) {
    console.error('patient-stats error', err)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
