# Customer accounts — development contract

The existing Django user/password/session system is extended, not replaced. Customer data is stored only in the customer database, separate from ORB memory and inference. Checkout remains disabled.

## Registration and profile

First and last names, normalized unique verified email, valid international phone, street, city, state/region, postal code and ISO country are required for new registrations. Middle name, display name and address line two are optional. Full name is derived. Country defaults to US; US states/territories use standardized two-letter selections and ZIP validation. International numbers are validated using phonenumbers and stored in E.164 form, with extension where provided. Country choices use pycountry. Server validation is authoritative.

`/account/profile` reviews and updates the customer's own information; `/account/preferences` manages the independently optional marketing and research preferences. Both start unchecked. Registration/access do not depend on either consent. Every change or withdrawal records purpose, old/new choice, policy version, source and timestamp. Verification, reset, security and necessary service emails remain operational communications; no advertising campaign or third-party sharing is activated.

Email changes require the current password and reserve a unique pending email. The current login remains valid until the signed expiring link is verified. Verification then updates the identity, revokes sessions through an authentication version and notifies the old address. Pending changes can be canceled. Original account creation time is preserved; profile, consent and geography have separate timestamps. Status is active, unverified, suspended or closed. Login and each authenticated request enforce status, verification and session version.

Migrations 0002 and 0003 preserve original users, password hashes and creation dates. Legacy accounts receive empty unknown profile values; no surname, address, registration state, consent or verification timestamp is invented. Historically enabled accounts retain access with legacy verification status and an unknown verification date. New profiles must supply required details when saved. Normalized email collisions stop migration explicitly rather than silently merging identities. An online local database backup was taken before applying migrations.

## Administrator reporting and access

`/account/admin` is restricted to authorized staff and model permissions. Run `python backend/manage_customers.py customer_roles` to create the groups; this command does not make users staff or assign privileges.

| Group | Access |
|---|---|
| Customer Geographic Analyst | Aggregated geographic reporting |
| Customer Support | Individual profile access for recorded business purposes |
| Customer Account Manager | Both above and account-status management |

Current distribution uses current country/state; percentages use all registered nonstaff accounts as denominator. Active means verified, enabled and active status. Paying customers require positive completed payment records with verified timestamps; until such records exist, the metric is unavailable. Cart contents never count as purchases. Active beta participants and unreviewed beta interest are distinct counts.

Monthly registration trends use original creation time and recorded registration geography; later moves do not rewrite those cohorts. Older unknown geography remains unknown. Country/state history records changes for future research without duplicating full street addresses. Trend date filters and current-distribution filters are labeled separately. StateFeatureFeedback reserves a future structured feedback capability; no demand or legal metrics are invented.

Aggregates contain no names, email, phone or street address. Individual search/detail requests require an authorized purpose and write an access audit; status changes are audited and revoke sessions. Listing is paginated. No public geographic endpoint or analytics export of addresses exists. General website analytics are disabled on account, cart and checkout pages, and no query strings are sent in public page views.

## Security and operation

Django password hashing/validators, CSRF, same-site HTTP-only sessions, expiring verification/reset links, login/request throttling and server validation remain in use. Development cookies use local HTTP; production HTTPS/secure-cookie settings are required separately. Runtime secrets, file-email outbox, SQLite database and logs remain ignored under `.local/customers/`, outside Vite's allowed files. This does not claim database encryption at rest; production access controls, encryption, backup/retention and delivery configuration require their own review.

Development mail is saved locally and is not externally delivered. An authorized customer administrator must be assigned deliberately; synthetic browser-test staff credentials are randomized and disabled after testing. No actual customer's privileges were changed for testing.

Validation: **25 Django tests**; real-browser registration, verification, profile, state move, independent consent withdrawal, pending/new-email verification, administrator aggregates, purpose-audited detail, suspension/session revocation and mobile layout. See `customer-validation/results.json`; screenshots use synthetic example.com identities only. No customer-page ORB requests occurred.
