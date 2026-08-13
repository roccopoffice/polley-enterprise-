export function GoogleMap() {
  return (
    <div className="overflow-hidden rounded-card border border-enterprise-border shadow-card">
      <iframe
        title="Google Map of Houston, Texas"
        src="https://www.google.com/maps?q=Houston,%20Texas&output=embed"
        width="100%"
        height="420"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
