import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { UserIcon, EditIcon, PlusIcon, TrashIcon, MapPinIcon } from '../../components/Icons';
import EditProfileModal from '../../components/modals/EditProfileModal';
import AddressModal from '../../components/modals/AddressModal';
import { supabase } from '../../lib/supabaseClient';

interface ProfileData {
    fullName: string;
    phone: string;
}

export interface Address {
    id: string;
    building: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
}

const ProfilePage = () => {
    const { user, session } = useAuth();
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    
    const [profile, setProfile] = useState<ProfileData>({ fullName: '', phone: '' });
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    // Load profile and address data from Supabase
    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    // Fetch profile
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('full_name, phone')
                        .eq('id', user.id)
                        .single();
                    
                    if (profileError && profileError.code !== 'PGRST116') throw profileError; // Ignore "no rows found"
                    if (profileData) {
                        setProfile({ fullName: profileData.full_name, phone: profileData.phone });
                    } else {
                        // Fallback if profile doesn't exist yet
                        setProfile({ fullName: user.user_metadata?.full_name || '', phone: user.phone || '' });
                    }

                    // Fetch addresses
                    const { data: addressesData, error: addressesError } = await supabase
                        .from('addresses')
                        .select('*')
                        .eq('user_id', user.id);
                    
                    if (addressesError) throw addressesError;
                    setAddresses(addressesData || []);

                } catch (error: any) {
                    addNotification(`Error fetching profile: ${error.message}`, 'error');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, addNotification]);

    const handleSaveProfile = async (updatedProfile: ProfileData) => {
        if (user) {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ full_name: updatedProfile.fullName, phone: updatedProfile.phone })
                    .eq('id', user.id);
                
                if (error) throw error;
                
                setProfile(updatedProfile);
                addNotification('Profile updated successfully!', 'success');
                setIsEditProfileModalOpen(false);
            } catch (error: any) {
                addNotification(`Failed to update profile: ${error.message}`, 'error');
            }
        }
    };
    
    const handleSaveAddress = async (address: Omit<Address, 'id'> & { id?: string }) => {
        if (user) {
            try {
                const { id, ...addressData } = address;
                if (id) { // Editing existing address
                    const { data, error } = await supabase
                        .from('addresses')
                        .update(addressData)
                        .eq('id', id)
                        .select();
                    if (error) throw error;
                    setAddresses(addresses.map(a => a.id === id ? data[0] : a));
                } else { // Adding new address
                    const { data, error } = await supabase
                        .from('addresses')
                        .insert([{ ...addressData, user_id: user.id }])
                        .select();
                    if (error) throw error;
                    setAddresses([...addresses, data[0]]);
                }
                addNotification(id ? 'Address updated!' : 'Address added!', 'success');
                setIsAddressModalOpen(false);
                setEditingAddress(null);
            } catch (error: any) {
                addNotification(`Failed to save address: ${error.message}`, 'error');
            }
        }
    };
    
    const handleDeleteAddress = async (addressId: string) => {
        if (user && window.confirm('Are you sure you want to delete this address?')) {
            try {
                const { error } = await supabase
                    .from('addresses')
                    .delete()
                    .eq('id', addressId);

                if (error) throw error;
                
                setAddresses(addresses.filter(a => a.id !== addressId));
                addNotification('Address removed.', 'success');
            } catch (error: any) {
                addNotification(`Failed to remove address: ${error.message}`, 'error');
            }
        }
    };

    const handleOpenAddressModal = (address: Address | null = null) => {
        setEditingAddress(address);
        setIsAddressModalOpen(true);
    };

    if (loading) {
         return (
            <div className="bg-gray-100 min-h-[calc(100vh-80px)] p-8 flex justify-center items-center">
                <p className="text-xl text-gray-600 animate-pulse">Loading profile...</p>
            </div>
        );
    }
    
    if (!session) {
        return (
            <div className="bg-gray-100 min-h-[calc(100vh-80px)] p-8 flex justify-center items-center">
                <p className="text-xl text-gray-600">You need to be logged in to view this page.</p>
            </div>
        );
    }
    
    return (
        <>
            <div className="bg-gray-100 min-h-[calc(100vh-80px)] py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Left Column: Personal Info */}
                        <div className="lg:col-span-1">
                             <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mx-auto">
                                    <UserIcon className="w-12 h-12" />
                                </div>
                                <h1 className="text-2xl font-bold text-dark mt-4">{profile.fullName}</h1>
                                <p className="text-gray-500">{user?.email}</p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="mt-6 w-full bg-accent text-white font-bold py-3 px-6 rounded-2xl hover:bg-blue-700 transition-all duration-300"
                                >
                                    My Dashboard
                                </button>
                             </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Personal Information Card */}
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex justify-between items-center mb-4 border-b pb-4">
                                    <h2 className="text-xl font-bold text-dark">Personal Information</h2>
                                    <button onClick={() => setIsEditProfileModalOpen(true)} className="flex items-center text-sm font-medium text-accent hover:text-blue-700">
                                        <EditIcon className="w-4 h-4 mr-1"/>
                                        Edit
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                        <p className="text-dark font-semibold">{profile.fullName || 'Not set'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Email Address</label>
                                        <p className="text-dark font-semibold">{user?.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                                        <p className="text-dark font-semibold">{profile.phone || 'Not set'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address Management Card */}
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <div className="flex justify-between items-center mb-4 border-b pb-4">
                                    <h2 className="text-xl font-bold text-dark">Manage Addresses</h2>
                                    <button onClick={() => handleOpenAddressModal()} className="flex items-center text-sm font-medium text-white bg-accent hover:bg-blue-700 px-3 py-1 rounded-lg">
                                        <PlusIcon className="w-4 h-4 mr-1"/>
                                        Add Address
                                    </button>
                                </div>
                                {addresses.length > 0 ? (
                                    <div className="space-y-4">
                                        {addresses.map(address => (
                                            <div key={address.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
                                                <div className="flex">
                                                    <MapPinIcon className="w-6 h-6 text-gray-400 mr-4 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-dark">{address.building}, {address.street}</p>
                                                        <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.zip_code}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                                                    <button onClick={() => handleOpenAddressModal(address)} className="text-gray-500 hover:text-accent">
                                                        <EditIcon className="w-5 h-5"/>
                                                    </button>
                                                    <button onClick={() => handleDeleteAddress(address.id)} className="text-gray-500 hover:text-red-600">
                                                        <TrashIcon className="w-5 h-5"/>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-4">You haven't added any addresses yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditProfileModalOpen}
                onClose={() => setIsEditProfileModalOpen(false)}
                onSave={handleSaveProfile}
                currentProfile={profile}
            />

            <AddressModal
                isOpen={isAddressModalOpen}
                onClose={() => { setIsAddressModalOpen(false); setEditingAddress(null); }}
                onSave={handleSaveAddress}
                addressToEdit={editingAddress}
            />
        </>
    );
};

export default ProfilePage;