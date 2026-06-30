import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Button, Input, Card, CardContent, CardTitle } from '@/components/ui';
import { validateRequired, validatePhone } from '@/lib/validation';
import { cn } from '@/lib/utils';

export default function ProfileSetupPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const isCitizen = user?.role === 'citizen';

  // Shared fields
  const [phone, setPhone] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Citizen fields
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');

  // Authority fields
  const [department, setDepartment] = useState('');
  const [organization, setOrganization] = useState('');
  const [officeLocation, setOfficeLocation] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const phoneResult = validatePhone(phone);
    if (!phoneResult.valid) newErrors.phone = phoneResult.message;

    if (isCitizen) {
      const cityResult = validateRequired(city, 'City');
      if (!cityResult.valid) newErrors.city = cityResult.message;

      const stateResult = validateRequired(state, 'State');
      if (!stateResult.valid) newErrors.state = stateResult.message;
    } else {
      const deptResult = validateRequired(department, 'Department');
      if (!deptResult.valid) newErrors.department = deptResult.message;

      const orgResult = validateRequired(organization, 'Organization');
      if (!orgResult.valid) newErrors.organization = orgResult.message;

      const officeResult = validateRequired(officeLocation, 'Office location');
      if (!officeResult.valid) newErrors.officeLocation = officeResult.message;

      const phoneReq = validateRequired(phone, 'Phone number');
      if (!phoneReq.valid) newErrors.phone = phoneReq.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;
    if (!user) return;

    setLoading(true);
    try {
      const profileData = isCitizen
        ? { phone, city, state, address, profileCompleted: true, updatedAt: serverTimestamp() }
        : { phone, department, organization, officeLocation, profileCompleted: true, updatedAt: serverTimestamp() };

      await updateDoc(doc(db, 'users', user.uid), profileData);
      await refreshUser();
      navigate('/app/dashboard');
    } catch {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Complete your profile</h1>
          <p className="text-sm text-text-secondary mt-1">
            {isCitizen
              ? 'Tell us about yourself so we can serve you better.'
              : 'Set up your authority profile to get started.'}
          </p>
        </div>

        <Card>
          <CardTitle>
            {isCitizen ? 'Citizen Profile' : 'Authority Profile'}
          </CardTitle>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Photo Upload */}
              <div className="flex justify-center mb-2">
                <label className="relative cursor-pointer group">
                  <div
                    className={cn(
                      'flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed transition-colors',
                      'border-border group-hover:border-primary-400'
                    )}
                  >
                    {photoPreview ? (
                      <img src={photoPreview} alt="Profile" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <Camera className="h-6 w-6 text-text-muted group-hover:text-primary-500" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white">
                    <Camera className="h-3 w-3" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
              <p className="text-center text-xs text-text-muted mb-4">
                {isCitizen ? 'Upload a photo (optional)' : 'Upload your profile photo'}
              </p>

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
              />

              {isCitizen ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="City"
                      placeholder="Mumbai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      error={errors.city}
                      required
                    />
                    <Input
                      label="State"
                      placeholder="Maharashtra"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      error={errors.state}
                      required
                    />
                  </div>
                  <Input
                    label="Address (optional)"
                    placeholder="Street address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </>
              ) : (
                <>
                  <Input
                    label="Department"
                    placeholder="Public Works Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    error={errors.department}
                    required
                  />
                  <Input
                    label="Organization"
                    placeholder="Municipal Corporation"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    error={errors.organization}
                    required
                  />
                  <Input
                    label="Office Location"
                    placeholder="City Hall, Block A"
                    value={officeLocation}
                    onChange={(e) => setOfficeLocation(e.target.value)}
                    error={errors.officeLocation}
                    required
                  />
                </>
              )}

              {error && (
                <div className="rounded-[10px] bg-danger-50 border border-danger-200 px-3 py-2.5" role="alert">
                  <p className="text-sm text-danger-700">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" isLoading={loading}>
                Complete Setup
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
