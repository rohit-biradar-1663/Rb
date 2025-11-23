import React, { useState, useEffect } from 'react';
import { Address } from '../../pages/user/ProfilePage';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Omit<Address, 'id'> & { id?: string }) => void;
  addressToEdit: Address | null;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSave, addressToEdit }) => {
  
  const initialFormState = {
    building: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (addressToEdit) {
      // Fix: Map the snake_case `zip_code` from the Address type to the camelCase `zipCode` used in the form state.
      setFormData({
        building: addressToEdit.building,
        street: addressToEdit.street,
        city: addressToEdit.city,
        state: addressToEdit.state,
        zipCode: addressToEdit.zip_code,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [addressToEdit, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fix: Map the camelCase `zipCode` from the form state back to the snake_case `zip_code` expected by the onSave handler.
    const { zipCode, ...rest } = formData;
    const dataToSave: Omit<Address, 'id' | 'zip_code'> & { id?: string, zip_code: string } = {
      ...rest,
      zip_code: zipCode,
    };

    if (addressToEdit) {
      dataToSave.id = addressToEdit.id;
    }
    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-dark mb-6">{addressToEdit ? 'Edit Address' : 'Add New Address'}</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div className="sm:col-span-2">
            <label htmlFor="building" className="block text-sm font-medium text-gray-700">Building / Floor</label>
            <input type="text" name="building" id="building" value={formData.building} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
            <input type="text" name="street" id="street" value={formData.street} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
            <input type="text" name="city" id="city" value={formData.city} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
            <input type="text" name="state" id="state" value={formData.state} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
          </div>
           <div className="sm:col-span-2">
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
            <input type="text" name="zipCode" id="zipCode" value={formData.zipCode} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" />
          </div>

          <div className="sm:col-span-2 flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-dark font-bold py-2 px-6 rounded-2xl hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-primary text-dark font-bold py-2 px-6 rounded-2xl hover:bg-yellow-500 transition-colors">
              {addressToEdit ? 'Save Address' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;