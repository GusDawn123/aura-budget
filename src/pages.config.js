import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Overview from './pages/Overview';
import Settings from './pages/Settings';
import Upcoming from './pages/Upcoming';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Expenses": Expenses,
    "Income": Income,
    "Overview": Overview,
    "Settings": Settings,
    "Upcoming": Upcoming,
}

export const pagesConfig = {
    mainPage: "Overview",
    Pages: PAGES,
    Layout: __Layout,
};