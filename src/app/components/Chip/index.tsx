import Link from "next/link";

export type ChipStyle = "dem" | "rep" | "ind" | "yea" | "nay" | "dnv";

interface ChipProps {
  children: React.ReactNode;
  href: string;
  style?: ChipStyle;
  additionalClassNames?: string[];
}

const STYLE_TITLES: Record<ChipStyle, string> = {
  "dem": "Democrat",
  "dnv": "Did Not Vote",
  "ind": "Independent",
  "nay": "Nay",
  "rep": "Republican",
  "yea": "Yea",
};

const Chip: React.FC<ChipProps> = ({
  children,
  href,
  style,
  additionalClassNames = [],
  ...props
}) => {
  const classes  = [
    "border-2",
    "rounded-md",
    "p-2",
    "mr-2",
    "mb-2",
    ...additionalClassNames
  ];

  if (style) {
    switch (style) {
      case "dem":
        classes.push("border-dem/75", "bg-dem/10", "hover:bg-dem/25");
        break;
      case "rep":
        classes.push("border-rep/75", "bg-rep/10", "hover:bg-rep/25");
        break;
      case "ind":
        classes.push("border-ind/75", "bg-ind/10", "hover:bg-ind/25");
        break;
      case "yea":
        classes.push("border-yea/75", "bg-yea/10", "hover:bg-yea/25");
        break;
      case "nay":
        classes.push("border-nay/75", "bg-nay/10", "hover:bg-nay/25");
        break;
      case "dnv":
        classes.push("border-dnv/75", "bg-dnv/10", "hover:bg-dnv/25");
        break;
    }
  }

  return (
    <Link
      href={href}
      className={classes.join(" ")}
      title={STYLE_TITLES[style!]}
      {...props}
    >
      {children}
    </Link>
  );
};

export default Chip;
