type PricingRow = {
  service: string;
  price: string;
};

type PricingTableProps = {
  rows: PricingRow[];
};

export function PricingTable({ rows }: PricingTableProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-enterprise-border bg-white shadow-card">
      <div className="bg-enterprise-blue px-6 py-4">
        <h3 className="text-xl font-bold text-white">Washout Service Pricing</h3>
      </div>
      <div className="hidden md:block">
        <table className="w-full">
          <thead className="bg-enterprise-light text-left text-sm font-semibold text-enterprise-charcoal">
            <tr>
              <th className="px-6 py-4">Service</th>
              <th className="px-6 py-4 text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.service}
                className={index % 2 === 0 ? "bg-white" : "bg-enterprise-light/50"}
              >
                <td className="px-6 py-4 text-enterprise-charcoal">{row.service}</td>
                <td className="px-6 py-4 text-right font-semibold text-enterprise-navy">{row.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 p-5 md:hidden">
        {rows.map((row) => (
          <div key={row.service} className="rounded-2xl border border-enterprise-border p-4">
            <p className="font-semibold text-enterprise-charcoal">{row.service}</p>
            <p className="mt-1 text-enterprise-blue">{row.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
