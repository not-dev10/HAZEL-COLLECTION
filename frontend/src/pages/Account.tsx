import { useState } from 'react';
import { ArrowLeft, Edit2, Save, X, LogOut, Trash2, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Account = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'shipping'>('overview');

  const [formData, setFormData] = useState({
    firstName: user?.firstName || user?.fullName?.split(' ')[0] || '',
    lastName: user?.lastName || user?.fullName?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    billingStreet: user?.billingAddress?.street || '',
    billingCity: user?.billingAddress?.city || '',
    billingState: user?.billingAddress?.state || '',
    billingZip: user?.billingAddress?.zip || '',
    billingCountry: user?.billingAddress?.country || '',
    shippingStreet: user?.shippingAddress?.street || '',
    shippingCity: user?.shippingAddress?.city || '',
    shippingState: user?.shippingAddress?.state || '',
    shippingZip: user?.shippingAddress?.zip || '',
    shippingCountry: user?.shippingAddress?.country || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);

      const token = sessionStorage.getItem('authToken');
      if (!token) {
        setSaveMessage({ type: 'error', text: 'Authentication token not found. Please log in again.' });
        return;
      }

      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const updatePayload = {
        fullName,
        phone: formData.phone,
        gender: formData.gender,
        address: `${formData.billingStreet}, ${formData.billingCity}`,
        city: formData.billingCity,
        country: formData.billingCountry,
      };

      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      // Map backend response to UserProfile format
      const updatedUserData = {
        ...data.data,
        fullName: data.data.name || data.data.fullName, // Backend returns 'name', map it to 'fullName'
        firstName: (data.data.name || '').split(' ')[0],
        lastName: (data.data.name || '').split(' ').slice(1).join(' '),
      };

      // Update the user context
      updateProfile(updatedUserData);

      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save profile. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    try {
      if (!deletePassword) {
        alert('Please enter your password to confirm deletion');
        return;
      }

      setIsDeleting(true);
      const token = sessionStorage.getItem('authToken');
      
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete account');
      }

      // Clear all user data
      logout();
      sessionStorage.clear();
      localStorage.clear();
      
      // Show brief success feedback then auto-redirect
      console.log('✅ Account deleted successfully');
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete account. Please try again.');
      setIsDeleting(false);
      setDeletePassword('');
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center justify-center py-20">
              <h1 className="text-3xl font-serif mb-4">Please Login</h1>
              <p className="text-muted-foreground mb-8">
                You need to be logged in to view your account
              </p>
              <Button onClick={() => navigate('/')} className="px-8">
                Back to Home
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6">
                {/* Profile Avatar */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/50 rounded-full flex items-center justify-center mb-4">
                    <User size={40} className="text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-serif">
                    {user.firstName || user.fullName || 'Welcome'}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customer ID: {user.id?.substring(0, 8)}...
                  </p>
                </div>

                {/* Navigation Tabs */}
                <div className="space-y-2 mb-6">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full text-left px-4 py-2 rounded transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('billing')}
                    className={`w-full text-left px-4 py-2 rounded transition-colors ${
                      activeTab === 'billing'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    Billing Address
                  </button>
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className={`w-full text-left px-4 py-2 rounded transition-colors ${
                      activeTab === 'shipping'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    Shipping Address
                  </button>
                </div>

                {/* Logout Button */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full text-destructive hover:bg-destructive/10"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>

                {/* Delete Account Button */}
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="outline"
                  className="w-full text-red-600 hover:bg-red-50 border-red-200 mt-3"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-background border border-border rounded-lg max-w-md w-full p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Trash2 className="text-red-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-foreground">Delete Account?</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        This action cannot be undone. Your account and all associated data will be permanently deleted.
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">
                      ⚠️ <strong>Warning:</strong> This will permanently delete your account, profile, and all your data. This cannot be reversed.
                    </p>
                  </div>

                  <div className="mb-6">
                    <Label htmlFor="deletePassword" className="text-sm">
                      Enter your password to confirm
                    </Label>
                    <Input
                      id="deletePassword"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-2"
                      disabled={isDeleting}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeletePassword('');
                      }}
                      variant="outline"
                      className="flex-1"
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={isDeleting || !deletePassword}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6 md:p-8">
                {/* Header with Edit Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3">
                  <h1 className="text-2xl sm:text-3xl font-serif break-words">
                    {activeTab === 'overview' && 'Account Overview'}
                    {activeTab === 'billing' && 'Billing Address'}
                    {activeTab === 'shipping' && 'Shipping Address'}
                  </h1>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <Edit2 size={16} />
                      Edit
                    </Button>
                  )}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {isEditing ? (
                      <>
                        {/* Personal Information Edit Form */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            Personal Information
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="h-10"
                              />
                            </div>
                            <div>
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="h-10"
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="h-10"
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div>
                              <Label htmlFor="dateOfBirth">Date of Birth</Label>
                              <Input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div>
                              <Label htmlFor="gender">Gender</Label>
                              <Select
                                value={formData.gender}
                                onValueChange={(value) =>
                                  handleSelectChange('gender', value)
                                }
                              >
                                <SelectTrigger id="gender">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Personal Information Display */}
                        <div>
                          <h3 className="text-lg font-semibold mb-6">
                            Personal Information
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-4 pb-4 border-b border-border">
                              <User size={20} className="text-muted-foreground mt-1" />
                              <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">
                                  {user.firstName || user.fullName || 'Not provided'} {user.lastName || ''}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-4 pb-4 border-b border-border">
                              <Mail size={20} className="text-muted-foreground mt-1" />
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Email
                                </p>
                                <p className="font-medium">{user.email}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-4 pb-4 border-b border-border">
                              <Phone size={20} className="text-muted-foreground mt-1" />
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Phone
                                </p>
                                <p className="font-medium">{user.phone || 'Not provided'}</p>
                              </div>
                            </div>

                            {user.dateOfBirth && (
                              <div className="flex items-start gap-4 pb-4 border-b border-border">
                                <Calendar size={20} className="text-muted-foreground mt-1" />
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Date of Birth
                                  </p>
                                  <p className="font-medium">
                                    {new Date(user.dateOfBirth).toLocaleDateString(
                                      'en-GB',
                                      {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      }
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}

                            {user.gender && (
                              <div className="flex items-start gap-4">
                                <div className="w-5 h-5" />
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Gender
                                  </p>
                                  <p className="font-medium">{user.gender}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Member Since */}
                        <div className="bg-muted/50 rounded-lg p-4 mt-8">
                          <p className="text-sm text-muted-foreground mb-1">
                            Member Since
                          </p>
                          <p className="font-medium">
                            {user.joinDate || user.createdAt 
                              ? new Date(user.joinDate || user.createdAt!).toLocaleDateString('en-GB', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'Recently joined'
                            }
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Billing Address Tab */}
                {activeTab === 'billing' && (
                  <div>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="billingStreet">Street Address</Label>
                          <Input
                            id="billingStreet"
                            name="billingStreet"
                            value={formData.billingStreet}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingCity">City</Label>
                            <Input
                              id="billingCity"
                              name="billingCity"
                              value={formData.billingCity}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingState">State/Province</Label>
                            <Input
                              id="billingState"
                              name="billingState"
                              value={formData.billingState}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="billingZip">ZIP/Postal Code</Label>
                            <Input
                              id="billingZip"
                              name="billingZip"
                              value={formData.billingZip}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="billingCountry">Country</Label>
                            <Select
                              value={formData.billingCountry}
                              onValueChange={(value) =>
                                handleSelectChange('billingCountry', value)
                              }
                            >
                              <SelectTrigger id="billingCountry">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="United Kingdom">
                                  United Kingdom
                                </SelectItem>
                                <SelectItem value="United States">
                                  United States
                                </SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="Australia">Australia</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4">
                        <MapPin size={20} className="text-muted-foreground mt-1" />
                        <div>
                          {user.billingAddress?.street ? (
                            <>
                              <p className="font-medium mb-2">
                                {user.billingAddress.street}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.billingAddress.city && `${user.billingAddress.city}, `}
                                {user.billingAddress.state && `${user.billingAddress.state} `}
                                {user.billingAddress.zip}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.billingAddress.country}
                              </p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">No billing address provided</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Shipping Address Tab */}
                {activeTab === 'shipping' && (
                  <div>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="shippingStreet">Street Address</Label>
                          <Input
                            id="shippingStreet"
                            name="shippingStreet"
                            value={formData.shippingStreet}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="shippingCity">City</Label>
                            <Input
                              id="shippingCity"
                              name="shippingCity"
                              value={formData.shippingCity}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="shippingState">State/Province</Label>
                            <Input
                              id="shippingState"
                              name="shippingState"
                              value={formData.shippingState}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="shippingZip">ZIP/Postal Code</Label>
                            <Input
                              id="shippingZip"
                              name="shippingZip"
                              value={formData.shippingZip}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <Label htmlFor="shippingCountry">Country</Label>
                            <Select
                              value={formData.shippingCountry}
                              onValueChange={(value) =>
                                handleSelectChange('shippingCountry', value)
                              }
                            >
                              <SelectTrigger id="shippingCountry">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="United Kingdom">
                                  United Kingdom
                                </SelectItem>
                                <SelectItem value="United States">
                                  United States
                                </SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="Australia">Australia</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4">
                        <MapPin size={20} className="text-muted-foreground mt-1" />
                        <div>
                          {user.shippingAddress?.street ? (
                            <>
                              <p className="font-medium mb-2">
                                {user.shippingAddress.street}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.shippingAddress.city && `${user.shippingAddress.city}, `}
                                {user.shippingAddress.state && `${user.shippingAddress.state} `}
                                {user.shippingAddress.zip}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.shippingAddress.country}
                              </p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">No shipping address provided</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {isEditing && (
                  <div className="space-y-4 mt-8 pt-8 border-t border-border">
                    {saveMessage && (
                      <div
                        className={`p-4 rounded-lg ${
                          saveMessage.type === 'success'
                            ? 'bg-green-50 text-green-900 border border-green-200'
                            : 'bg-red-50 text-red-900 border border-red-200'
                        }`}
                      >
                        {saveMessage.text}
                      </div>
                    )}
                    <div className="flex gap-4">
                      <Button
                        onClick={handleSaveChanges}
                        className="gap-2"
                        disabled={isSaving}
                      >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="gap-2"
                        disabled={isSaving}
                      >
                        <X size={16} />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Account;
