const problems = [
  { title: "Manual Data Entry", description: "Hours spent typing information that could be captured automatically." },
  { title: "Slow Reporting", description: "Compiling reports manually when they could be generated instantly." },
  { title: "Disconnected Tools", description: "Software systems that don't talk to each other, creating extra work." },
  { title: "Slow Customer Response", description: "Inquiries that take too long to handle due to manual processes." },
  { title: "Repetitive Admin Tasks", description: "The same steps repeated daily that could be automated." },
];

export default function ProblemSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="mb-6">Every Business Has Operational Headaches</h2>
          <p className="text-lg text-muted">
            Many companies struggle with repetitive tasks, slow workflows,
            disconnected systems, or time-consuming reporting. These problems
            often consume hours of valuable time each week.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <div
              key={problem.title}
              className="bg-neutral rounded-xl p-6 border border-border"
            >
              <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
              <p className="text-sm text-muted">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
