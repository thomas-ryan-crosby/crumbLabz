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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {trustItems.map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-bold text-charcoal text-sm md:text-base">
                {item.label}
              </p>
              <p className="text-muted text-xs md:text-sm mt-0.5">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
