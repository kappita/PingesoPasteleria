<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'wordpress' );

/** Database username */
define( 'DB_USER', 'wordpress' );

/** Database password */
define( 'DB_PASSWORD', 'wordpress' );

/** Database hostname */
define( 'DB_HOST', 'db:3306' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'mug8x6c8uuiqina822tjisndp69bm1vx3gk5xnzuw28dv3ye3nfens5wkzb5yp0t' );
define( 'SECURE_AUTH_KEY',  'c3du4aanosda43evtljyfcyoccjlzsptbyptqzqjt47b56a1nvty8vhg11cuocay' );
define( 'LOGGED_IN_KEY',    'jdeshibz5ch9s6lsjo0ghphxth5ipupxe6lmqu5yyqmjdvmdn4pu2v5euwuz7s1n' );
define( 'NONCE_KEY',        '5rilarke0k7z639tzodafs2gjwfmedo1uzifefiyodyog1e8wtvuecj6wk6btpeb' );
define( 'AUTH_SALT',        'tzxg4ry7dy48lmp7azregvfpfoylpktc6cww0tfioccrty379gloxnpzqhpm8wsx' );
define( 'SECURE_AUTH_SALT', 'j2x8xraaachwlnvrdtzoulsuoancxcbxltnsw56v3yrymaqmewasmbtt773q9onw' );
define( 'LOGGED_IN_SALT',   'weiacu7cczsuzptsirp4iubauk0q5ndyxw5op0jcblpnbsuasiaxgm9twyzqqn6o' );
define( 'NONCE_SALT',       'feephegymuvivux9dvm4izkfj1yufrlnygyxvycavqnmoohfpeoflpvrvycuivm8' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wprs_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */

define('WP_DEBUG_DISPLAY', true);
@ini_set('display_errors', 1);

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
