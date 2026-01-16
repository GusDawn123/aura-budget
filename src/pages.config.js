import Overview from './pages/Overview';
import MoneyIn from './pages/MoneyIn';
import MoneyOut from './pages/MoneyOut';
import Bills from './pages/Bills';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Overview": Overview,
    "MoneyIn": MoneyIn,
    "MoneyOut": MoneyOut,
    "Bills": Bills,
}

export const pagesConfig = {
    mainPage: "Overview",
    Pages: PAGES,
    Layout: __Layout,
};