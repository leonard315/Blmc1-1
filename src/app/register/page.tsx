"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2, Plus, Trash2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

interface FamilyMember { name: string; relationship: string; age: string; education: string; occupation: string; }
interface Beneficiary  { name: string; relationship: string; age: string; }
interface LandRecord   { cropType: string; area: string; ownership: string; }

// Shared input styles
const fi = "bg-[#f4f3f9] border border-[#e8e6f0] rounded-xl h-10 text-sm focus-visible:ring-2 focus-visible:ring-[#5b4fa8]/30 focus-visible:border-[#5b4fa8] placeholder:text-gray-400 transition-all";
const ta = "bg-[#f4f3f9] border border-[#e8e6f0] rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-[#5b4fa8]/30 focus-visible:border-[#5b4fa8] placeholder:text-gray-400 resize-none transition-all";
const sl = "w-full bg-[#f4f3f9] border border-[#e8e6f0] rounded-xl h-10 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#5b4fa8]/30 focus:border-[#5b4fa8] text-gray-700 transition-all";

function SectionHeader({ num, title, desc }: { num: number; title: string; desc?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div
        className="w-7 h-7 rounded-xl text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-sm mt-0.5"
        style={{ background: 'linear-gradient(135deg, #5b4fa8, #7c6fd4)' }}
      >
        {num}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-semibold text-gray-600 block mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

export default function RegisterPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [membershipType, setMembershipType] = useState<'Regular'|'Associate'>('Regular');
  const [codeNumber, setCodeNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [civilStatus, setCivilStatus] = useState('');
  const [religion, setReligion] = useState('');
  const [contact, setContact] = useState('');
  const [promisedCapital, setPromisedCapital] = useState('');
  const [paidCapital, setPaidCapital] = useState('');
  const [dependents, setDependents] = useState('');
  const [occupation, setOccupation] = useState('');
  const [annualIncome, setAnnualIncome] = useState('');
  const [otherCoops, setOtherCoops] = useState('');
  const [family, setFamily] = useState<FamilyMember[]>([{ name:'', relationship:'', age:'', education:'', occupation:'' }]);
  const [benes, setBenes] = useState<Beneficiary[]>([{ name:'', relationship:'', age:'' }]);
  const [lands, setLands] = useState<LandRecord[]>([{ cropType:'', area:'', ownership:'' }]);
  const [pigSow, setPigSow] = useState('');
  const [pigBoar, setPigBoar] = useState('');
  const [pigGrower, setPigGrower] = useState('');
  const [chickenLayer, setChickenLayer] = useState('');
  const [chickenBroiler, setChickenBroiler] = useState('');
  const [chickenRooster, setChickenRooster] = useState('');
  const [feedsUsed, setFeedsUsed] = useState('');
  const [goal, setGoal] = useState('');
  const [contribution, setContribution] = useState('');
  const [dateSubmitted, setDateSubmitted] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { addApplication } = await import('@/lib/firestore-service');
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] ?? '';
      const lastName = nameParts.slice(1).join(' ') || firstName;
      await addApplication({
        firstName, lastName, email,
        address: homeAddress, occupation,
        contactNumber: contact,
        membershipType, status: 'pending',
      });
      setSubmitted(true);
      toast({ title: 'Application Submitted!', description: 'Our team will review it shortly.' });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4f3f9] to-[#fdf0f0] p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl text-center p-10 border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Application Received!</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Thank you for applying to join the Bansud Livestock Multipurpose Cooperative.
            Your registration is currently <strong className="text-gray-700">Pending Review</strong>.
            We'll notify you once it's processed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full h-12 rounded-2xl text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #5b4fa8, #7c6fd4)' }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4f3f9] to-[#fdf0f0] py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        {/* Page header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl border border-gray-100 shadow-sm overflow-hidden bg-white flex items-center justify-center">
              <img src="/blmc-logo.png" alt="BLMC" className="w-full h-full object-contain" onError={e => { e.currentTarget.style.display='none'; }} />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Join BLMC</h1>
          <p className="text-gray-500 text-sm mt-2">Become a member of Bansud's leading livestock cooperative today.</p>
        </div>

        {/* Main form card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Gradient top bar */}
          <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #5b4fa8, #c0392b)' }} />

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8" autoComplete="off">

            {/* S1 — Account Information */}
            <div className="bg-[#fafafa] rounded-2xl p-5 border border-gray-100">
              <SectionHeader num={1} title="Account Information" desc="Create your login credentials" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Email Address</FieldLabel>
                  <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" type="email" required className={fi} autoComplete="off" />
                </div>
                <div>
                  <FieldLabel required>Password</FieldLabel>
                  <div className="relative">
                    <Input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Create a password" type={showPassword ? 'text' : 'password'} required className={`${fi} pr-10`} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPassword(p=>!p)} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* S2 — Other Information */}
            <div className="bg-[#fafafa] rounded-2xl p-5 border border-gray-100">
              <SectionHeader num={2} title="Other Information" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div>
                  <FieldLabel>2×2 ID Picture</FieldLabel>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50 transition-colors font-medium text-gray-600 shadow-sm">Choose File</span>
                    <span className="text-xs text-gray-400">No file chosen</span>
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                </div>
                <div>
                  <FieldLabel>Membership Type</FieldLabel>
                  <div className="flex gap-4 mt-2">
                    {(['Regular','Associate'] as const).map(t=>(
                      <label key={t} className="flex items-center gap-2 text-sm cursor-pointer font-medium text-gray-700">
                        <input type="radio" name="mt" value={t} checked={membershipType===t} onChange={()=>setMembershipType(t)} className="accent-[#5b4fa8] w-4 h-4" />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel>Code Number</FieldLabel>
                  <Input value={codeNumber} onChange={e=>setCodeNumber(e.target.value)} className={fi} />
                </div>
              </div>
            </div>

            {/* S3 — Personal Information */}
            <div className="bg-[#fafafa] rounded-2xl p-5 border border-gray-100">
              <SectionHeader num={3} title="Personal Information" desc="Provide your personal details" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><FieldLabel required>Full Name</FieldLabel><Input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="e.g. Juan Dela Cruz" required className={fi} /></div>
                  <div><FieldLabel>Home Address</FieldLabel><Input value={homeAddress} onChange={e=>setHomeAddress(e.target.value)} placeholder="Barangay, Municipality, Province" className={fi} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><FieldLabel>Date of Birth</FieldLabel><Input value={dob} onChange={e=>setDob(e.target.value)} type="date" className={fi} /></div>
                  <div><FieldLabel>Age</FieldLabel><Input value={age} onChange={e=>setAge(e.target.value)} placeholder="e.g. 35" type="number" className={fi} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><FieldLabel>Gender</FieldLabel>
                    <select value={gender} onChange={e=>setGender(e.target.value)} className={sl}>
                      <option value="">-- Select --</option><option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div><FieldLabel>Civil Status</FieldLabel>
                    <select value={civilStatus} onChange={e=>setCivilStatus(e.target.value)} className={sl}>
                      <option value="">-- Select --</option><option>Single</option><option>Married</option><option>Widowed</option><option>Separated</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><FieldLabel>Religion</FieldLabel>
                    <select value={religion} onChange={e=>setReligion(e.target.value)} className={sl}>
                      <option value="">-- Select --</option><option>Roman Catholic</option><option>Islam</option><option>Iglesia ni Cristo</option><option>Born Again Christian</option><option>Other</option>
                    </select>
                  </div>
                  <div><FieldLabel>Contact Number</FieldLabel><Input value={contact} onChange={e=>setContact(e.target.value)} placeholder="0900-000-0000" className={fi} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><FieldLabel>Promised Share Capital ₱</FieldLabel><Input value={promisedCapital} onChange={e=>setPromisedCapital(e.target.value)} placeholder="e.g. 10000" type="number" className={fi} /></div>
                  <div><FieldLabel>Paid Share Capital ₱</FieldLabel><Input value={paidCapital} onChange={e=>setPaidCapital(e.target.value)} placeholder="e.g. 5000" type="number" className={fi} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><FieldLabel>No. of Dependents</FieldLabel><Input value={dependents} onChange={e=>setDependents(e.target.value)} placeholder="e.g. 3" type="number" className={fi} /></div>
                  <div><FieldLabel>Occupation / Source of Income</FieldLabel><Input value={occupation} onChange={e=>setOccupation(e.target.value)} placeholder="e.g. Farmer, Livestock Raiser" className={fi} /></div>
                </div>
                <div><FieldLabel>Annual Income ₱</FieldLabel><Input value={annualIncome} onChange={e=>setAnnualIncome(e.target.value)} placeholder="e.g. 120000" type="number" className={fi} /></div>
                <div><FieldLabel>Other Cooperatives You Belong To</FieldLabel><Textarea value={otherCoops} onChange={e=>setOtherCoops(e.target.value)} placeholder="List other cooperatives (if any)" className={`${ta} min-h-[70px]`} /></div>
              </div>
            </div>

            {/* S4 — Family Information */}
            <div className="bg-[#fafafa] rounded-2xl p-5 border border-gray-100">
              <SectionHeader num={4} title="Family Information" />
              <div className="space-y-3">
                <div className="hidden sm:grid grid-cols-5 gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                  <span>Name</span><span>Relationship</span><span>Age</span><span>Education</span><span>Occupation</span>
                </div>
                {family.map((f,i)=>(
                  <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center bg-white rounded-xl p-2 border border-gray-100">
                    <Input value={f.name} onChange={e=>{const n=[...family];n[i].name=e.target.value;setFamily(n);}} placeholder="Name" className={fi} />
                    <Input value={f.relationship} onChange={e=>{const n=[...family];n[i].relationship=e.target.value;setFamily(n);}} placeholder="Relationship" className={fi} />
                    <Input value={f.age} onChange={e=>{const n=[...family];n[i].age=e.target.value;setFamily(n);}} placeholder="Age" type="number" className={fi} />
                    <Input value={f.education} onChange={e=>{const n=[...family];n[i].education=e.target.value;setFamily(n);}} placeholder="Education" className={fi} />
                    <div className="flex gap-1.5">
                      <Input value={f.occupation} onChange={e=>{const n=[...family];n[i].occupation=e.target.value;setFamily(n);}} placeholder="Occupation" className={fi} />
                      {family.length>1&&<button type="button" onClick={()=>setFamily(family.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600 shrink-0 p-1 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={()=>setFamily([...family,{name:'',relationship:'',age:'',education:'',occupation:''}])}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-dashed border-[#5b4fa8]/40 text-[#5b4fa8] hover:bg-[#5b4fa8]/5 transition-colors">
                  <Plus className="w-3.5 h-3.5"/> Add Family Member
                </button>
              </div>
            </div>

            {/* S5 — Beneficiary */}
            <div className="bg-[#fafafa] rounded-2xl p-5 border border-gray-100">
              <SectionHeader num={5} title="Beneficiary / Heir" />
              <div className="space-y-3">
                <div className="hidden sm:grid grid-cols-3 gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                  <span>Name</span><span>Relationship</span><span>Age</span>
                </div>
                {benes.map((b,i)=>(
                  <div key={i} className="grid grid-cols-3 gap-2 items-center bg-white rounded-xl p-2 border border-gray-100">
                    <Input value={b.name} onChange={e=>{const n=[...benes];n[i].name=e.target.value;setBenes(n);}} placeholder="Name" className={fi} />
                    <Input value={b.relationship} onChange={e=>{const n=[...benes];n[i].relationship=e.target.value;setBenes(n);}} placeholder="Relationship" className={fi} />
                    <div className="flex gap-1.5">
                      <Input value={b.age} onChange={e=>{const n=[...benes];n[i].age=e.target.value;setBenes(n);}} placeholder="Age" type="number" className={fi} />
                      {benes.length>1&&<button type="button" onClick={()=>setBenes(benes.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600 shrink-0 p-1 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={()=>setBenes([...benes,{name:'',relationship:'',age:''}])}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-dashed border-[#5b4fa8]/40 text-[#5b4fa8] hover:bg-[#5b4fa8]/5 transition-colors">
                  <Plus className="w-3.5 h-3.5"/> Add Beneficiary
                </button>
              </div>
            </div>

            {/* S6 — Land Information */}
            <div className="bg-[#fafafa] rounded-2xl p-5 border border-gray-100">
              <SectionHeader num={6} title="Land Information" />
              <div className="space-y-3">
                <div className="hidden sm:grid grid-cols-3 gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">
                  <span>Type of Crop/Plant</span><span>Area (hectares)</span><span>Owner / Lessee / Shared</span>
                </div>
                {lands.map((l,i)=>(
                  <div key={i} className="grid grid-cols-3 gap-2 items-center bg-white rounded-xl p-2 border border-gray-100">
                    <Input value={l.cropType} onChange={e=>{const n=[...lands];n[i].cropType=e.target.value;setLands(n);}} placeholder="Type of Crop/Plant" className={fi} />
                    <Input value={l.area} onChange={e=>{const n=[...lands];n[i].area=e.target.value;setLands(n);}} placeholder="Area (hectares)" type="number" className={fi} />
                    <div className="flex gap-1.5">
                      <Input value={l.ownership} onChange={e=>{const n=[...lands];n[i].ownership=e.target.value;setLands(n);}} placeholder="Owner / Lessee / Shared" className={fi} />
                      {lands.length>1&&<button type="button" onClick={()=>setLands(lands.filter((_,j)=>j!==i))} className="text-red-400 hover:text-red-600 shrink-0 p-1 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={()=>setLands([...lands,{cropType:'',area:'',ownership:''}])}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-dashed border-[#5b4fa8]/40 text-[#5b4fa8] hover:bg-[#5b4fa8]/5 transition-colors">
                  <Plus className="w-3.5 h-3.5"/> Add Land Row
                </button>
              </div>
            </div>

            {/* S7 — Livestock */}
            <div className="bg-[#fafafa] rounded-2xl p-5 border border-gray-100">
              <SectionHeader num={7} title="Number of Livestock" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">🐷 Pigs</p>
                  <div><FieldLabel>Sow (Female)</FieldLabel><Input value={pigSow} onChange={e=>setPigSow(e.target.value)} type="number" placeholder="0" className={fi} /></div>
                  <div><FieldLabel>Boar (Male)</FieldLabel><Input value={pigBoar} onChange={e=>setPigBoar(e.target.value)} type="number" placeholder="0" className={fi} /></div>
                  <div><FieldLabel>Grower</FieldLabel><Input value={pigGrower} onChange={e=>setPigGrower(e.target.value)} type="number" placeholder="0" className={fi} /></div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-3">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">🐔 Chickens</p>
                  <div><FieldLabel>Layer (Egg-producing)</FieldLabel><Input value={chickenLayer} onChange={e=>setChickenLayer(e.target.value)} type="number" placeholder="0" className={fi} /></div>
                  <div><FieldLabel>Broiler (Meat)</FieldLabel><Input value={chickenBroiler} onChange={e=>setChickenBroiler(e.target.value)} type="number" placeholder="0" className={fi} /></div>
                  <div><FieldLabel>Rooster</FieldLabel><Input value={chickenRooster} onChange={e=>setChickenRooster(e.target.value)} type="number" placeholder="0" className={fi} /></div>
                </div>
              </div>
              <div className="mt-4"><FieldLabel>Type of Feeds Used</FieldLabel><Input value={feedsUsed} onChange={e=>setFeedsUsed(e.target.value)} className={fi} /></div>
            </div>

            {/* S8 — Goals */}
            <div className="bg-[#fafafa] rounded-2xl p-5 border border-gray-100">
              <SectionHeader num={8} title="Goals & Contribution" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><FieldLabel>What is your goal in joining the cooperative?</FieldLabel><Textarea value={goal} onChange={e=>setGoal(e.target.value)} className={`${ta} min-h-[90px]`} /></div>
                <div><FieldLabel>How can you contribute to the cooperative's growth?</FieldLabel><Textarea value={contribution} onChange={e=>setContribution(e.target.value)} className={`${ta} min-h-[90px]`} /></div>
              </div>
              <div className="mt-4 max-w-[200px]"><FieldLabel>Date Submitted</FieldLabel><Input value={dateSubmitted} onChange={e=>setDateSubmitted(e.target.value)} type="date" className={fi} /></div>
            </div>

            {/* Submit */}
            <div className="pt-2 space-y-4">
              <p className="text-xs text-center text-gray-400 leading-relaxed">
                By submitting this form, you agree to the BLMC Terms of Service and Privacy Policy.<br />All applications are subject to verification.
              </p>
              <button type="submit" disabled={loading}
                className="w-full h-13 py-3.5 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #5b4fa8 0%, #7c6fd4 50%, #c0392b 100%)' }}>
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Submit Application'}
              </button>
            </div>

          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">© 2025 BLMC Management System · v1.0.0</p>
      </div>
    </div>
  );
}
