// Lokasi: src/components/SearchableSelect.js
import { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';

const ChevronUpDownIcon = () => ( /* ... SVG Icon tidak berubah ... */ );

export default function SearchableSelect({ label, options, selectedValue, onChange, placeholder, disabled }) {
  const [query, setQuery] = useState('');

  const getDisplayValue = () => {
    if (!selectedValue || selectedValue === 'all') return '';
    const selectedItem = options.find(opt => opt.id === selectedValue);
    return selectedItem ? selectedItem.name : '';
  };

  const filteredOptions =
    query === ''
      ? options
      : options.filter((opt) => opt.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <Combobox value={selectedValue} onChange={onChange} disabled={disabled}>
        <Combobox.Label className="block text-sm font-medium text-gray-700">{label}</Combobox.Label>
        <div className="relative mt-1">
          <Combobox.Input
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
            onChange={(event) => setQuery(event.target.value)}
            displayValue={getDisplayValue}
            placeholder={placeholder || "Cari atau pilih..."}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon />
          </Combobox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <Combobox.Option
                value={'all'}
                className={({ active }) => `relative cursor-pointer select-none py-2 px-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900'}`}
              >
                Semua
              </Combobox.Option>
              {filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">Tidak ditemukan.</div>
              ) : (
                filteredOptions.map((opt) => (
                  <Combobox.Option key={opt.id} value={opt.id} className={({ active }) => `relative cursor-pointer select-none py-2 px-4 ${active ? 'bg-blue-600 text-white' : 'text-gray-900'}`}>
                    <span className="block truncate">{opt.name}</span>
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
}