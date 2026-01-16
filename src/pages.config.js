import Overview from './pages/Overview';
import MoneyIn from './pages/MoneyIn';
import MoneyOut from './pages/MoneyOut';
import Bills from './pages/Bills';
import Snapshot from './pages/Snapshot';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Overview": Overview,
    "MoneyIn": MoneyIn,
    "MoneyOut": MoneyOut,
    "Bills": Bills,
    "Snapshot": Snapshot,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Overview",
    Pages: PAGES,
    Layout: __Layout,
};