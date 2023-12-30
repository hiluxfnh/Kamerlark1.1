// components/SearchBar.js
'use client'
import React, { useState } from 'react';
import styles from '../styles/searchbar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

const SearchBar = () => {
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const applyFilters = () => {
    // Implement your filter logic here
    console.log('Applying filters...');
  };

  return (
    <div className={styles.search_container}>

      <input type="text" placeholder="Search for accommodation..." className={styles.search_input} />
      <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.iconSearch} />

      <div className={styles.options_icon} onClick={toggleOptions}>
        <FontAwesomeIcon icon={faFilter} />
      </div>
      <div className={`${styles.options_panel} ${showOptions ? styles.show : ''}`}>
        <label>
          <input type="checkbox" /> Furnished
        </label>
        <label>
          <input type="checkbox" /> Near Universities
        </label>
        <label>
          <input type="checkbox" /> Pet Friendly
        </label>
        <label>
          <input type="checkbox" /> Parking Available
        </label>
        <select className={styles.dropdown}>
          <option value="">Property Type</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="condo">Condo</option>
        </select>
        <input type="range" min="0" max="10000" step="100" className={styles.price_range_input} />
        <input type="number" placeholder="Number of Bedrooms" className={styles.bedroom_input} />
        <input type="text" placeholder="Amenities" className={styles.amenities_input} />
        <input type="date" className={styles.date_input} />
        <button onClick={applyFilters} className={styles.apply_button}>Apply</button>
      </div>


    </div>
  );
};

export default SearchBar;
