<?php


if ( ! class_exists( 'Gravity_Forms_Neoserra_Records' ) ) {
	class Gravity_Forms_Neoserra_Records {

		public static $init = false;


		public static function init() {
			if( self::$init ) return;
			self::$init = true;

			add_action( 'gform_loaded', array( __CLASS__, 'register_add_ons' ), 5 );

			add_action( 'template_redirect', function() {
				if ( ! is_page(16) ) return;
				// $response = Crown_Neoserra_Api::get_contact( 370155 );
				// $response = Crown_Neoserra_Api::create_contact( array(
				// 	'centerId' => 34,
				// 	'first' => 'Boaty',
				// 	'last' => 'McBoatface',
				// 	'email' => 'boaty@mcboatface.com',
				// 	'phone' => '206-555-5555'
				// ) );
				$contact_id = 483798;
				// $response = Crown_Neoserra_Api::create_client( array(
				// 	'contactId' => $contact_id,
				// 	'product' => 'A Boat',
				// 	'company' => 'McBoatface, Inc.',
				// 	'physzip' => '99999'
				// ) );
				$client_id = 386153;
				// $response = Crown_Neoserra_Api::set_relationship( $client_id, $contact_id, array(
				// 	'position' => '-'
				// ) );
				$relationship_id = 386153;
				// $response = Crown_Neoserra_Api::create_tfg_application( array(
				// 	'clientId' => $client_id,
				// 	'date' => date( 'Y-m-d' )
				// ) );
				$tfg_application_id = 70509;
				// $response = Crown_Neoserra_Api::create_client( array(
				// 	'contact' => array(
				// 		'centerId' => 34,
				// 		'first' => 'Boaty Jr.',
				// 		'last' => 'McBoatface',
				// 		'email' => 'boatyjr@mcboatface.com',
				// 		'phone' => '206-555-5555'
				// 	),
				// 	'product' => 'A Boat',
				// 	'company' => 'McBoatface, Inc.',
				// 	'physzip' => '99999'
				// ) );
				$combined_client_id = 386155;
				// print_r( $response ); die;
			} );

		}


		public static function register_add_ons() {
			if ( ! method_exists( 'GFForms', 'include_addon_framework' ) ) return;

			define( 'GRAVITY_FORMS_NEOSERRA_RECORDS_ADD_ON_VERSION', self::get_version() );
			define( 'GRAVITY_FORMS_NEOSERRA_RECORDS_ADD_ON_PATH_DIR', preg_replace( '/^' . preg_quote( WP_PLUGIN_DIR, '/' ) . '\/?/', '', dirname( __FILE__ ) ) );
			include_once( 'class-gravity-forms-neoserra-records-feed-add-on.php' );
			GFAddOn::register( 'Gravity_Forms_Neoserra_Records_Feed_Add_On' );

			define( 'GRAVITY_FORMS_NEOSERRA_UPDATE_CLIENT_RECORDS_ADD_ON_VERSION', self::get_version() );
			define( 'GRAVITY_FORMS_NEOSERRA_UPDATE_CLIENT_RECORDS_ADD_ON_PATH_DIR', preg_replace( '/^' . preg_quote( WP_PLUGIN_DIR, '/' ) . '\/?/', '', dirname( __FILE__ ) ) );
			include_once( 'class-gravity-forms-neoserra-update-client-records-feed-add-on.php' );
			GFAddOn::register( 'Gravity_Forms_Neoserra_Update_Client_Records_Feed_Add_On' );

		}


		public static function get_version() {
			$plugin_file = preg_replace( '/\/classes$/', '', dirname( __FILE__ ) ) . '/plugin.php';
			$data = get_plugin_data( $plugin_file );
			return isset( $data['Version'] ) ? $data['Version'] : '';
		}


	}
}