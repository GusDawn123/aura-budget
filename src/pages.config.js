import Overview from './pages/Overview';
import MoneyIn from './pages/MoneyIn';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Overview": Overview,
    "MoneyIn": MoneyIn,
}

export const pagesConfig = {
    mainPage: "Overview",
    Pages: PAGES,
    Layout: __Layout,
};