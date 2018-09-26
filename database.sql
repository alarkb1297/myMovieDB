DROP DATABASE IF EXISTS movieDB;

CREATE DATABASE movieDB;

USE movieDB;

CREATE TABLE director (
director_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
director_name VARCHAR(60) NOT NULL,
dob DATE NOT NULL,
biography VARCHAR(500),
birthplace VARCHAR(100)
) ENGINE = innoDB;

CREATE TABLE movies (
movie_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
title VARCHAR(60) NOT NULL,
director_id INT NOT NULL,
release_year YEAR NOT NULL,
metascore INT NOT NULL DEFAULT 0,
user_rating INT NOT NULL DEFAULT 0,
view_count INT NOT NULL DEFAULT 0,
genre VARCHAR(60) NOT NULL,
summary VARCHAR(2000),
trailer VARCHAR(200),
FOREIGN KEY (director_id) REFERENCES director (director_id),
CONSTRAINT check_metascore CHECK (metascore>=0 AND metascore<= 100),
CONSTRAINT check_user_rating CHECK (user_rating>=0 AND user_rating<= 100)
) ENGINE = innoDB;

CREATE TABLE ratings (
rating_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
movie_id INT NOT NULL,
rating_source VARCHAR(60) NOT NULL,
rating INT NOT NULL,
FOREIGN KEY (movie_id) REFERENCES movies (movie_id)  ON DELETE CASCADE,
CONSTRAINT rating CHECK (rating>=0 AND rating<= 100)
) ENGINE = innoDB;

CREATE TABLE actor (
actor_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
actor_name VARCHAR(60) NOT NULL,
dob DATE NOT NULL,
biography VARCHAR(500),
height_in_inches INT,
birthplace VARCHAR(100)
) ENGINE = innoDB;

CREATE TABLE roles (
role_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
role_name VARCHAR(60) NOT NULL,
actor_id INT NOT NULL,
movie_id INT NOT NULL,
FOREIGN KEY (movie_id) REFERENCES movies (movie_id) ON DELETE CASCADE,
FOREIGN KEY (actor_id) REFERENCES actor (actor_id) ON DELETE CASCADE
) engine = innoDB;

CREATE TABLE movie_user (
username VARCHAR(60) NOT NULL UNIQUE PRIMARY KEY,
user_password VARCHAR(60) NOT NULL,
is_admin INT NOT NULL DEFAULT 0
) ENGINE = innoDB;

CREATE TABLE saved_movies (
username VARCHAR(60) NOT NULL, 
movie_id INT NOT NULL,
save_time DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(username) REFERENCES movie_user (username),
FOREIGN KEY(movie_id) REFERENCES movies (movie_id) ON DELETE CASCADE
) ENGINE = innoDB;

CREATE TABLE reviews (
review_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
movie_id INT NOT NULL,
username VARCHAR(60) NOT NULL,
review_text VARCHAR(2000) NOT NULL,
FOREIGN KEY(username) REFERENCES movie_user (username),
FOREIGN KEY(movie_id) REFERENCES movies (movie_id) ON DELETE CASCADE
) ENGINE = innoDB;




DROP PROCEDURE IF EXISTS register;
DELIMITER $$
CREATE PROCEDURE register(uname VARCHAR(60), user_pass VARCHAR(60)) BEGIN
	INSERT INTO movie_user (username, user_password) VALUES (uname, user_pass);
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS search;
DELIMITER $$
CREATE PROCEDURE search(keywords VARCHAR(50), typ INT) BEGIN
	IF typ = 0 THEN 
		SELECT *
		FROM movies m JOIN director d USING (director_id)
		WHERE m.title LIKE CONCAT('%', keywords, '%')
        OR d.director_name LIKE CONCAT('%', keywords, '%')
        OR m.genre LIKE CONCAT('%', keywords, '%')
        OR m.release_year LIKE CONCAT('%', keywords, '%');
	ELSEIF typ = 1 THEN
		SELECT actor_name, actor_id FROM actor
        WHERE actor_name LIKE CONCAT('%', keywords, '%');
	ELSEIF typ = 2 THEN 
		SELECT r.role_name, r.movie_id, m.title, r.actor_id, a.actor_name
        FROM roles r 
        JOIN actor a USING (actor_id)
        JOIN movies m USING (movie_id)
        WHERE role_name LIKE CONCAT('%', keywords, '%');
	END IF;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS movie_info;
