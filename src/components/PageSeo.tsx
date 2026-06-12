import { Helmet } from "react-helmet-async";

interface PageSeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
}

const SITE_URL = "https://pops.spruked.com";

export default function PageSeo({ title, description, path, image }: PageSeoProps) {
  const canonicalUrl = `${SITE_URL}${path}`;
  const imageUrl = image || `${SITE_URL}/popsbanner1600.png`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
}
