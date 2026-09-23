// This layout overrides the root layout, giving us a completely blank, clean canvas for login
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}