# POPS OrbWeaver site package

This directory is a local mirror of the POPS client package from:

```text
/home/bryan/projects/Orb_Weaver/vault_system/clients/pops.spruked.com
```

It includes the current crawl 21, audit 12, historical crawl and audit files,
reports, recommendations, website ORB context, claims, context snapshots,
Dandy packs, and the OrbWeaver client index.

The website backend reads the active ORB context from:

```text
website_orb_context/latest_context.json
```

The mirrored package was copied locally so the POPS website can operate from a
versioned site-specific data bundle without reading the OrbWeaver vault at
runtime. Re-copy this directory when a newer crawl or audit is completed.
