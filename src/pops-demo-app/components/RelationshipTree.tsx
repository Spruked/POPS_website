import {useState} from 'react';
import {demoContacts,demoRelationships} from '../data/demoRecords';
import {usePlayersStore} from '../hooks/useStore';
export default function RelationshipTree({onOpenDossier}:{onOpenDossier:(id:string)=>void}){
 const [selected,setSelected]=useState('demo-alex');
 const people=usePlayersStore().items.filter(item=>demoContacts.some(original=>original.id===item.id));
 const person=people.find(item=>item.id===selected)||people[0];
 if(!person)return <div className="card"><h2>Relationship Tree</h2><p>No fictional people remain. Restart the tour to restore the example.</p></div>;
 const connections=demoRelationships.filter(link=>people.some(item=>item.id===link.from)&&people.some(item=>item.id===link.to));
 const paths:Record<string,string>={'demo-alexdemo-casey':'M120 72 L360 190','demo-jamiedemo-casey':'M600 72 L360 190','demo-attorneydemo-alex':'M120 300 L120 72','demo-witnessdemo-alex':'M600 300 L660 300 L660 25 L120 25 L120 72','demo-alexdemo-jamie':'M120 72 L600 72'};
 return <div><div className="page-header"><h2>Relationship Tree</h2><p>Conceptual preview — not confirmed as a current application feature.</p></div><div className="demo-concept"><strong>Explicit fictional connections only.</strong> No inferred relationships, live research, or independently verified identities.</div><div className="demo-relationship-map" role="group" aria-label="Fictional dossier relationships">
 <svg viewBox="0 0 720 380" preserveAspectRatio="none" aria-hidden="true" className="demo-relationship-lines">{connections.map(link=><path key={link.from+link.to} d={paths[link.from+link.to]} fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeDasharray="6 5"/>)}</svg>
 {people.map(contact=><button key={contact.id} className={`demo-person demo-person-${demoContacts.findIndex(item=>item.id===contact.id)}${person.id===contact.id?' selected':''}`} aria-pressed={person.id===contact.id} onClick={()=>setSelected(contact.id)}><span className="demo-person-avatar">{contact.name.split(' ').map(word=>word[0]).join('')}</span><strong>{contact.name}</strong><span>{contact.role}</span></button>)}
 </div><section className="card" aria-live="polite"><h3>{person.name}</h3><p>{person.relationshipToCase}</p><ul className="demo-relations">{connections.filter(link=>link.from===person.id||link.to===person.id).map(link=><li key={link.from+link.to}><strong>{people.find(item=>item.id===link.from)?.name}</strong> — {link.label.toLowerCase()} — <strong>{people.find(item=>item.id===link.to)?.name}</strong></li>)}</ul><button className="btn btn-primary" onClick={()=>onOpenDossier(person.id)}>Open {person.name}’s dossier</button></section></div>;
}
