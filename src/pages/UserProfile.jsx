import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  GraduationCap,
  Award,
  Briefcase,
  FlaskConical,
  Globe,
  Target,
  Pencil,
  Trash2,
  ArrowRight,
  BookOpen,
  FileText,
} from "lucide-react";
import { loadProfile, clearProfile, isProfileComplete } from "@/lib/profileStorage";
import { calculateTotalWorkMonths } from "@/lib/matchScore";
import { COUNTRY_FLAGS } from "@/lib/constants";
import EditProfileDrawer from "@/components/profile/EditProfileDrawer";
import { getAllUniversities } from "@/lib/universityDataset";
import { computeGradBoundScore } from "@/lib/decisionEngine";
import ScoreRing from "@/components/radar/ScoreRing";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(ym) {
  if (!ym) return "";
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

function ProfileField({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 break-words">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(undefined);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isProfileComplete(profile)) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-500/10 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-xl font-semibold">Complete Your Profile First</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Your profile is the foundation for GradBound. Complete the Profile Diagnostic to
              add your academics, test scores, experience, and preferences before this page can
              show your personalized profile summary.
            </p>
            <Button asChild className="bg-teal-600 hover:bg-teal-700 gap-1">
              <Link to="/profile-diagnostic">
                Go to Profile Diagnostic <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalWorkMonths = calculateTotalWorkMonths(profile.work_experiences);
  const uniDisplay =
    profile.undergrad_university === "Other / International University"
      ? profile.undergrad_university_custom || profile.undergrad_university
      : profile.undergrad_university || "Not specified";
  const majorDisplay =
    profile.major === "Other / Custom Major"
      ? profile.major_custom || profile.major
      : profile.major || "Not specified";

  const handleDelete = () => {
    clearProfile();
    navigate("/profile-diagnostic");
  };

  const handleEditSave = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Your diagnostic summary and academic profile.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setEditOpen(true)}
            className="gap-2 bg-teal-600 hover:bg-teal-700"
          >
            <Pencil className="w-4 h-4" /> Edit Profile
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/admissions-radar">
              View Matches <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      {(() => {
        const score = computeGradBoundScore(profile, getAllUniversities());
        const checks = [
          ["Academic record", !!profile.cgpa_value],
          ["Target program", !!profile.target_major],
          ["Standardized tests", Array.isArray(profile.standardized_tests) && profile.standardized_tests.some(t => t?.score !== "")],
          ["Experience", Array.isArray(profile.work_experiences) && profile.work_experiences.length > 0],
          ["Certifications", Number(profile.certifications_count) > 0],
          ["Research / projects", Number(profile.research_papers_count) > 0],
          ["Destination", Array.isArray(profile.target_countries) && profile.target_countries.length > 0],
        ];
        const completePct = Math.round(checks.filter(x => x[1]).length / checks.length * 100);
        const missing = checks.filter(x => !x[1]).slice(0, 3);
        return <Card className="border-primary/20 bg-primary/5"><CardContent className="p-5"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><ScoreRing score={score} size={104} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">GradBound Score</p><p className="mt-1 text-sm text-muted-foreground">Your profile signal across the universities that fit your goals.</p></div><span className="rounded-full bg-card px-3 py-1 text-xs font-black">Profile {completePct}% complete</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{width:`${completePct}%`}}/></div>{missing.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Next useful inputs: {missing.map(x => x[0]).join(" · ")}</p>}</div></div></CardContent></Card>;
      })()}

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5 text-teal-500" />
            {profile.full_name || "Anonymous Candidate"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <ProfileField icon={GraduationCap} label="Undergraduate University">
            {uniDisplay}
          </ProfileField>
          <ProfileField icon={BookOpen} label="Undergraduate Major">
            {majorDisplay}
          </ProfileField>
          <ProfileField icon={Award} label="GPA / CGPA">
            {profile.cgpa_value
              ? `${profile.cgpa_value} / ${profile.cgpa_scale === "10" ? "10.0" : "4.0"}`
              : "Not specified"}
            {profile.graduation_year && (
              <span className="text-slate-400 font-normal ml-2">
                (Class of {profile.graduation_year})
              </span>
            )}
          </ProfileField>
          <ProfileField icon={Target} label="Preferred Master's Specialization">
            {profile.target_major || "Not specified"}
          </ProfileField>
          {profile.target_university && (
            <ProfileField icon={GraduationCap} label="Target Master's University">
              {profile.target_university}
            </ProfileField>
          )}
          <ProfileField icon={Globe} label="Preferred Destination Countries">
            {(profile.target_countries || []).length > 0
              ? (profile.target_countries || []).map((c) => (
                  <Badge key={c} variant="secondary" className="mr-1.5 mb-1">
                    {COUNTRY_FLAGS[c] || ""} {c}
                  </Badge>
                ))
              : "Not specified"}
          </ProfileField>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="w-5 h-5 text-teal-500" />
            Work Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {Array.isArray(profile.work_experiences) && profile.work_experiences.length > 0 ? (
            <>
              {profile.work_experiences.map((exp, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {exp.role || "Role not specified"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {exp.company || "Company not specified"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDate(exp.start_date)} — {formatDate(exp.end_date)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-3 text-sm font-medium text-teal-600 dark:text-teal-400">
                <Briefcase className="w-4 h-4" />
                Total: {totalWorkMonths} month{totalWorkMonths !== 1 ? "s" : ""}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-3">
              No work experience entries recorded.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Research Papers / Projects
                </p>
                <p className="text-lg font-semibold">
                  {profile.research_papers_count || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Certifications
                </p>
                <p className="text-lg font-semibold">
                  {profile.certifications_count || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300 dark:border-rose-500/30">
              <Trash2 className="w-4 h-4" /> Delete Profile
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Profile?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently clear all your saved diagnostic data and reset the form
                to step 1. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <EditProfileDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
        onSave={handleEditSave}
      />
    </div>
  );
}