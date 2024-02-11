import react from 'react';
import { BeatLoader } from 'react-spinners';
import styles from '../styles/spinner.module.css';
const Spinner = () => {
    return (
        <div className={styles.spinner}>
            <BeatLoader color={'#123abc'} speedMultiplier={1}/>
        </div>
    );
}
export default Spinner;