DELIMITER $$
CREATE PROCEDURE movie_info(mid INT) BEGIN
	SELECT m.title, m.genre, d.director_name, m.summary, 
    m.metascore, m.user_rating, m.view_count, m.release_year, m.trailer,
    (SELECT GROUP_CONCAT(r.role_name, ':', a.actor_name, '/', a.actor_id)
		FROM roles r JOIN actor a USING (actor_id)
        WHERE r.movie_id = mid
		GROUP BY (movie_id)) AS rolelist
    FROM movies AS m 
    JOIN director AS d USING (director_id)
    WHERE movie_id = mid;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS actor_info;
DELIMITER $$
CREATE PROCEDURE actor_info(aid INT) BEGIN
	SELECT a.actor_name, a.dob, a.biography, a.height_in_inches, a.birthplace, 
    (SELECT GROUP_CONCAT(r.role_name, ':', m.title, '/', m.movie_id)
		FROM roles r JOIN movies m USING (movie_id)
        WHERE r.actor_id = aid
		GROUP BY (actor_id)) AS movielist
    FROM actor AS a
    WHERE actor_id = aid;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS rate;
DELIMITER $$
CREATE PROCEDURE rate(m_id INT, val INT, user VARCHAR(60)) BEGIN
	IF (SELECT COUNT(*) FROM ratings WHERE rating_source = user AND movie_id = m_id) > 0 THEN
		UPDATE ratings SET rating=val WHERE rating_source = user;
	ELSE
		INSERT INTO ratings (movie_id, rating_source, rating) VALUE
        (m_id, user, val);
	END IF;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS update_rating;
DELIMITER $$
CREATE PROCEDURE update_rating(new_id INT) BEGIN
	SET @num_reviews = (SELECT COUNT(rating_id) FROM ratings 
		WHERE ratings.movie_id = new_id);
    
	IF @num_reviews > 0 THEN 
		SET @review_total = (SELECT SUM(rating) FROM ratings 
			WHERE ratings.movie_id = new_id);
        
		SET  @average = @review_total / @num_reviews;
	ELSE 
		SET @average = (SELECT user_rating FROM movies WHERE movies.movie_id = new_id);
	END IF;

	UPDATE movies
		SET user_rating = @average
		WHERE movies.movie_id = new_id;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS update_rating_insert;
DELIMITER $$
CREATE TRIGGER update_rating_insert
AFTER INSERT ON ratings FOR EACH ROW BEGIN 
	CALL update_rating(NEW.movie_id);
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS update_rating_update;
DELIMITER $$
CREATE TRIGGER update_rating_update
AFTER UPDATE ON ratings FOR EACH ROW BEGIN 
	CALL update_rating(NEW.movie_id);
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS toggle_save_movie;
DELIMITER $$
CREATE PROCEDURE toggle_save_movie(user VARCHAR(60), m_id INT) BEGIN
	IF (SELECT check_if_saved(user, m_id)) THEN
		DELETE FROM saved_movies WHERE username = user AND movie_id = m_id;
        UPDATE movies SET view_count=view_count-1 WHERE movie_id = m_id;
	ELSE 
		INSERT INTO saved_movies (username, movie_id) VALUE (user, m_id);
		UPDATE movies SET view_count=view_count+1 WHERE movie_id = m_id;
	END IF;
END$$
DELIMITER ;

DROP FUNCTION IF EXISTS check_if_saved;
DELIMITER $$
CREATE FUNCTION check_if_saved(user VARCHAR(60), m_id INT) 
RETURNS BOOLEAN DETERMINISTIC BEGIN
	IF (SELECT COUNT(movie_id) FROM saved_movies
			JOIN movie_user USING (username)
			WHERE movie_id = m_id
			AND username = user)
		> 0 THEN 
		return true;
	ELSE 
		return false;
	END IF;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS user_review_movie;
