import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { LaunchPage, ContentSection as Section } from '../components/LaunchContent';
import { CustomerField, FormFeedback, Honeypot } from '../components/CustomerForms';
import { CustomerError, customerPost } from '../services/customerApi';
import { enableTikTokPixel, trackTikTokBetaSignup } from '../services/tiktokPixel';

const sources = ['tiktok', 'facebook', 'instagram', 'youtube', 'friend', 'other'] as const;

export default function BetaSignupPage() {
  const [params] = useSearchParams();
  const trackingSource = params.get('utm_source')?.toLowerCase() ?? '';
  const initialSource = sources.find(source => source === trackingSource) ?? '';
  const [source, setSource] = useState<string>(initialSource);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setFailed(false);
    setMessage('');
    setErrors({});
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await customerPost<{message: string; created?: boolean}>('beta', {
        ...payload, source, consent: payload.consent === 'on',
        updates: false, platform: payload.platform || 'android',
        experience: 'new',
      });
      setMessage(result.message);
      if (analyticsConsent && result.created === true) trackTikTokBetaSignup();
      setSubmitted(true);
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : 'Could not save your registration.');
      if (error instanceof CustomerError) setErrors(error.fields);
    } finally {
      setBusy(false);
    }
  }

  return <LaunchPage
    title="POPS Beta Tester Signup | Join Android Testing"
    description="Apply to participate in POPS Proof of Presence beta testing."
    path="/beta-signup"
    eyebrow="POPS • Android beta registration"
    heading="Help Us Put POPS to the Test"
    intro="We're inviting Android users to help test POPS, a Proof of Presence application designed to help parents organize their records and document important events. Tell us how to reach you and we'll contact selected testers with instructions."
  >
    <Section id="beta-signup" title="Register your interest">
      <p>Registration is an expression of interest, not a guaranteed invitation. Please do not submit any private family records, court documents, or information about children.</p>
      <form className="launch-form" onSubmit={submit} aria-busy={busy}>
        <CustomerField name="name" label="Full name" autoComplete="name" maxLength={100} required errors={errors} />
        <CustomerField name="email" label="Email address" type="email" autoComplete="email" required errors={errors} />
        <CustomerField name="phone" label="Phone number" type="tel" autoComplete="tel" maxLength={30} required errors={errors} />
        <CustomerField name="street_address" label="Street address (optional)" autoComplete="street-address" maxLength={200} errors={errors} />
        <CustomerField name="city" label="City (optional)" autoComplete="address-level2" maxLength={100} errors={errors} />
        <CustomerField name="state" label="State (optional)" autoComplete="address-level1" maxLength={100} errors={errors} />
        <label htmlFor="beta-signup-platform">Device you can test</label>
        <select id="beta-signup-platform" name="platform" defaultValue="android" required>
          <option value="android">Android phone</option>
          <option value="windows">Windows computer</option>
          <option value="both">Both Android and Windows</option>
        </select>
        <label htmlFor="beta-signup-source">Where did you hear about POPS?</label>
        <select id="beta-signup-source" value={source} onChange={event => setSource(event.target.value)} required>
          <option value="">Select one</option>
          <option value="tiktok">TikTok</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
          <option value="youtube">YouTube</option>
          <option value="friend">Friend or family</option>
          <option value="other">Other</option>
        </select>
        <Honeypot />
        <label className="launch-check"><input type="checkbox" checked={analyticsConsent} onChange={event => { setAnalyticsConsent(event.target.checked); if (event.target.checked) enableTikTokPixel(); }} /><span>Optional: Allow TikTok advertising measurement on this page so we can understand whether our ads bring beta registrations. This loads TikTok Pixel and may share browser and visit information with TikTok. Your contact details and form answers are not sent as conversion event properties. You can register without enabling this.</span></label>
        <label className="launch-check"><input type="checkbox" name="consent" required /><span>I agree to be contacted regarding POPS beta testing and have read the <Link to="/privacy">Privacy Notice</Link>. My information is for beta registration, not an unrelated marketing subscription.</span></label>
        <FormFeedback message={message} error={failed} />
        <button className="btn btn-primary" type="submit" disabled={busy || submitted}>{busy ? 'Submitting…' : submitted ? 'Registration received' : 'Join the beta interest list'}</button>
      </form>
    </Section>
  </LaunchPage>;
}
