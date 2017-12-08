# myMovieDB

# a. INSTALLATION

Prereqs: Ensure node.js is installed and the MySQL service is running. Npm should be included with node.
https://nodejs.org/en/
1. Download and extract the zip
2. In a terminal window, cd into the myMovieDB folder, and run ‘npm install’. This will install the required dependencies for the project into the node_modules folder.
3. Open and run the database.sql file using mySQLWorkbench
4. Open the file myMovieDB/models/db.js in any text/javascript editor and substitute the appropriate “user” and “password” credentials for MySQL for your system.
5. In the myMovieDB directory, run ‘npm start’ in the terminal
- In the terminal, if it says "Error connecting database" ensure that the MySQL service is running and the login credentials from step 4 are correct.
6. In any web browser navigate to localhost:3000

The following main dependencies will be installed into the node_modules folder through the process above:
Node.js (8.9.x)
Express.js (4.16.x)
Jade (1.11.0)
Password-Hash (1.2.2)

# b. FUNCTIONALITIES

## 1. Register
- Navigate to localhost:3000
- In the upper right corner there should be a green button that says ‘Register’. Click it.
- This will take you to the registration page. Type a username and password and hit the blue button ‘submit’. This calls the stored procedure ‘register’.
- Errors: if the username is taken, you will be prompted to retry with a new username. If no username or password is provided, it will tell you to put one.
- You should be returned to the home page. Your account is now registered and you can log in with the chosen credentials.

## 2. Login
- After registering you should be brought to the home page. If you wish to log in you should type your username and password into the text fields at the top of the screen. Then hit ‘Login’.
- Your username should now be displayed where the login text fields previously were.
- The ‘Register’ button should be replaced with a ‘Logout’ button.
- You may click your username to navigate to a profile page.
- If your login fails/username + password combination doesn’t work, you should see the appropriate prompt message.

## 3. Search
- If you want to see all the actors/roles/movies click the search text box at the top of the screen and press ‘enter’ on your keyboard.
- Navigate to any page.
- Type the name or part of a name of any actor/role/movie you are looking for into the search bar. You should see all results matching your query for actors/roles/movies displayed below. You may click on them to navigate to their details page. If the entered string doesn’t match anything, it will say “No results found”
- An example query ‘Star Wars’ should show you ’Star Wars: The Force Awakens’ in the movies section. ‘Mark Hamill’ should return ‘Mark Hamill’ in the actors section. ‘Luke Skywalker’ should return ‘Luke Skywalker, played by Mark Hamill in Star Wars: The Force Awakens” in the Roles section. You may also search by other attributes of a movie including genre, director, and year of release.
- You may also sort how your results are returned. You can do this alphabetically, by rating, by popularity, or by release year. Additionally you can return these results in ascending or descending order. To do this use the menus on the right of the search bar. By default it is sorted alphabetically and ascending.
- Searching calls the stored procedure ‘search’

## 4. Details Page
- Movies and actors each have details pages.
- Navigate to the homepage.
- Click in the search bar and press ‘enter’ on your keyboard
- Select any movie. You should see the details page. The details page contains the following:
	- A green button ‘I’ve seen this!’ (if you click this you should see ‘Views’ below update) this will call a procedure to update the views. (calls check_if_saved and toggle_save_movie stored procedures)
	- A textbox and button ‘Rate’ for you to rate the movie.
	- Title
	- Genre
	- Metascore (Manually entered score in the database from metacritic.com)
	- User Rating (average score from other users. Calls triggers update_rating_insert or update_rating_update) *Default will be 0 if you create a new movie
	- Views
	- Director
	- Summary - a brief description of the movie.
	- Roles (includes the name of the role and the actor playing it e.g. Luke Skywalker - Mark Hamill)
	- Year Released
	- YouTube trailer for the movie
	- Text field for leaving a review. (you will only see the text field and submit button if you are logged in)
	- List of reviews from other users.
- Now click one of the actors in that movie (e.g. Mark Hamill), and you will see a similar details page specific to that actor’s details. This does not include functionality for saving, rating, or reviewing, since those are only possible for movies.
- Errors: if you were to manually enter a non-existent actor id in the URL, you will be sent to a 404 page.

## 5. Rate a movie
- Log in as shown in step 2.
- Navigate to a movies detail page step 4 above.
- Select a value in the ‘How would you rate this movie?’ number box (this value is constrained to be from 0-100)
- Click ‘Rate’ You should see the user rating update to the new average rating. (calls triggers update_rating_insert and update_rating_edit, and procedures update_rating and rate)

## 6. Reviews
- Log in as shown in step 2.
- Navigate to movie details page from 4 above.
- Scroll to the bottom of the page
- Type something into the review text field.
- Click the green ‘review’ button. (calls stored procedure user_review_movie)
- The page should reload and you should see ‘<your-username> wrote: <text from your review>’ below.