DELIMITER $$
CREATE  PROCEDURE user_review_movie(uname VARCHAR(60), body VARCHAR(2000), mov_id INT) BEGIN
	IF (check_if_saved(uname, mov_id)) THEN 
		INSERT INTO reviews (movie_id, user_id, review_text) VALUES (mov_id, uname, body);
	ELSE 
		SIGNAL SQLSTATE 'ERROR' SET
		MESSAGE_TEXT = 'Movie not in users saved movies',
		MYSQL_ERRNO = 1356;
	END IF;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS get_popular_movies;
DELIMITER $$
CREATE PROCEDURE get_popular_movies(num INT, start_date DATE, end_date DATE) BEGIN
    SELECT movie_id, title, view_count 
    FROM movies JOIN saved_movies USING (movie_id)
    WHERE view_count > 0
    AND save_time BETWEEN start_date AND end_date
    GROUP BY movie_id
	ORDER BY view_count DESC
    LIMIT num;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS add_movie;
DELIMITER $$
CREATE PROCEDURE add_movie(
		title VARCHAR(60),
		director_n VARCHAR(60),
		ryear YEAR,
		genre VARCHAR(60),
		summary VARCHAR(2000),
		trailer VARCHAR(200)) BEGIN
	
    DECLARE d_id INT;
    
    IF (SELECT COUNT(*) FROM director WHERE director_name = director_n) > 0 THEN
		SET d_id = (SELECT director_id FROM director WHERE director_name = director_n);
	ELSE
		INSERT INTO director (director_name) VALUE (director_n);
        SET d_id = LAST_INSERT_ID();
	END IF;
    
    INSERT INTO movies (title, director_id, release_year, genre, summary, trailer) VALUE
			(title, d_id, ryear, genre, summary, trailer);
	SELECT LAST_INSERT_ID() AS movie_id;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS edit_movie;
DELIMITER $$
CREATE PROCEDURE edit_movie(
		m_id INT,
		title VARCHAR(60),
		director_n VARCHAR(60),
		ryear YEAR,
		genre VARCHAR(60),
		summary VARCHAR(2000),
		trailer VARCHAR(200)) BEGIN
	
    DECLARE old_director INT DEFAULT (SELECT director_id
    FROM director JOIN movies USING (director_id)
    WHERE movie_id = m_id);
    
    DECLARE d_id INT;
    
    -- see if the old director has any other films
    IF (SELECT COUNT(*) FROM director WHERE director_name = director_n) > 0 THEN
		SET d_id = (SELECT director_id FROM director WHERE director_name = director_n);
	ELSE
		INSERT INTO director (director_name) VALUE (director_n);
        SET d_id = LAST_INSERT_ID();
	END IF;
    
    UPDATE movies SET title=title, director_id=d_id, release_year=ryear, 
		genre=genre, summary=summary, trailer=trailer WHERE movie_id = m_id;
    
    -- If the original director has no films, just delete them.
    IF (SELECT COUNT(*) FROM movies JOIN director USING (director_id)
			WHERE director_id = old_director) = 0 THEN
		DELETE FROM director WHERE director_id = old_director;
	END IF;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS add_actor;
DELIMITER $$
CREATE PROCEDURE add_actor(
		a_name VARCHAR(60),
        dob DATE,
        bio VARCHAR(500),
        height INT,
        birthplace VARCHAR(100)) BEGIN
	INSERT INTO actor (actor_name, dob, biography, height_in_inches, birthplace) VALUE
    (a_name, dob, bio, height, birthplace);

    SELECT LAST_INSERT_ID() AS actor_id;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS edit_actor;
DELIMITER $$
CREATE PROCEDURE edit_actor(
		a_id INT,
		a_name VARCHAR(60),
        dob DATE,
        bio VARCHAR(500),
        height INT,
        birthplace VARCHAR(100)) BEGIN
	UPDATE actor SET actor_name=a_name, dob=dob, biography=bio,
    height_in_inches=height, birthplace=birthplace
    WHERE actor_id = a_id;
END $$
DELIMITER ;


