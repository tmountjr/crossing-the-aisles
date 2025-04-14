interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <>
      <h1 className={`text-2xl font-bold text-center ${subtitle ? 'pb-0' : 'pb-4'}`}>{title}</h1>
      {subtitle && <p className="text-center pb-6 italic">{subtitle}</p>}
    </>
  )
}

export default PageHeader