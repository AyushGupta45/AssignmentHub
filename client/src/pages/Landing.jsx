import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, BarChart3, CheckCircle, ArrowRight } from "lucide-react";

export default function Landing() {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Minimal navbar */}
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <BookOpen className="h-5 w-5" />
            <span>AssignmentHub</span>
          </div>
          <div className="flex items-center gap-2">
            {currentUser ? (
              <Button asChild>
                <Link to={currentUser.role === "admin" ? "/admin/dashboard" : "/dashboard"}>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Submit. Track.{" "}
              <span className="text-primary">Succeed.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              A simple assignment management platform where admins create tasks and
              students submit their work. Track progress, get evaluated, stay on top.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser ? (
                <Button size="lg" asChild>
                  <Link to={currentUser.role === "admin" ? "/admin/dashboard" : "/dashboard"}>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link to="/sign-up">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/sign-in">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
            <div className="text-center space-y-3 p-6 rounded-lg border bg-card">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Assignments</h3>
              <p className="text-sm text-muted-foreground">
                Admin creates assignments with descriptions, due dates, and reference files
              </p>
            </div>
            <div className="text-center space-y-3 p-6 rounded-lg border bg-card">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Students upload their work and track submission status in real time
              </p>
            </div>
            <div className="text-center space-y-3 p-6 rounded-lg border bg-card">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Evaluation</h3>
              <p className="text-sm text-muted-foreground">
                Admin evaluates submissions with scores and feedback. Students get notified
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AssignmentHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