DROP PROCEDURE IF EXISTS add_role;
DELIMITER $$
CREATE PROCEDURE add_role(movie_id INT, actor_id INT, role VARCHAR(60)) BEGIN
	INSERT INTO roles (role_name, actor_id, movie_id) VALUE
	(role, actor_id, movie_id);
END $$
DELIMITER ;




insert into actor (actor_name, dob, biography, height_in_inches, birthplace) VALUES
("Jim Carrey", '1962-01-17', "Makes people laugh", 74, "Newmarket, Ontario"),
("Megan Fox", '1986-06-16', "Pretty girl in action movies", 64, "Rockwood, Tennessee"),
("Christian Bale", '1974-01-30', "Not your average bale of hay", 72, "Haverfordwest, Pembrokeshire"),
("Mark Hamill", '1951-09-25', "Vader, I am your son!", 69, "Oakland, California"),
("Seth Rogan", '1982-04-15', "Has a funny laugh", 71, "Vancouver, British Columbia"),
("James Franco", '1978-04-19', "Had to cut his arm off that one time", 71, "Palo Alto, California"),
("Shia LaBeouf", '1986-06-11', "Actual cannibal", 69, "Los Angeles, California");

insert into director (director_name, dob) VALUES
("Michael Bay", '1965-02-17'),
("J.J. Abrams", '1966-06-27'),
("Christopher Nolan", '1970-07-30'),
("Peter Weir", '1944-08-21'),
("David Gordon Green", '1975-04-09'),
("Evan Goldberg", '1975-04-20');

insert into movies (title, director_id, release_year, metascore, genre, summary, trailer) VALUES
("Transformers", 1, 2007, 61, "action", "Alien robots turn into cars", "zX81c2vycKo"),
("Batman Begins", 3, 2005, 70, "action", "Half-man-half-bat fights crime", "neY2xVmOfUM"),
("Star Wars: The Force Awakens", 2, 2015, 81, "adventure", "They remade the 4th Star Wars", "sGbxmsDFVnE"),
("The Truman Show", 4, 1998, 90, "drama", "Guy lives in a TV show", "loTIzXAS7v4"),
("Pineapple Express", 5, 2008, 64, "comedy", "A lot of illegal stuff goes on", "BWZt4v6b1hI"),
("The Interview", 6, 2014, 52, "comedy", "North Korea gets mad", "DkJA1rb8Nxo"),
("This Is the End", 6, 2013, 67, "comedy", "Party till you drop", "Yma-g4gTwlE");

insert into ratings (movie_id, rating_source, rating) VALUES
(1, "user", 99),
(2, "user", 53),
(3, "user", 76),
(4, "user", 22),
(5, "user", 35),
(6, "user", 91),
(7, "user", 98);

insert into roles (role_name, actor_id, movie_id) VALUES
("Mikaela Banes", 2, 1),
("Sam Witwicky", 7, 1),
("Bruce Wayne and Batman", 3, 2),
("Luke Skywalker", 4, 3),
("Truman Burbank", 1, 4),
("Dale Denton", 5, 5),
("Saul Silver", 6, 5),
("Aaron Rapaport", 5, 6),
("Dave Skylark", 6, 6),
("Seth Rogan", 5, 7),
("James Franco", 6, 7);

insert into movie_user (username, user_password, is_admin) values 
('admin', '0DPiKuNIrrVmD8IUCuw1hQxNqZc=', 1),
('fakeuser1', 'NWoZK3kTsExUV00Ywo1G5jlUKKs=', 0),
('fakeuser2', '2kuSN7rMzfGcB2DKt67EqDWQELA=', 0),
('fakeuser3', 'd95o2uzYI7q7tY7bHI4U1xBug7s=', 0),
('fakeuser4', 'G2RTiSRzpGfQc3LUXrBavCAxZHo=', 0),
('fakeuser5', 'rDR41po8gfpi5g9cNpYWWk5easQ=', 0);

