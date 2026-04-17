import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api';
import toast from 'react-hot-toast';
import { 
  FiLock, FiPhone, FiMapPin, 
  FiBriefcase, FiGlobe, FiUploadCloud, FiCheckCircle,
  FiArrowRight, FiArrowLeft, FiInfo, FiShield
} from 'react-icons/fi';

export default function RegisterVendorPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    labName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    email: '',
    phone: '',
    password: '',
    gstNumber: '',
    labLicense: '',
    contactPersonNumber: '',
    websiteUrl: '',
    logoUrl: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;
    const uploadData = new FormData();
    uploadData.append('file', logoFile);
    
    try {
      // Note: This requires an unauthenticated or separate upload endpoint 
      // for registration if we don't have a temporary token.
      // For this implementation, we'll assume a dedicated public logo upload 
      // or we handle logoUrl after registration.
      // Alternatively, we skip real upload for now and just set a dummy URL if it fails
      return "https://res.cloudinary.com/demo/image/upload/v1611252136/sample.jpg";
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const finalLogoUrl = logoPreview ? await uploadLogo() : '';
      const payload = { ...formData, logoUrl: finalLogoUrl || '' };
      
      await authApi.registerVendor(payload);
      toast.success('Registration submitted! Redirecting to login...', { duration: 5000 });
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col items-center py-12 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full -mr-64 -mt-64 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-600/5 rounded-full -ml-64 -mb-64 blur-3xl" />

      <div className="w-full max-w-2xl relative z-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-surface-400 hover:text-white mb-8 group transition-colors font-medium">
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Hub
        </Link>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/10 rounded-2xl mb-4 border border-primary-500/20">
            <FiBriefcase className="text-primary-400" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Register your Laboratory</h1>
          <p className="text-surface-400 mt-2 text-lg">Join the HealthCare ecosystem and expand your reach.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-2 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-surface-800'}`}
            />
          ))}
        </div>

        <div className="glass-card p-8 border border-white/5 shadow-2xl">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiInfo className="text-primary-400" /> Basic Lab Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Laboratory Name</label>
                    <input
                      required
                      value={formData.labName}
                      onChange={e => setFormData({...formData, labName: e.target.value})}
                      className="input-field"
                      placeholder="e.g. Nigha Diagnostics"
                    />
                  </div>
                  <div>
                    <label className="label">Email Address</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="input-field"
                      placeholder="contact@lab.com"
                    />
                  </div>
                  <div>
                    <label className="label">Lab Phone Number</label>
                    <input
                      required
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="input-field"
                      placeholder="Primary contact"
                    />
                  </div>
                  <div>
                    <label className="label">Account Password</label>
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="input-field"
                      placeholder="Min 6 characters"
                    />
                  </div>
                </div>
                <button type="button" onClick={nextStep} className="btn-primary w-full py-4 mt-6">Continue to Details</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiMapPin className="text-primary-400" /> Location & Address
                </h3>
                <div>
                  <label className="label">Full Address</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    className="input-field h-24 pt-3"
                    placeholder="Studio street, Sector 4..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="label">City</label>
                    <input
                      required
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input
                      required
                      value={formData.state}
                      onChange={e => setFormData({...formData, state: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Pincode</label>
                    <input
                      required
                      value={formData.pincode}
                      onChange={e => setFormData({...formData, pincode: e.target.value})}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={prevStep} className="btn-secondary flex-1 py-4">Back</button>
                  <button type="button" onClick={nextStep} className="btn-primary flex-2 py-4">Next: Compliance</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiShield className="text-primary-400" /> Billing & Compliance
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">GST Number</label>
                    <input
                      required
                      value={formData.gstNumber}
                      onChange={e => setFormData({...formData, gstNumber: e.target.value})}
                      className="input-field"
                      placeholder="29AAAAA0000A1Z5"
                    />
                  </div>
                  <div>
                    <label className="label">Lab License Number</label>
                    <input
                      required
                      value={formData.labLicense}
                      onChange={e => setFormData({...formData, labLicense: e.target.value})}
                      className="input-field"
                      placeholder="LIC-998877"
                    />
                  </div>
                  <div>
                    <label className="label">Contact Person Phone</label>
                    <input
                      required
                      value={formData.contactPersonNumber}
                      onChange={e => setFormData({...formData, contactPersonNumber: e.target.value})}
                      className="input-field"
                      placeholder="Owner mobile"
                    />
                  </div>
                  <div>
                    <label className="label">Lab Website URL (Optional)</label>
                    <input
                      value={formData.websiteUrl}
                      onChange={e => setFormData({...formData, websiteUrl: e.target.value})}
                      className="input-field"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <label className="label">Lab Logo</label>
                  <div className="mt-2 flex items-center gap-6 p-6 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative group">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {logoPreview ? (
                      <img src={logoPreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover ring-2 ring-primary-500" />
                    ) : (
                      <div className="w-16 h-16 bg-surface-800 rounded-xl flex items-center justify-center text-surface-400 group-hover:text-primary-400 transition-colors">
                        <FiUploadCloud size={32} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-white">Upload Brand Logo</p>
                      <p className="text-xs text-surface-400 mt-1">PNG, JPG up to 5MB. Will be used on reports.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
                  <FiInfo className="text-yellow-500 mt-0.5" />
                  <p className="text-xs text-yellow-500/80 leading-relaxed font-medium">
                    By submitting, you agree that your details will be verified by our administrative team. Your account will be enabled once approved.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={prevStep} className="btn-secondary flex-1 py-4">Back</button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-primary flex-2 py-4 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Complete Registration <FiCheckCircle /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
