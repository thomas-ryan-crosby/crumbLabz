const values = [
  { stat: "Days", label: "Not months — working solutions delivered rapidly" },
  { stat: "Targeted", label: "Focused tools that solve specific problems" },
  { stat: "Practical", label: "Built to improve how your business actually operates" },
];

export default function ValueSection() {
  return (
    <section className="bg-neutral py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="mb-6">Solutions Built Faster Than Ever</h2>
          <p className="text-lg text-muted">
            Modern development tools make it possible to design and deploy
            working solutions rapidly. Instead of months of development,
            CrumbLabz focuses on targeted tools that solve specific operational
            problems.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((item) => (
            <div key={item.stat} className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {item.stat}
              </div>
              <p className="text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
