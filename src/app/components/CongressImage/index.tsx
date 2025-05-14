import Image from "next/image";

interface CongressImageProps {
  bioguideId: string;
  name: string;
  width?: number;
  height?: number;
};

const CongressImage: React.FC<CongressImageProps> = ({
  bioguideId,
  name,
  width=225,
  height=275,
}) => {
  return <Image
    src={`/api/legislator_image?bioguide_id=${bioguideId}`}
    alt={`Official portrait for ${name}`}
    width={width}
    height={height}
    priority
  />;
};

export default CongressImage