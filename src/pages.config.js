import Overview from './pages/Overview';
import Upcoming from './pages/Upcoming';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Overview": Overview,
    "Upcoming": Upcoming,
}

export const pagesConfig = {
    mainPage: "Overview",
    Pages: PAGES,
    Layout: __Layout,
};