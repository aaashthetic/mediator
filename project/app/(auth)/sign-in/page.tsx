import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 transition-colors">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-glow-primary">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your MEDiator account
          </p>
        </div>

        <div className="flex justify-center items-center p-4">
          <SignIn
            fallbackRedirectUrl="/dashboard"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                rootBox: "flex justify-center items-center w-full",
                card: "auth-card-shadow border border-border bg-card mx-auto w-full rounded-xl",
                headerTitle: "text-foreground font-bold tracking-tight",
                headerSubtitle: "text-muted-foreground",
                formButtonPrimary: "clerk-primary-btn normal-case text-sm h-10 border-none",
                socialButtonsBlockButton: "border-border bg-background hover:bg-muted text-foreground transition-colors",
                formFieldLabel: "text-foreground font-medium",
                formFieldInput: "bg-background border-border text-foreground focus:ring-primary focus:border-primary transition-all",
                footerActionLink: "text-primary hover:text-primary/80 transition-colors font-medium",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground"
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}