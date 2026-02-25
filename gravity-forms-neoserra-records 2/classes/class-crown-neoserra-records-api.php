<?php

if ( ! class_exists( 'Crown_Neoserra_Records_Api' ) ) {
	class Crown_Neoserra_Records_Api {

		public static $init = false;

		protected static $api_uri = 'https://norcal.neoserra.com/api/v1/';
		protected static $api_token = null;

		protected static $cache_duration = MINUTE_IN_SECONDS * 60;


		public static function init() {
			if ( self::$init ) return;
			self::$init = true;

			if ( defined( 'NEOSERRA_API_TOKEN' ) ) self::$api_token = NEOSERRA_API_TOKEN;

		}


		public static function get_contacts( $args = array() ) {
			$response = self::query( 'contacts', $args );
			return $response;
		}

		public static function get_contact( $id, $args = array() ) {
			$response = self::query( 'contacts/' . $id, $args );
			return $response;
		}

		public static function clear_cached_get_contact( $id, $args = array() ) {
			$response = self::clear_cached_query( 'contacts/' . $id, $args );
			return $response;
		}
		
		public static function create_contact( $args = array() ) {
			$response = self::query( 'contacts/new', $args, 'post' );
			return $response;
		}

		public static function update_contact( $id, $args = array() ) {
			$response = self::query( 'contacts/' . $id, $args, 'post' );
			return $response;
		}

		public static function get_contact_relationships( $id, $args = array() ) {
			$args = array_merge( array( 'reverse' => 1 ), $args );
			$response = self::query( 'relationships/' . $id, $args );
			return $response;
		}

		public static function clear_cached_get_contact_relationships( $id, $args = array() ) {
			$args = array_merge( array( 'reverse' => 1 ), $args );
			$response = self::clear_cached_query( 'relationships/' . $id, $args );
			return $response;
		}

		public static function get_contact_clients( $id, $args = array() ) {
			$args = array_merge( array(
				'any_indiv_id' => $id,
				'columns' => implode( ',', array(
					'clientId',
					'company',
					'ftEmps',
					'ptEmps',
					'grossSales'
				) )
			) );
			$response = self::get_clients( $args );
			if ( is_object( $response ) && property_exists( $response, 'rows' ) && is_array( $response->rows ) ) {
				$response->rows = array_map( function( $n ) { $n->id = $n->clientId; return $n; }, $response->rows );
			}
			return $response;
		}

		public static function clear_cached_get_contact_clients( $id, $args = array() ) {
			$args = array_merge( array(
				'any_indiv_id' => $id,
				'columns' => implode( ',', array(
					'clientId',
					'company',
					'ftEmps',
					'ptEmps',
					'grossSales'
				) )
			) );
			$response = self::clear_cached_get_clients( $args );
			return $response;
		}


		public static function get_clients( $args = array() ) {
			$response = self::query( 'clients', $args );
			return $response;
		}
		public static function clear_cached_get_clients( $args = array() ) {
			$response = self::clear_cached_query( 'clients', $args );
			return $response;
		}

		public static function get_client( $id, $args = array() ) {
			$response = self::query( 'clients/' . $id, $args );
			return $response;
		}
		public static function clear_cached_get_client( $id, $args = array() ) {
			$response = self::clear_cached_query( 'clients/' . $id, $args );
			return $response;
		}
		
		public static function create_client( $args = array() ) {
			$response = self::query( 'clients/new', $args, 'post' );
			return $response;
		}

		public static function update_client( $id, $args = array() ) {
			$response = self::query( 'clients/' . $id, $args, 'post' );
			return $response;
		}

		public static function get_client_relationships( $id, $args = array() ) {
			$response = self::query( 'relationships/' . $id, $args );
			return $response;
		}

		public static function update_client_relationship( $client_id, $contact_id, $args = array() ) {
			$response = self::query( 'relationships/' . $client_id . '/' . $contact_id, $args, 'post' );
			return $response;
		}


		public static function get_tfg_application( $id, $args = array() ) {
			$response = self::query( '100100/' . $id, $args );
			return $response;
		}
		
		public static function create_tfg_application( $args = array() ) {
			$response = self::query( '100100/new', $args, 'post' );
			return $response;
		}

		public static function update_tfg_application( $id, $args = array() ) {
			$response = self::query( '100100/' . $id, $args, 'post' );
			return $response;
		}


		public static function get_center( $id, $args = array() ) {
			$response = self::query( 'centers/' . $id, $args );
			return $response;
		}


		public static function get_counselor( $id, $args = array() ) {
			$response = self::query( 'counselors/' . $id, $args );
			return $response;
		}


		public static function create_counseling( $args = array() ) {
			$response = self::query( 'counseling/new', $args, 'post' );
			return $response;
		}


		public static function create_milestone( $args = array() ) {
			$response = self::query( 'milestones/new', $args, 'post' );
			return $response;
		}


		public static function create_capital_funding( $args = array() ) {
			$response = self::query( 'investments/new', $args, 'post' );
			return $response;
		}


		public static function set_relationship( $id_a, $id_b, $args = array() ) {
			$response = self::query( 'relationships/' . $id_a . '/' . $id_b, $args, 'post' );
			return $response;
		}


		protected static function query( $endpoint, $query_args = array(), $method = 'get' ) {
			self::init();

			// $query_args = array_merge( array(), $query_args );

			$query_hash = 'neoserra_api_query_' . md5( json_encode( array( $endpoint, $query_args, $method ) ) );
			$cached_response = get_transient( $query_hash );
			if ( $cached_response !== false ) {
				return $cached_response;
			}

			$query_string = '';

			$headers = array(
				'Authorization' => 'Bearer ' . self::$api_token,
				'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
			);

			if ( $method == 'get' ) {
				$query_args = array_combine( array_keys( $query_args ), array_map( function($n) { return urlencode( is_object( $n ) || is_array( $n ) ? json_encode( $n ) : $n ); }, $query_args ) );
				$query_params = array();
				foreach ( $query_args as $k => $v ) $query_params[] = $k . '=' . $v;
				$query_string = implode( '&', $query_params );
			}

			$url = self::$api_uri . $endpoint . ( ! empty( $query_string ) ? '?' . $query_string : '' );

			$ch = curl_init();
			curl_setopt( $ch, CURLOPT_URL, $url );
			curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
			curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, 30 );
			curl_setopt( $ch, CURLOPT_TIMEOUT, 0 );
			curl_setopt( $ch, CURLOPT_HEADER, 0 );
			curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, 0 );
			curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, 1 );

			if ( $method == 'post' ) {
				$headers['Content-Type'] = 'application/json';
				curl_setopt( $ch, CURLOPT_POST, 1 );
				curl_setopt( $ch, CURLOPT_POSTFIELDS, json_encode( $query_args ) );
			}

			if ( ! empty( $headers ) ) {
				$http_headers = array();
				foreach ( $headers as $k => $v ) $http_headers[] = $k . ': ' . $v;
				curl_setopt( $ch, CURLOPT_HTTPHEADER, $http_headers );
			}

			// if ( curl_errno( $ch ) ) {
			// 	print_r( curl_error( $ch ) );
			// }

			$response = curl_exec( $ch );
			curl_close( $ch );
			unset( $ch );

			$response = json_decode( $response );

			set_transient( $query_hash, $response, self::$cache_duration );

			return $response;

		}


		private static function clear_cached_query( $endpoint, $query_args = array(), $method = 'get' ) {
			$query_hash = 'neoserra_api_query_' . md5( json_encode( array( $endpoint, $query_args, $method ) ) );
			return delete_transient( $query_hash );
		}


	}
}