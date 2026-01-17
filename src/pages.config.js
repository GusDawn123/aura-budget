import Overview from './pages/Overview';
import Upcoming from './pages/Upcoming';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Overview": Overview,
    "Upcoming": Upcoming,
    "Expenses": Expenses,
    "Income": Income,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Overview",
    Pages: PAGES,
    Layout: __Layout,
};