DROP DATABASE IF EXISTS movieDB;

CREATE DATABASE movieDB;

USE movieDB;

create table director (
director_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
director_name varchar(60) not null,
dob date not null,
biography varchar(500),
birthplace varchar(100)
) engine = innoDB;

CREATE TABLE movies (
movie_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
title VARCHAR(60) NOT NULL,
director_id INT NOT NULL,
release_year YEAR NOT NULL,
metascore INT NOT NULL DEFAULT 0,
user_rating INT NOT NULL DEFAULT 0,
genre VARCHAR(60) NOT NULL,
summary VARCHAR(2000),
trailer VARCHAR(200),
FOREIGN KEY (director_id) REFERENCES director (director_id)
) ENGINE = innoDB;

CREATE TABLE ratings (
rating_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
movie_id INT NOT NULL,
rating_source VARCHAR(60) NOT NULL,
rating INT NOT NULL,
FOREIGN KEY (movie_id) REFERENCES movies (movie_id)
) ENGINE = innoDB;

CREATE TABLE actor (
actor_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
actor_name VARCHAR(60) NOT NULL,
dob date not null,
biography varchar(500),
height_in_inches INT,
birthplace varchar(100)
) ENGINE = innoDB;

create table roles (
role_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
role_name varchar(60) not null,
actor_id INT not null,
movie_id INT NOT NULL,
foreign key (movie_id) references movies (movie_id),
foreign key (actor_id) references actor (actor_id)
) engine = innoDB;

drop table if exists movie_user;
CREATE TABLE movie_user (
username VARCHAR(60) NOT NULL UNIQUE PRIMARY KEY,
user_password VARCHAR(60) NOT NULL,
is_admin int not null default 0
) ENGINE = innoDB;


CREATE TABLE saved_movies (
username VARCHAR(60) NOT NULL, 
movie_id INT NOT NULL,
FOREIGN KEY(username) REFERENCES movie_user (username),
FOREIGN KEY(movie_id) REFERENCES movies (movie_id)
) ENGINE = innoDB;


CREATE TABLE reviews (
review_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
movie_id INT NOT NULL,
username VARCHAR(60) NOT NULL,
review_text VARCHAR(2000) NOT NULL,
FOREIGN KEY(username) REFERENCES movie_user (username),
FOREIGN KEY(movie_id) REFERENCES movies (movie_id)
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
		SELECT *-- m.title, m.movie_id
		FROM movies m JOIN director d USING (director_id)
		WHERE m.title LIKE CONCAT('%', keywords, '%')
        OR d.director_name LIKE CONCAT('%', keywords, '%');
	ELSEIF typ = 1 THEN
		SELECT actor_name, actor_id FROM actor
        WHERE actor_name LIKE CONCAT('%', keywords, '%');
	ELSEIF typ = 2 THEN 
		SELECT r.role_name, r.movie_id, m.title, r.actor_id, a.actor_name
        FROM roles r 
        JOIN actor a USING (actor_id)
        JOIN movies m USING (movie_id)
        WHERE role_name LIKE CONCAT('%', keywords, '%');
	-- ELSE 
		-- throw some error I guess
	END IF;
END$$
DELIMITER ;

DROP PROCEDURE IF EXISTS movie_info;
DELIMITER $$
CREATE PROCEDURE movie_info(mid INT) BEGIN
	SELECT m.title, m.genre, d.director_name, m.summary, 
    m.metascore, m.user_rating, m.release_year, m.trailer,
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
	IF (SELECT * FROM ratings WHERE rating_source = user) > 0 THEN
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
		WHERE rating_source = 'user'
		AND ratings.movie_id = new_id);
    
	IF @num_reviews > 0 THEN 
		SET @review_total = (SELECT SUM(rating) FROM ratings 
			WHERE rating_source = 'user' 
			AND ratings.movie_id = new_id);
        
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
-- maybe disallow unsaving if the user reviewed it?
	IF (SELECT check_if_saved(user, m_id)) THEN
		DELETE FROM saved_movies WHERE username = user AND movie_id = m_id;
	ELSE 
		INSERT INTO saved_movies (username, movie_id) VALUE (user, m_id);
	END IF;
	-- If we end up storing view counts, update them here? or trigger?
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

-- This checks if saved AND submits a review -- should probably rename to reflect that.
DROP PROCEDURE IF EXISTS user_review_movie;
DELIMITER $$
CREATE  PROCEDURE user_review_movie(uname VARCHAR(60), body VARCHAR(2000), mov_id INT) BEGIN
	IF (SELECT COUNT(movie_id) FROM movies, movie_user
			WHERE movie_id = mov_id
			AND uname = movie_user.username
			GROUP BY username)
		> 0 THEN 
	INSERT INTO reviews (movie_id, user_id, review_text) VALUES (mov_id, uname, body);
	ELSE 
		SIGNAL SQLSTATE 'ERROR' SET
		MESSAGE_TEXT = 'Movie not in users saved movies',
		MYSQL_ERRNO = 1356;
	END IF;
END$$
DELIMITER ;

CREATE PROCEDURE find_num_saved_movies(mov_id INT) BEGIN
IF EXISTS (SELECT COUNT(DISTINCT movie_user.username) FROM movie_user, saved_movies
WHERE mov_id = movie_id
AND saved_movies.movie_id = mov_id
GROUP BY movie_user.username) THEN
SELECT COUNT(DISTINCT movie_user.username) AS num_saved FROM movie_user, saved_movies
WHERE mov_id = movie_id
AND saved_movies.movie_id = mov_id
GROUP BY movie_user.username;

ELSE 

SELECT 0 AS num_saved;

END IF;

END$$
DELIMITER ;


DROP PROCEDURE IF EXISTS get_popular_movies;
DELIMITER $$
CREATE PROCEDURE get_popular_movies() BEGIN


SELECT movies.movie_id, title FROM
(SELECT COUNT(movie_id), movie_id AS mvid FROM saved_movies
GROUP BY movie_id
ORDER BY COUNT(movie_id) DESC
LIMIT 3) results, movies
WHERE movies.movie_id = mvid
GROUP BY movies.movie_id, title;

END $$

DELIMITER ;





insert into actor (actor_name, dob) VALUES
("Jim Carrey", NOW()),
("Mariah Carey", NOW()),
("Meghan Fox", NOW()),
("Christian Bale", NOW()),
("Mark Hamill", NOW());

insert into director (director_name, dob) VALUES
("Michael Bay", NOW()),
("J.J. Abrams", NOW()),
("Christopher Nolan", NOW());

insert into movies (title, director_id, release_year, metascore, genre, trailer) VALUES
("John and the Singer", 1, 2020, 100, "action romance", "9LW12NkQtCY"),
("Transformers", 1, 2007, 0, "action", "zX81c2vycKo"),
("Batman Begins", 3, 2005, 0, "action", "neY2xVmOfUM"),
("Star Wars: The Force Awakens", 2, 2015, 0, "adventure", "sGbxmsDFVnE");

insert into ratings (movie_id, rating_source, rating) VALUES
(1, "Google", 99),
(2, "user", 5),
(2, "user", 7),
(2, "user", 2),
(3, "Rotten Tomatoes", 90),
(3, "user", 9),
(4, "IMDB", 94),
(4, "user", 8),
(4, "user", 7),
(4, "user", 9);

insert into roles (role_name, actor_id, movie_id) VALUES
("Singer", 2, 1),
("John", 1, 1);