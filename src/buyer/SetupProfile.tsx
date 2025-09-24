// src/BuyerSetupProfile.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { UserService } from '../firebase/userService';

type TempData = {
  phone?: string;
  isSignUp?: boolean;
  [k: string]: any;
};

type UserData = {
  id: string;
  type: 'buyer' | string;
  isComplete?: boolean;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  profileImage?: string | null;
  [k: string]: any;
};

type BuyerSetupProfileProps = {
  onNavigate: (path: string, payload?: any) => void;
  onBack: () => void;
  tempData?: TempData;
  onUpdateUser?: (user: UserData) => void;
};

const BuyerSetupProfile: React.FC<BuyerSetupProfileProps> = ({
  onNavigate,
  onBack,
  tempData = {},
  onUpdateUser
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    profileImage?: string | null;
  }>({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    profileImage: null
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string | null;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, profileImage: result }));
    };
    reader.onerror = () => {
      alert('Failed to read the image file');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // basic pincode validation (6 digits)
    const pincodeValue = formData.pincode?.trim() ?? '';
    if (!/^\d{6}$/.test(pincodeValue)) {
      alert('Please enter a valid 6-digit PIN code');
      setIsLoading(false);
      return;
    }

    try {
      // Save to Firestore
      if (tempData.phone) {
        await UserService.completeProfile(tempData.phone, formData, 'buyer');

        // Build user data for app state/local
        const userId = (tempData && tempData.id) ? String(tempData.id) : Date.now().toString();
        const userData: UserData = {
          ...tempData,
          ...formData,
          isComplete: true,
          type: 'buyer',
          id: userId
        };

        // Update app state if callback exists
        try {
          if (typeof onUpdateUser === 'function') onUpdateUser(userData);
        } catch (err) {
          console.error('onUpdateUser callback threw', err);
        }

        onNavigate('buyer-dashboard');
      } else {
        alert('Error: Phone number not found. Please start over.');
      }
    } catch (err) {
      console.error('Failed to save buyer profile', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfaf6] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="dashboard-card">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#154731] mb-2">Complete Your Profile</h2>
            <p className="text-[#666]">Let's set up your buyer profile</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-[#154731]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                    <span className="text-4xl">👤</span>
                  </div>
                )}
              </div>

              <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                Upload Photo (Max 2MB)
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#333] mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#333] mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input-field h-20 resize-none"
                  placeholder="Enter your complete address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Your city"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333] mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Your state"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#333] mb-2">PIN Code</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter PIN code"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Complete Setup'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={onBack} className="text-[#666] hover:text-[#333] font-medium" type="button">
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerSetupProfile;
