// Lokasi: src/components/MultiSelectDropdown.js
'use client';
import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// Ikon Checkmark
const CheckIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

// Ikon Chevron
const ChevronUpDownIcon = () => (
  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zM10 17a.75.75 0 01-.55-.24l-3.25-3.5a.75.75 0 011.1-1.02L10 15.148l2.7-2.91a.75.75 0 011.1 1.02l-3.25 3.5A.75.75 0 0110 17z" clipRule="evenodd" />
  </svg>
);

// --- 1. Terima prop 'disabled' ---
export default function MultiSelectDropdown({ label, options, selectedValues, onChange, placeholder, disabled = false }) {
  
  const getDisplayValue = () => {
    if (selectedValues.length === 0) return placeholder || `Pilih ${label}...`;
    if (selectedValues.length <= 2) return selectedValues.join(', ');
    return `${selectedValues.length} item dipilih`;
  };

  return (
    <div>
      {/* --- 2. Berikan 'disabled' ke Listbox --- */}
      <Listbox value={selectedValues} onChange={onChange} multiple disabled={disabled}>
        <Listbox.Label className="block text-sm font-medium text-gray-700">{label}</Listbox.Label>
        <div className="relative mt-1">
          <Listbox.Button 
            // --- 3. Tambahkan style untuk 'disabled' ---
            className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm
                       disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <span className="block truncate">{getDisplayValue()}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><ChevronUpDownIcon /></span>
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option, index) => (
                <Listbox.Option 
                  key={index} 
                  value={option} 
                  className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}`}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option}</span>
                      {selected ? <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600"><CheckIcon /></span> : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}