import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Loader2,
  Search,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { type Variants, motion } from "motion/react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

const stats = [
  { value: "500+", label: "Active Jobs", icon: Briefcase },
  { value: "200+", label: "Companies", icon: Building2 },
  { value: "10K+", label: "Job Seekers", icon: Users },
];

const features = [
  {
    icon: Search,
    title: "Smart Job Search",
    description:
      "Find the perfect role with advanced filters for type, location, and salary range.",
  },
  {
    icon: Zap,
    title: "One-Click Apply",
    description:
      "Apply instantly with your profile and personalized cover letter.",
  },
  {
    icon: TrendingUp,
    title: "Track Applications",
    description:
      "Monitor all your applications in real-time with status updates.",
  },
];

const sampleJobs = [
  {
    title: "Senior Frontend Engineer",
    company: "Stripe",
    location: "San Francisco, CA",
    type: "Full Time",
    salary: "$160k–$200k",
  },
  {
    title: "Product Designer",
    company: "Figma",
    location: "Remote",
    type: "Remote",
    salary: "$130k–$160k",
  },
  {
    title: "Backend Engineer",
    company: "Vercel",
    location: "New York, NY",
    type: "Contract",
    salary: "$140k–$180k",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function LandingPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 glass">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-700 tracking-tight">
              JobPortal
            </span>
          </div>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="nav.login_button"
            className="gap-2"
          >
            {isLoggingIn ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLoggingIn ? "Connecting..." : "Sign In"}
            {!isLoggingIn && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pb-24 pt-20">
        {/* Background decorations */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden="true"
        >
          <div className="absolute -right-64 -top-64 h-[600px] w-[600px] rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-4xl"
          >
            <motion.div variants={itemVariants}>
              <Badge
                variant="secondary"
                className="mb-6 inline-flex gap-1.5 px-3 py-1 text-sm"
              >
                <Zap className="h-3.5 w-3.5" />
                Trusted by 10,000+ professionals
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-display mb-6 text-5xl font-800 leading-tight tracking-tight text-foreground md:text-7xl"
            >
              Find Your{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dream Job
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              Connect with top companies, discover exciting opportunities, and
              take the next step in your career — all in one place.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            >
              <Button
                size="lg"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="landing.primary_button"
                className="h-12 gap-2 px-8 text-base font-600"
              >
                {isLoggingIn ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Briefcase className="h-5 w-5" />
                )}
                {isLoggingIn ? "Connecting..." : "Get Started Free"}
                {!isLoggingIn && <ArrowRight className="h-4 w-4" />}
              </Button>
              <p className="text-sm text-muted-foreground">
                No credit card required
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-border/50 bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-3 divide-x divide-border/50"
          >
            {stats.map(({ value, label, icon: Icon }) => (
              <motion.div
                key={label}
                variants={itemVariants}
                className="flex flex-col items-center px-4 py-2"
              >
                <Icon className="mb-1 h-6 w-6 text-primary" />
                <span className="font-display text-3xl font-800 text-foreground md:text-4xl">
                  {value}
                </span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="font-display mb-4 text-3xl font-700 tracking-tight md:text-4xl">
              Everything you need to land your next role
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Built for job seekers and employers alike — a seamless experience
              from discovery to hire.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-3"
          >
            {features.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className="group rounded-xl border border-border/50 bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-card-hover"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display mb-2 text-lg font-700">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Sample Jobs Preview ── */}
      <section className="bg-muted/20 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="font-display mb-4 text-3xl font-700 tracking-tight">
              Featured Opportunities
            </h2>
            <p className="text-muted-foreground">
              Top roles from leading companies — sign in to apply
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto max-w-2xl space-y-3"
          >
            {sampleJobs.map((job) => (
              <motion.div
                key={job.title}
                variants={itemVariants}
                className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-5 py-4 transition-all hover:border-primary/30 hover:shadow-card"
              >
                <div className="min-w-0">
                  <p className="font-display truncate font-700 text-foreground">
                    {job.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {job.company} · {job.location}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 flex-col items-end gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {job.type}
                  </Badge>
                  <span className="text-xs font-600 text-primary">
                    {job.salary}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={login}
              disabled={isLoggingIn}
              className="gap-2"
            >
              View All Jobs
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-12 text-center"
          >
            <h2 className="font-display mb-4 text-3xl font-700 tracking-tight md:text-4xl">
              Ready to find your next opportunity?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join thousands of professionals already using JobPortal.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                "Free to use",
                "Instant applications",
                "Real-time tracking",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  {benefit}
                </div>
              ))}
            </div>
            <Button
              size="lg"
              onClick={login}
              disabled={isLoggingIn}
              className="mt-8 gap-2 px-8"
            >
              {isLoggingIn ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : null}
              {isLoggingIn ? "Connecting..." : "Sign In to Get Started"}
              {!isLoggingIn && <ArrowRight className="h-4 w-4" />}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
