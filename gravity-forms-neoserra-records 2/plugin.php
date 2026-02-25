<?php
/**
 * Plugin Name: Gravity Forms Neoserra Records
 * Description: Adds support for exporing Gravity Forms entries to a spreadsheet to be imported into Neoserra records. Includes CSV batch import tool.
 * Version: 2.1.0
 * Author: Jordan Crown
 * Author URI: http://www.jordancrown.com
 * License: GNU General Public License v2 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 */


include_once( dirname( __FILE__ ) . '/classes/class-crown-neoserra-records-api.php' );
include_once( dirname( __FILE__ ) . '/classes/class-gravity-forms-neoserra-records.php' );
include_once( dirname( __FILE__ ) . '/classes/class-neoserra-csv-batch-import.php' );

Gravity_Forms_Neoserra_Records::init();
Neoserra_CSV_Batch_Import::init();