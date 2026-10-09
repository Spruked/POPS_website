import { Helmet } from "react-helmet-async";

interface PageSeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  indexable?: boolean;
}

const SITE_URL = "https://pops.spruked.com";

function breadcrumbName(segment: string) {
  return decodeURIComponent(segment)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PageSeo({ title, description, path, image, indexable = true }: PageSeoProps) {
  const canonicalUrl = `${SITE_URL}${path}`;
  const imageUrl = image || `${SITE_URL}/popsbanner1600.png`;
  const pathSegments = path.split("/").filter(Boolean);
  const breadcrumbs = [
    {
      "@type": "ListItem",
      position: 1,
      name: "P.O.P.S.",
      item: `${SITE_URL}/`,
    },
    ...pathSegments.map((segment, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: index === pathSegments.length - 1 ? title.split("|")[0].trim() : breadcrumbName(segment),
      item: `${SITE_URL}/${pathSegments.slice(0, index + 1).join("/")}`,
    })),
  ];
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
        description: "Proof of Presence System: a local-first evidence and records platform for fathers.",
        inLanguage: "en-US",
        publisher: { "@id": `${SITE_URL}/#organization` }
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        inLanguage: "en-US",
        isAccessibleForFree: true,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        primaryImageOfPage: { "@id": `${imageUrl}#primaryimage` },
        breadcrumb: pathSegments.length > 0 ? { "@id": `${canonicalUrl}#breadcrumb` } : undefined,
      },
      ...(pathSegments.length > 0 ? [{
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: breadcrumbs,
      }] : []),
    ]
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="author" content="P.O.P.S. - Proof of Presence System" />
      <meta name="robots" content={indexable ? "index, follow, max-image-preview:large" : "noindex, nofollow"} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="P.O.P.S. — Proof of Presence System" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content="P.O.P.S. Proof of Presence System" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