## 7. Homepage - Top Movies
- Navigate to the home page.
- Enter desired filters in the text boxes.
- Click find.
- You should see links to the most viewed movies within the provided date range. (calls get_popular_movies stored procedure)
- e.g. If you put in number of movies(2) start date(<date for yesterday>) end date(<date for today>) and 2 users have viewed “This Is The End” and one user has viewed “Star Wars”, you should see This Is The End displayed above Star Wars.
- if no movies have been viewed it should display ‘No top movies to display’. If the end date is set to a date before the start date, no error will be displayed but no results will be returned either.

## 8. Profile Page
- Log in
- Where the login was before you should see your username. Click it.
- This should take you to your profile page. On your profile page you should see a list of links to all of the movies that you have marked as ’seen’, if you have any. If you’ve clicked the “I’ve seen this” button on the movie “Batman Begins”, it would appear in that list.

From this point on, all pages must be accessed from an admin account. You will be greeted by an error page if you are on a regular user account and manually go to the URLs of any admin page.

## 9. Admin - Add Movie
- Log in as an admin. Use the username/password ‘admin’.
- On the homepage you should see a yellow button that says ‘Add Movie’. Click it
- You should see fields for title, director, year, genre, summary, and trailer. Under those is a section to add roles, where you can enter the role name and an actor’s ID. If you want to add more roles, you can click “Add another role” until satisfied. At the bottom is a green ‘Insert’ button.
- Fill these in appropriately(year is constrained to be between 1900 and 3000).
- For the trailer, you should include the part of the youtube link after ‘v=‘ for example the Infinity war trailer (https://www.youtube.com/watch?v=6ZfuNTqbHE8) you only want to include ‘6ZfuNTqbHE8’.
- Click ‘Insert’. This will call the stored procedures add_movie and add_role.
- Errors: If you leave required fields blank, you will be prompted to enter values. If an actor id is entered that does not exist, then you will be sent to an error page outlining what went wrong. All the movie info and roles supplied up to the incorrect one will be inserted, however every role after it will not be.
- You should be brought to the newly created movie Details page.

## 10. Admin - Add Actor
- Log in as an admin. Use the username/password ‘admin’.
- On the homepage you should see a yellow button that says ‘Add Actor’. Click it
- You should see fields for name, date of birth, biography, height, and birthplace, followed by a green ‘Insert’ button.
- Fill out the fields appropriately, and click ‘Insert’ If you leave required fields blank, you will be prompted to enter values. This calls the stored procedure add_actor.
- You should be brought to the newly added actor’s details page.

## 11. Admin - Edit Movie
- Log in as an admin. Use the username/password ‘admin’.
- Navigate to a movie’s details page via the search.
- At the top of the page, you should see a yellow button labeled ‘Edit Movie’. Click it.
- You should see fields for title, director, year, genre, summary, trailer, and roles, as well as a green ‘Update’ button and red ‘Delete’. All the fields should already be populated with the given movie’s info. (this calls the procedure movie_info)
- Fill these in appropriately.
- For the trailer, you should include the part of the youtube link after ‘v=‘ for example the Infinity war trailer (https://www.youtube.com/watch?v=6ZfuNTqbHE8) you only want to include ‘6ZfuNTqbHE8’.
- To add more roles, press the “Add another role” button. To remove a role, press the “Remove role” button.
- Click ‘Update’. (calls stored procedures edit_movie and add_role)
- Errors: If you leave required fields blank, you will be prompted to enter values. If an actor id is entered that does not exist, then you will be sent to an error page outlining what went wrong. All the movie info and roles supplied up to the incorrect one will be inserted, however every role after it will not be.
- You should see the updates you made reflected on that movie’s page.

## 12. Admin - Edit Actor
- Log in as an admin. Use the username/password ‘admin’.
- Navigate to an actor’s details page via the search.
- At the top of the page, you should see a yellow button labeled ‘Edit Actor’. Click it.
- You should see fields for name, date of birth, biography, height, summary, and birthplace, as well as a green ‘Update’ button and red ‘Delete’ button. All the fields should already be populated with the given actor’s info. (this calls the procedure actor_info)
- Modify the values appropriately
- Click ‘Update’. (calls stored procedure edit_actor)
- Errors: If you leave required fields blank, you will be prompted to enter values.
- You should see the updates you made reflected on that actor’s page.

## 13. Admin - Delete Movie
- Log in as an admin. Use the username/password ‘admin’.
- Navigate to a movie’s “edit” page, shown in step 11.
- Click the red “Delete” button, and you will be redirected to the homepage.
- Search for that movie and it should no longer exist (along with all roles associated with it).

## 14. Admin - Delete Actor
- Log in as an admin. Use the username/password ‘admin’.
- Navigate to an actor’s “edit” page, shown in step 12.
- Click the red “Delete” button, and you will be redirected to the homepage.
- Search for that actor and it should no longer exist (along with all roles associated with it).
