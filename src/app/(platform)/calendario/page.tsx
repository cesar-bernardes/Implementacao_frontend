import styles from '../platform.module.css';
import { CalendarBoard } from './calendar-board';

export default function CalendarPage() {
  return <main className={`${styles.main} ${styles.calendarPage}`}><CalendarBoard /></main>;
}
