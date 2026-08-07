import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { IconUser, IconHeart, IconAward, IconBuilding } from "@tabler/icons-react"
import type { Practitioner, ReviewAnalysis } from "@/lib/types"

interface PractitionerInsightsProps {
  practitioner: Practitioner
}

export function PractitionerInsights({ practitioner }: Readonly<PractitionerInsightsProps>) {
  const reviewAnalysis: ReviewAnalysis = practitioner.reviewAnalysis!
  

  if (!reviewAnalysis) return null

  const practitionerData = reviewAnalysis.practitioners[0]

  return (
    <div className="space-y-6">
      {/* Practitioner Attributes */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUser stroke={1.5} className="h-5 w-5 text-accent" />
            Professional Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {practitionerData.attributes.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Professional Attributes</h4>
              <div className="flex flex-wrap gap-2">
                {practitionerData.attributes.map((attribute, index) => (
                  <Badge key={index} variant="secondary">
                    {attribute}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {practitionerData.interpersonal_skills?.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Interpersonal Skills</h4>
              <div className="flex flex-wrap gap-2">
                {practitionerData.interpersonal_skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {practitionerData.trust_signals.length > 0 && (
            <div>
              <h4 className="font-medium text-foreground mb-3">Trust Signals</h4>
              <div className="flex flex-wrap gap-2">
                {practitionerData.trust_signals.map((signal, index) => (
                  <Badge key={index} variant="default" className="bg-accent text-accent-foreground">
                    {signal}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Treatment Outcomes */}
        {reviewAnalysis.treatment_outcomes?.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconAward stroke={1.5} className="h-4 w-4 text-accent" />
                Treatment Outcomes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {reviewAnalysis.treatment_outcomes?.map((outcome, index) => (
                  <Badge key={index} variant="secondary">
                    {outcome}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clinic Environment */}
        {reviewAnalysis?.clinic_environment?.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconBuilding stroke={1.5} className="h-4 w-4 text-accent" />
                Clinic Environment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {reviewAnalysis?.clinic_environment?.map((env, index) => (
                  <Badge key={index} variant="outline">
                    {env}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Loyalty */}
        {reviewAnalysis.reviewer_demographics?.loyalty_repeat_visits?.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconHeart stroke={1.5} className="h-4 w-4 text-accent" />
                Patient Loyalty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {reviewAnalysis.reviewer_demographics?.loyalty_repeat_visits?.map((loyalty, index) => (
                  <Badge key={index} variant="default" className="bg-accent text-accent-foreground">
                    {loyalty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {reviewAnalysis?.referrals_recommendations?.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconAward stroke={1.5} className="h-4 w-4 text-accent" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {reviewAnalysis?.referrals_recommendations?.map((rec, index) => (
                  <Badge key={index} variant="default" className="bg-accent text-accent-foreground">
                    {rec}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}