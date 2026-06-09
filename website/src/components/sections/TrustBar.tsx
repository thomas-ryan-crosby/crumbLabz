const trustItems = [
  { label: "Rapid Delivery", detail: "Working tools in days" },
  { label: "Custom Built", detail: "Tailored to your workflow" },
  { label: "No Long Contracts", detail: "Project-based engagement" },
  { label: "Ongoing Support", detail: "We grow with you" },
];

export default function TrustBar() {
  return (
    <section className="bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 md:divide-x md:divide-border">
          {trustItems.map((item) => (
            <div key={item.label} className="text-center px-4">
              <p className="font-bold text-charcoal text-sm md:text-base flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                {item.label}
              </p>
              <p className="text-muted text-xs md:text-sm mt-1">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
