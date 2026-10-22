import {useState} from 'react';
import {CustomerField} from './CustomerForms';
import type {CustomerOptions,CustomerProfile} from '../services/customerApi';
export default function CustomerDetailsFields({options,profile,errors}:{options:CustomerOptions|null;profile?:CustomerProfile;errors:Record<string,string[]>}){
 const [country,setCountry]=useState(profile?.country||'US');
 const [parts,setParts]=useState([profile?.first_name||'',profile?.middle_name||'',profile?.last_name||'']);
 function updatePart(index:number,value:string){setParts(current=>current.map((part,i)=>i===index?value:part));}
 return <>
 <fieldset className="customer-fieldset"><legend>Your name</legend><div className="customer-fields-grid">
 <CustomerField name="first_name" label="First name" autoComplete="given-name" required maxLength={150} defaultValue={profile?.first_name} onChange={e=>updatePart(0,e.target.value)} errors={errors}/>
 <CustomerField name="middle_name" label="Middle name (optional)" autoComplete="additional-name" maxLength={150} defaultValue={profile?.middle_name} onChange={e=>updatePart(1,e.target.value)} errors={errors}/>
 <CustomerField name="last_name" label="Last name" autoComplete="family-name" required maxLength={150} defaultValue={profile?.last_name} onChange={e=>updatePart(2,e.target.value)} errors={errors}/>
 <CustomerField name="display_name" label="Display name (optional)" autoComplete="nickname" maxLength={150} defaultValue={profile?.display_name} errors={errors}/>
 </div><p>Full name: <output aria-live="polite">{parts.map(s=>s.trim()).filter(Boolean).join(' ')||'Derived from your name fields'}</output></p></fieldset>
 <fieldset className="customer-fieldset"><legend>Contact and mailing address</legend>
 <CustomerField name="phone" label="Phone number" type="tel" autoComplete="tel" required maxLength={60} defaultValue={profile?.phone} errors={errors}/><p className="customer-field-help">Include the country calling code for an international number, such as +44. Extensions are supported. We do not send marketing texts.</p>
 <label htmlFor="customer-country">Country</label><select id="customer-country" name="country" value={country} onChange={e=>setCountry(e.target.value)} required aria-invalid={!!errors.country}>{(options?.countries||[['US','United States']]).map(([code,name])=><option key={code} value={code}>{name}</option>)}</select>{errors.country&&<span className="launch-field-error">{errors.country.join(' ')}</span>}
 <CustomerField name="street_address" label="Street address" autoComplete="address-line1" required maxLength={200} defaultValue={profile?.street_address} errors={errors}/>
 <CustomerField name="address_line2" label="Apartment / Suite (optional)" autoComplete="address-line2" maxLength={100} defaultValue={profile?.address_line2} errors={errors}/>
 <div className="customer-fields-grid"><CustomerField name="city" label="City" autoComplete="address-level2" required maxLength={100} defaultValue={profile?.city} errors={errors}/>
 {country==='US'?<div><label htmlFor="customer-state">State / Territory</label><select key="us-state" id="customer-state" name="state" defaultValue={profile?.country==='US'?profile.state:''} autoComplete="address-level1" required aria-invalid={!!errors.state}><option value="">Choose state or territory</option>{options?.us_states.map(([code,name])=><option value={code} key={code}>{name} ({code})</option>)}</select>{errors.state&&<span className="launch-field-error">{errors.state.join(' ')}</span>}</div>:<CustomerField key="international-state" name="state" label="State / Province / Region" autoComplete="address-level1" required maxLength={100} defaultValue={profile?.country===country?profile.state:''} errors={errors}/>}
 <CustomerField name="postal_code" label={country==='US'?'ZIP code':'Postal code'} autoComplete="postal-code" required maxLength={30} defaultValue={profile?.postal_code} errors={errors}/></div>
 </fieldset></>;
}
