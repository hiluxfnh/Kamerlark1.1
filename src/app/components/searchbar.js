// components/SearchBar.js
'use client'
// components/SearchBar.js
import { useState } from 'react';
import styles from '../styles/searchbar.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter,faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
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
      <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.iconSearch}/>


      <div className={styles.options_icon} onClick={toggleOptions}>


      <FontAwesomeIcon icon={faFilter} />
      </div>
      {showOptions && (
        <div className={styles.options_panel}>
          <label>
            <input type="checkbox" /> Furnished
          </label>
          <label>
            <input type="checkbox" /> Near Universities
          </label>
          <input type="text" placeholder="Price Range" className={styles.price_input} />
          <button onClick={applyFilters} className={styles.apply_button}>Apply</button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
