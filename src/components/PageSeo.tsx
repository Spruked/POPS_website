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
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "P.O.P.S. - Proof of Presence System",
        url: SITE_URL,
        logo: `${SITE_URL}/popsbadge.png`,
        sameAs: [
          "https://spruked.com/",
          "https://orbweaver.spruked.com/",
          "https://certsig.com/",
          "https://truemarkmint.com/"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "P.O.P.S.",
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#organization` }
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        primaryImageOfPage: { "@id": `${imageUrl}#primaryimage` }
      }
    ]
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content="P.O.P.S. Proof of Presence System" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
