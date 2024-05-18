"use client";

import { useState } from 'react';
import { 
    UserIcon, 
    HomeIcon, 
    DocumentTextIcon, 
    BellIcon, 
    CogIcon, 
    InformationCircleIcon, 
    CalendarIcon, 
    TrashIcon, 
    EyeIcon, 
    CheckCircleIcon, 
    ExclamationCircleIcon 
} from '@heroicons/react/solid';
import Header from '../components/Header';
import Modal from '../components/Modal';

export default function UserProfile() {
    const [tab, setTab] = useState('account');

    const renderTabContent = () => {
        switch (tab) {
            case 'account':
                return <AccountManagement />;
            case 'properties':
                return <RentedProperties />;
            case 'contracts':
                return <Contracts />;
            case 'notifications':
                return <Notifications />;
            case 'settings':
                return <Settings />;
            default:
                return <AccountManagement />;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Header />
            <header className="bg-white shadow">
                <div className="container mx-auto flex justify-between items-center h-[60px] px-4 sm:px-6">
                    <h1 className="text-2xl font-bold">Profile</h1>
                </div>
            </header>
            <div className="flex flex-1">
                <nav className="w-[250px] bg-white border-r">
                    <ul className="flex flex-col">
                        <li className={`p-4 cursor-pointer ${tab === 'account' ? 'bg-gray-200' : ''}`} onClick={() => setTab('account')}>
                            <UserIcon className="w-6 h-6 inline-block mr-2" /> Account Management
                        </li>
                        <li className={`p-4 cursor-pointer ${tab === 'properties' ? 'bg-gray-200' : ''}`} onClick={() => setTab('properties')}>
                            <HomeIcon className="w-6 h-6 inline-block mr-2" /> Rented Properties
                        </li>
                        <li className={`p-4 cursor-pointer ${tab === 'contracts' ? 'bg-gray-200' : ''}`} onClick={() => setTab('contracts')}>
                            <DocumentTextIcon className="w-6 h-6 inline-block mr-2" /> Contracts
                        </li>
                        <li className={`p-4 cursor-pointer ${tab === 'notifications' ? 'bg-gray-200' : ''}`} onClick={() => setTab('notifications')}>
                            <BellIcon className="w-6 h-6 inline-block mr-2" /> Notifications
                        </li>
                        <li className={`p-4 cursor-pointer ${tab === 'settings' ? 'bg-gray-200' : ''}`} onClick={() => setTab('settings')}>
                            <CogIcon className="w-6 h-6 inline-block mr-2" /> Settings
                        </li>
                    </ul>
                </nav>
                <main className="flex-1 p-6 bg-white">
                    {renderTabContent()}
                </main>
            </div>
        </div>
    );
}

function AccountManagement() {
    const [personalInfo, setPersonalInfo] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: '123-456-7890',
        address: '123 Main St, Anytown, USA',
    });

    const [password, setPassword] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handlePersonalInfoChange = (e) => {
        const { name, value } = e.target;
        setPersonalInfo({
            ...personalInfo,
            [name]: value,
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPassword({
            ...password,
            [name]: value,
        });
    };

    const handlePersonalInfoSubmit = (e) => {
        e.preventDefault();
        // Add code to handle personal information update
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        // Add code to handle password change
    };

    const handleAccountDeletion = () => {
        // Add code to handle account deletion
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Account Management</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about your account.</p>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Full name</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{personalInfo.firstName} {personalInfo.lastName}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Email address</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{personalInfo.email}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{personalInfo.phoneNumber}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Address</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{personalInfo.address}</dd>
                        </div>
                    </dl>
                </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Update Personal Information</h3>
            <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={personalInfo.firstName}
                        onChange={handlePersonalInfoChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={personalInfo.lastName}
                        onChange={handlePersonalInfoChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={personalInfo.email}
                        onChange={handlePersonalInfoChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={personalInfo.phoneNumber}
                        onChange={handlePersonalInfoChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={personalInfo.address}
                        onChange={handlePersonalInfoChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Save Changes
                </button>
            </form>

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Change Password</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={password.currentPassword}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={password.newPassword}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={password.confirmPassword}
                            onChange={handlePasswordChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Change Password
                    </button>
                </form>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
                <p className="text-sm text-gray-600">Warning: This action cannot be undone.</p>
                <button
                    onClick={handleAccountDeletion}
                    className="mt-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
}

function RentedProperties() {
    const [properties, setProperties] = useState([
        {
            id: 1,
            name: 'Sunny Apartment',
            address: '123 Sunshine Blvd, Apt 4B, Sunnyville',
            rentDue: '2024-06-01',
            status: 'Active',
        },
        {
            id: 2,
            name: 'Cozy Cottage',
            address: '456 Cozy Ln, Cottage Town',
            rentDue: '2024-06-05',
            status: 'Active',
        },
        {
            id: 3,
            name: 'Modern Loft',
            address: '789 Modern St, Loft City',
            rentDue: '2024-06-10',
            status: 'Active',
        },
    ]);

    const handlePropertyDelete = (propertyId) => {
        setProperties(properties.filter((property) => property.id !== propertyId));
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Rented Properties</h2>
            <p>Here you can view and manage your rented properties.</p>
            <div className="grid gap-4 mt-6">
                {properties.map((property) => (
                    <div key={property.id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{property.name}</h3>
                                <p className="text-sm text-gray-600">{property.address}</p>
                                <div className="flex items-center text-sm text-gray-500 mt-2">
                                    <CalendarIcon className="w-4 h-4 mr-1" />
                                    Rent Due: {new Date(property.rentDue).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <InformationCircleIcon className="w-4 h-4 mr-1" />
                                    Status: {property.status}
                                </div>
                            </div>
                            <button
                                onClick={() => handlePropertyDelete(property.id)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full flex items-center"
                            >
                                <TrashIcon className="w-5 h-5 mr-2" />
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Contracts() {
    const [contracts, setContracts] = useState([
        {
            id: 1,
            title: 'Rental Agreement - Sunny Apartment',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            status: 'Active',
            image: '/path/to/contract1.jpg', // Add the path to the image or PDF
        },
        {
            id: 2,
            title: 'Lease Agreement - Cozy Cottage',
            startDate: '2023-06-01',
            endDate: '2024-05-31',
            status: 'Expired',
            image: '/path/to/contract2.jpg', // Add the path to the image or PDF
        },
        {
            id: 3,
            title: 'Rental Agreement - Modern Loft',
            startDate: '2024-02-01',
            endDate: '2025-01-31',
            status: 'Pending',
            image: '/path/to/contract3.jpg', // Add the path to the image or PDF
        },
    ]);

    const [selectedContract, setSelectedContract] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (contract) => {
        setSelectedContract(contract);
        setIsModalOpen(true);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Contracts</h2>
            <p>Here you can view your contracts.</p>
            <div className="grid gap-4 mt-6">
                {contracts.map((contract) => (
                    <div key={contract.id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{contract.title}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-2">
                                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                                    Start Date: {new Date(contract.startDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <DocumentTextIcon className="w-4 h-4 mr-1" />
                                    End Date: {new Date(contract.endDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <StatusIcon status={contract.status} className="w-4 h-4 mr-1" />
                                    Status: {contract.status}
                                </div>
                            </div>
                            <button
                                onClick={() => handleViewDetails(contract)}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex items-center"
                            >
                                <EyeIcon className="w-5 h-5 mr-2" />
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {selectedContract && (
                <Modal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    contract={selectedContract} 
                />
            )}
        </div>
    );
}

function StatusIcon({ status, className }) {
    switch (status) {
        case 'Active':
            return <CheckCircleIcon className={`text-green-500 ${className}`} />;
        case 'Expired':
            return <ExclamationCircleIcon className={`text-red-500 ${className}`} />;
        case 'Pending':
            return <ExclamationCircleIcon className={`text-yellow-500 ${className}`} />;
        default:
            return null;
    }
}

function Notifications() {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Notifications</h2>
            <p>Here you can view your notifications.</p>
            {/* Add more detailed notifications features here */}
        </div>
    );
}

function Settings() {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <p>Here you can adjust your settings.</p>
            {/* Add more detailed settings features here */}
        </div>
    );
}
