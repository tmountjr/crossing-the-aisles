interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>
      {subtitle && <p className="text-center">{subtitle}</p>}
    </>
  )
}

export default PageHeader