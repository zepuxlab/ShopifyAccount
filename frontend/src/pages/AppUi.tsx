import { Link } from "react-router-dom";

const AppUi = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="text-center">
      <h1 className="mb-2 text-xl font-semibold text-foreground">Customer Account</h1>
      <p className="mb-4 text-sm text-muted-foreground">Sign in to access your account.</p>
      <Link
        to="/login"
        className="inline-block rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground hover:bg-muted"
      >
        Sign in
      </Link>
    </div>
  </div>
);

export default AppUi;
