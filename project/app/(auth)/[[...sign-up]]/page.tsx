import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-glow-primary">
            Create MEDiator Account
          </h1>
          <p className="text-muted-foreground">
            Join our telehealth platform
          </p>
        </div>

        <div className="flex justify-center items-center p-4">
          <SignUp 
            fallbackRedirectUrl="/dashboard"
            forceRedirectUrl="/dashboard"
            signInUrl="/sign-in"
            appearance={{
              elements: {
                rootBox: "flex justify-center items-center w-full overflow-visible",
                card: "bg-card border-border shadow-xl rounded-xl mx-auto w-full overflow-visible",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
                formButtonPrimary: 
                  "bg-primary text-primary-foreground hover:opacity-90 transition-all text-sm normal-case border-none",
                socialButtonsBlockButton: 
                  "bg-background border-border text-foreground hover:bg-muted transition-colors",
                footerActionLink: "text-primary hover:text-primary/80 transition-colors",
                formFieldLabel: "text-foreground font-medium",
                formFieldInput: "bg-background border-border text-foreground focus:ring-primary",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground"
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}