CALL toggle_save_movie('fakeuser5', 7);
CALL toggle_save_movie('fakeuser5', 6);
CALL toggle_save_movie('fakeuser5', 5);
CALL toggle_save_movie('fakeuser4', 4);
CALL toggle_save_movie('fakeuser4', 7);
CALL toggle_save_movie('fakeuser4', 3);
CALL toggle_save_movie('fakeuser3', 7);
CALL toggle_save_movie('fakeuser3', 2);
CALL toggle_save_movie('fakeuser3', 3);
CALL toggle_save_movie('fakeuser3', 6);
CALL toggle_save_movie('fakeuser2', 4);
CALL toggle_save_movie('fakeuser2', 3);
CALL toggle_save_movie('fakeuser2', 1);
CALL toggle_save_movie('fakeuser1', 7);
CALL toggle_save_movie('fakeuser1', 2);
CALL toggle_save_movie('fakeuser1', 1);

UPDATE saved_movies SET save_time='2017-12-07 14:29:49' WHERE username='fakeuser5' AND movie_id=7;
UPDATE saved_movies SET save_time='2017-12-08 14:29:50' WHERE username='fakeuser5' AND movie_id=6;
UPDATE saved_movies SET save_time='2017-12-06 14:29:50' WHERE username='fakeuser5' AND movie_id=5;
UPDATE saved_movies SET save_time='2017-11-25 14:30:45' WHERE username='fakeuser4' AND movie_id=4;
UPDATE saved_movies SET save_time='2017-12-04 14:30:49' WHERE username='fakeuser4' AND movie_id=7;
UPDATE saved_movies SET save_time='2017-10-08 14:30:50' WHERE username='fakeuser4' AND movie_id=3;
UPDATE saved_movies SET save_time='2017-11-29 14:33:12' WHERE username='fakeuser3' AND movie_id=7;
UPDATE saved_movies SET save_time='2017-12-08 14:33:13' WHERE username='fakeuser3' AND movie_id=2;
UPDATE saved_movies SET save_time='2017-12-02 14:33:14' WHERE username='fakeuser3' AND movie_id=3;
UPDATE saved_movies SET save_time='2017-10-30 14:33:15' WHERE username='fakeuser3' AND movie_id=6;
UPDATE saved_movies SET save_time='2017-12-07 14:33:42' WHERE username='fakeuser2' AND movie_id=4;
UPDATE saved_movies SET save_time='2017-12-06 14:33:43' WHERE username='fakeuser2' AND movie_id=3;
UPDATE saved_movies SET save_time='2017-12-01 14:33:44' WHERE username='fakeuser2' AND movie_id=1;
UPDATE saved_movies SET save_time='2017-11-15 14:35:26' WHERE username='fakeuser1' AND movie_id=7;
UPDATE saved_movies SET save_time='2017-11-20 14:35:28' WHERE username='fakeuser1' AND movie_id=2;
UPDATE saved_movies SET save_time='2017-12-08 14:35:29' WHERE username='fakeuser1' AND movie_id=1;

insert into reviews (movie_id, username, review_text) VALUES
(7, 'fakeuser1', 'This movie is so much fun! I watch it every day.'),
(2, 'fakeuser1', 'Batman\'s acting could have been better.'),
(1, 'fakeuser1', 'Possibly the worst movie I have ever seen.'),
(4, 'fakeuser2', 'What a twist ending! Amazing movie.'),
(3, 'fakeuser2', 'This movie is nothing new, wish I hadn\'t spent the money to see it.'),
(1, 'fakeuser2', 'I love watching robots smash each other! So cool!'),
(7, 'fakeuser3', 'Rogan and Franco do it again... A modern day masterpiece.'),
(2, 'fakeuser3', 'Loved this movie, much better than the rest of the movies.'),
(3, 'fakeuser3', 'My favorite Star Wars Movie of them all! Acting was top-notch.'),
(6, 'fakeuser3', 'I found this movie very offensive, would not recommend.'),
(4, 'fakeuser4', 'A classic, stands the test of time even today.'),
(7, 'fakeuser4', 'I don\'t see the hype, the movie was just OK.'),
(3, 'fakeuser4', 'My favorite character was that little robot, the rest of the cast was pretty bad.'),
(7, 'fakeuser5', 'I didn\'t understand a single thing that was going on in this film.'),
(6, 'fakeuser5', 'Tasteless humor and shock value is all that this movie provides.'),
(5, 'fakeuser5', 'As a police officer I do not condone the actions of the characters in this film.');
