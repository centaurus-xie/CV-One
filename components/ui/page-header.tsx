type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="stack-16">
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="section-title">{title}</h1>
      <p className="page-copy">{description}</p>
    </div>
  );
}
