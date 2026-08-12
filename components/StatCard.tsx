type StatCardProps = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-enterprise-border/80 bg-white p-4 shadow-[0_8px_22px_rgba(6,33,63,0.07)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-enterprise-blue">{label}</p>
      <p className="mt-2 text-lg font-bold text-enterprise-charcoal">{value}</p>
    </article>
  );
}
