export default function AuthDivider({ children = "Or continue with" }) {
  return (
    <div className="relative py-6">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-slate-200" />
      </div>
      <div className="relative flex justify-center text-xs font-medium uppercase tracking-wider text-slate-400">
        <span className="bg-white px-3">{children}</span>
      </div>
    </div>
  );
}
