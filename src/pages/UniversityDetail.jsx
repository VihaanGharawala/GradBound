import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getUniversityById } from "@/lib/universityDataset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  MapPin,
  Trophy,
  DollarSign,
  Home,
  GraduationCap,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { loadProfile, isProfileComplete } from "@/lib/profileStorage";
import { offersTargetMajor, getVerdictGaps } from "@/lib/compositeScore";
import { safeComputeDecisionScore, getOutcomeMetrics } from "@/lib/decisionEngine";
import { TIER_COLORS, COUNTRY_FLAGS } from "@/lib/constants";
import ScoreRing from "@/components/radar/ScoreRing";
import MatchExplanation from "@/components/radar/MatchExplanation";
import { getPriorityLabel } from "@/lib/decisionEngine";

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardContent className="p-4 space-y-1">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <Icon className="w-4 h-4" />
          {label}
        </div>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function UniversityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [uni, setUni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(undefined);

  useEffect(() => {
    setProfile(loadProfile());
    setUni(getUniversityById(id));
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!uni) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 mx-auto text-slate-400" />
        <h2 className="text-xl font-semibold">University Not Found</h2>
        <Button onClick={() => navigate("/university-search")}>Back to Search</Button>
      </div>
    );
  }

  const hasProfile = isProfileComplete(profile);
  const verdict = hasProfile ? safeComputeDecisionScore(profile, uni, profile.priorities) : null;
  const gaps = hasProfile ? getVerdictGaps(profile, uni) : [];
  const majorAvailable = profile?.target_major
    ? offersTargetMajor(uni, profile.target_major)
    : null;
  const colors = verdict ? TIER_COLORS[verdict.tier] : null;
  const outcome = verdict ? getOutcomeMetrics(uni, profile) : null;

  const breakdownItems = verdict
    ? [
        { label: "CGPA / GPA", value: verdict.breakdown.cgpaComponent, max: 30 },
        { label: "Program fit", value: verdict.breakdown.majorComponent, max: 22 },
        { label: "Experience", value: verdict.breakdown.workComponent, max: 14 },
        { label: "Certifications", value: verdict.breakdown.certificationComponent, max: 9 },
        { label: "Research & Projects", value: verdict.breakdown.researchComponent, max: 15 },
        { label: "Standardized Tests", value: verdict.breakdown.testComponent, max: 10 },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-1 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      {/* Header */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-6">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{uni.flag_emoji || COUNTRY_FLAGS[uni.country]} {uni.country}</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight">{uni.name}</h1>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{uni.flag_emoji || COUNTRY_FLAGS[uni.country]}</span>
              <div>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mt-1">
                  <MapPin className="w-4 h-4" />
                  {uni.city}, {uni.country}
                </div>
              </div>
            </div>
            {uni.website_url && (
              <Button asChild className="gap-1 bg-teal-600 hover:bg-teal-700">
                <a href={uni.website_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" /> Visit Website
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Global Ranking" value={uni.global_ranking ? `#${uni.global_ranking}` : "N/A"} />
        <StatCard icon={GraduationCap} label="Acceptance Rate" value={`${uni.acceptance_rate || "N/A"}%`} />
        <StatCard icon={DollarSign} label="Annual Tuition" value={`$${(uni.tuition_annual_usd || 0).toLocaleString()}`} />
        <StatCard icon={Home} label="Living Costs/yr" value={`$${(uni.avg_annual_living_cost_usd || 0).toLocaleString()}`} />
      </div>

      {/* Offered Majors + Preferred Major Badge */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Offered Master's Programs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {majorAvailable !== null && (
            <div className="flex items-center gap-2">
              {majorAvailable ? (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-0 gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Offers your preferred major: {profile.target_major}
                </Badge>
              ) : (
                <Badge className="bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border-0 gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Does not offer your preferred major
                </Badge>
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {(uni.offered_majors || []).map((m) => (
              <Badge key={m} variant="secondary" className="text-xs">
                {m}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {hasProfile && verdict && <Card className="border-border">
        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary"/>3-Year Financial Outlook</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-secondary p-4"><p className="text-xs text-muted-foreground">Estimated investment</p><p className="mt-1 text-xl font-black">${outcome.total3.toLocaleString()}</p></div>
            <div className="rounded-xl bg-secondary p-4"><p className="text-xs text-muted-foreground">3-year earnings signal</p><p className="mt-1 text-xl font-black">${outcome.earnings3.toLocaleString()}</p></div>
            <div className="rounded-xl bg-primary/10 p-4"><p className="text-xs text-muted-foreground">Estimated 3-year net</p><p className="mt-1 text-xl font-black text-primary">{outcome.net3>=0?"+":"-"}${Math.abs(outcome.net3).toLocaleString()}</p></div>
          </div>
          <div className="mt-5 space-y-3"><div><div className="flex justify-between text-xs font-semibold"><span>Total study cost</span><span>${(outcome.tuition+outcome.living).toLocaleString()}/yr</span></div><div className="mt-1.5 h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full rounded-full bg-orange-400" style={{width:`${Math.min(100,((outcome.tuition+outcome.living)/80000)*100)}%`}}/></div></div><div className="rounded-xl border border-border p-3 text-xs text-muted-foreground">This is a directional dataset estimate, not a salary guarantee. Exchange rates, housing, taxes, job market conditions and immigration rules can change the outcome.</div></div>
        </CardContent>
      </Card>}

      {/* Admission Diagnostic Verdict */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Admission Diagnostic Verdict</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasProfile ? (
            <div className="text-center py-6 space-y-3">
              <AlertCircle className="w-10 h-10 mx-auto text-slate-400" />
              <p className="text-slate-500 dark:text-slate-400">
                Complete your Profile Diagnostic to see your personalized admission verdict.
              </p>
              <Button asChild className="bg-teal-600 hover:bg-teal-700">
                <Link to="/profile-diagnostic">Go to Profile Diagnostic</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <ScoreRing score={verdict.score} size={118} label="match" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><Badge className={`${colors.badge} border-0 text-sm px-3 py-1`}>{verdict.tier}</Badge><span className="text-sm font-bold text-muted-foreground">Personalized admission signal</span></div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">GradBound combines your profile evidence with this program's selectivity, cost, career and visa signals.</p>
                  <div className="mt-3 flex flex-wrap gap-2">{Object.entries(verdict.priorities || {}).filter(([,v]) => v > 0).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([key,value])=><span key={key} className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-black">{getPriorityLabel(key)} · {value}</span>)}</div>
                </div>
              </div>

              <MatchExplanation profile={profile} uni={uni} result={verdict} />

              <Progress value={verdict.score} className="h-2" />

              {/* Breakdown */}
              <div className="space-y-2 pt-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Score Breakdown
                </p>
                {breakdownItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 dark:text-slate-400 w-44 shrink-0">
                      {item.label}
                    </span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {item.value}/{item.max}
                    </span>
                  </div>
                ))}
              </div>

              {/* Gaps */}
              {gaps.length > 0 && (
                <div className="pt-2 space-y-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Areas to Improve
                  </p>
                  {gaps.map((g, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-sm text-rose-600 dark:text-rose-400"
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      {g}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}