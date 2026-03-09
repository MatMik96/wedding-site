# GEMINI.md

This file provides an overview of the wedding website project for Rasmine and Mathias.

## Project Overview

This is a static website for the wedding of Rasmine and Mathias. The site is designed to provide guests with information about the wedding, including the schedule for the weekend, details about the couple, practical information, and an RSVP form. The website is in Danish.

## Technologies Used

*   **HTML5**
*   **CSS3**: For styling, including custom animations and Google Fonts ("Playfair Display" and "Great Vibes").
*   **JavaScript**: For dynamic features and interactivity.

## Project Structure

The project is organized into the following directories:

*   `/`: The root directory contains the main `index.html` file.
*   `components/`: Contains reusable HTML components like the header and footer.
*   `css/`: Contains stylesheets for the website.
*   `images/`: Contains images used on the website.
*   `js/`: Contains JavaScript files for interactivity.
*   `pages/`: Contains the different pages of the website, such as "About Us" and "The Wedding Weekend".
*   `partials/`: Contains reusable HTML sections that are included in the pages.

HTML partials are loaded dynamically using a custom JavaScript function in `js/transitions.js`.

## How to Run the Project

To view the website locally, you can run a simple HTTP server. For example, using Python:

```bash
python -m http.server 8000
```

or for Python 3:

```bash
python3 -m http.server 8000
```

Then, open a web browser and navigate to `http://localhost:8000`.

## Key Features

*   **Dynamic Content Loading**: The website uses a custom JavaScript function to dynamically load HTML partials, making the site modular and easier to maintain.
*   **Countdown**: A countdown to the wedding date is displayed on the homepage.
*   **Image Gallery**: An image gallery with a lightbox is included.
*   **Animations**: The site features several animations, including falling flower petals and paw prints that appear on the screen.
*   **Page Transitions**: Smooth fade transitions are used when navigating between pages.

## To-Do

The following items are on the to-do list for this project:

*   Move the map to a separate page and add information about the venue, Sebber Kloster.
*   Add "easter eggs" to the website for guests to discover.
*   Fill in the placeholder content on the various pages.
