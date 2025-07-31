import React from 'react';
import { venues } from '../constants/constants';

const VenueSelector = ({ selectedVenue, onVenueChange, connectionStatus }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
      <select 
        value={selectedVenue} 
        onChange={(e) => onVenueChange(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-32"
      >
        {venues.map(venue => (
          <option key={venue.id} value={venue.id}>
            {venue.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VenueSelector;