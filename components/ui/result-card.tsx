type ResultCardProps = {
  title: string;
  children: React.ReactNode;
};

export function ResultCard({ title, children }: ResultCardProps) {
  return (
    <section className="surface-card stack-16">
      <h2 className="card-title">{title}</h2>
      {children}
    </section>
  );
}
