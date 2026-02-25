<?php

GFForms::include_feed_addon_framework();

if ( ! class_exists( 'Gravity_Forms_Neoserra_Update_Client_Records_Feed_Add_On' ) ) {
	class Gravity_Forms_Neoserra_Update_Client_Records_Feed_Add_On extends GFFeedAddOn {


		protected $_version = GRAVITY_FORMS_NEOSERRA_UPDATE_CLIENT_RECORDS_ADD_ON_VERSION;
		protected $_min_gravityforms_version = '1.9';
		protected $_slug = 'neoserra-udpate-client-records-add-on';
		protected $_path = GRAVITY_FORMS_NEOSERRA_UPDATE_CLIENT_RECORDS_ADD_ON_PATH_DIR . '/class-gravity-forms-neoserra-udpate-client-records-add-on.php';
		protected $_full_path = __FILE__;
		protected $_title = 'Gravity Forms Neoserra Update Client Records Add-On';
		protected $_short_title = 'Neoserra Update Client Records';
		protected $_supports_feed_ordering = true;

		protected static $neoserra_dashboard_uri = 'https://norcal.neoserra.com/';
		protected static $session_neoserra_clients = array();


		private static $_instance = null;


		public function init() {
			parent::init();
	
			add_filter( 'gform_notification_events', array( &$this, 'add_notification_events' ) );

			add_filter( 'gform_custom_merge_tags', array( &$this, 'add_custom_merge_tags' ), 10, 4);
			add_filter( 'gform_replace_merge_tags', array( &$this, 'replace_custom_merge_tags' ), 10, 7 );


			add_action( 'gform_pre_submission', function( $form ) {

				$email = null;
				$field_ids = array(
					'neoserra_contact_id' => null,
					'neoserra_client_id' => null
				);
				foreach ( $form['fields'] as $field ) {
					if ( ! $email && $field->type == 'email' ) {
						$email = rgpost( 'input_' . $field->id );
					}
					if ( array_key_exists( $field->inputName, $field_ids ) ) {
						$field_ids[ $field->inputName ] = $field->id;
					}
				}
				if ( empty( $email ) ) return;

				$contact_id = null;
				if ( $field_ids['neoserra_contact_id'] && empty( $_POST[ 'input_' . $field_ids['neoserra_contact_id'] ] ) ) {
					$contact_search_response = Crown_Neoserra_Records_Api::get_contacts( array( 'email' => $email ) );
					$contact_id = is_object( $contact_search_response ) && property_exists( $contact_search_response, 'rows' ) && is_array( $contact_search_response->rows ) && ! empty( $contact_search_response->rows ) ? $contact_search_response->rows[0]->indivId : null;
					if ( $contact_id ) {
						$_POST[ 'input_' . $field_ids['neoserra_contact_id'] ] = $contact_id;
					}
				}

				$client_ids = array();
				if ( $field_ids['neoserra_client_id'] && empty( $_POST[ 'input_' . $field_ids['neoserra_client_id'] ] ) ) {
					if ( $contact_id ) {
						$client_search_response = Crown_Neoserra_Records_Api::get_contact_clients( $contact_id );
						$client_ids = is_object( $client_search_response ) && property_exists( $client_search_response, 'rows' ) && is_array( $client_search_response->rows ) && ! empty( $client_search_response->rows ) ? array_map( function( $n ) { return $n->clientId; }, $client_search_response->rows ) : array();
					} else {
						$client_search_response = Crown_Neoserra_Records_Api::get_clients( array( 'email' => $email ) );
						$client_ids = is_object( $client_search_response ) && property_exists( $client_search_response, 'rows' ) && is_array( $client_search_response->rows ) && ! empty( $client_search_response->rows ) ? array_map( function( $n ) { return $n->clientId; }, $client_search_response->rows ) : array();
					}
					if ( $client_ids ) {
						$_POST[ 'input_' . $field_ids['neoserra_client_id'] ] = implode( ',', $client_ids );
					}
				}

			} );


			add_filter( 'gform_pre_render', function( $form, $ajax, $field_values ) {
				if ( empty( $form['id'] ) ) return $form;

				$field_names = array(
					'neoserra_contact_email',
					'neoserra_client_id',
					'neoserra_client_ftEmps',
					'neoserra_milestone_ns_amount',
					'neoserra_client_ptEmps',
					'neoserra_milestone_nspt_amount',
					'neoserra_client_grossSales',
					'neoserra_milestone_is_amount'
				);
				$field_indices = array();
				foreach ( $form['fields'] as $i => $field ) {
					if ( in_array( $field->inputName, $field_names ) ) {
						$field_indices[ $field->inputName ] = $i;
					}
				}
				// if ( ! $field_indices[ 'neoserra_client_id' ] ) return $form;
				// if ( ! in_array( $form['fields'][ $field_indices[ 'neoserra_client_id' ] ]->type, array( 'radio', 'select' ) ) ) return $form;

				$contact_id = isset( $_GET['contact'] ) ? intval( $_GET['contact'] ) : null;

				if ( $contact_id && array_key_exists( 'neoserra_contact_email', $field_indices ) ) {
					$contact = Crown_Neoserra_Records_Api::get_contact( $contact_id );
					if ( is_object( $contact ) && property_exists( $contact, 'id' ) ) {
						$form['fields'][ $field_indices[ 'neoserra_contact_email' ] ]->defaultValue = $contact->email;
					}
				}

				$client_choices = array();

				$client_related_fields = array(
					'neoserra_client_id',
					'neoserra_client_ftEmps',
					'neoserra_milestone_ns_amount',
					'neoserra_client_ptEmps',
					'neoserra_milestone_nspt_amount',
					'neoserra_client_grossSales',
					'neoserra_milestone_is_amount'
				);
				if ( $contact_id && ! empty( array_intersect( $client_related_fields, array_keys( $field_indices ) ) ) ) {

					// $contact_relationships_response = Crown_Neoserra_Records_Api::get_contact_relationships( $contact_id );
					// $client_ids = is_object( $contact_relationships_response ) && property_exists( $contact_relationships_response, 'clientId' ) && is_array( $contact_relationships_response->clientId ) && ! empty( $contact_relationships_response->clientId ) ? $contact_relationships_response->clientId : array();

					// $clients = array();
					// foreach ( $client_ids as $client_id ) {
					// 	$client_response = Crown_Neoserra_Records_Api::get_client( $client_id );
					// 	$client = is_object( $client_response ) && property_exists( $client_response, 'id' ) ? $client_response : null;
					// 	if ( $client ) {
					// 		$clients[] = $client;
					// 	}
					// }

					$client_search_response = Crown_Neoserra_Records_Api::get_contact_clients( $contact_id );
					$clients = is_object( $client_search_response ) && property_exists( $client_search_response, 'rows' ) && is_array( $client_search_response->rows ) && ! empty( $client_search_response->rows ) ? $client_search_response->rows : array();

					if ( ! empty( $clients ) ) {
						
						self::$session_neoserra_clients = $clients;

						$default_client = $clients[0];
						if ( isset( $_GET['client'] ) ) {
							foreach ( $clients as $client ) {
								if ( $_GET['client'] == $client->id ) {
									$default_client = $client;
								}
							}
						}

						if ( array_key_exists( 'neoserra_client_id', $field_indices ) ) {
							if ( in_array( $form['fields'][ $field_indices[ 'neoserra_client_id' ] ]->type, array( 'radio', 'select' ) ) ) {
								$client_choices = array_map( function( $client ) {
									return array(
										'text' => $client->company,
										'value' => $client->id,
										'isSelected' => isset( $_GET['client'] ) && $_GET['client'] == $client->id
									);
								}, $clients );
								if ( count( $client_choices ) == 1 ) $client_choices[0]['isSelected'] = true;
								// $form['fields'][ $field_indices[ 'neoserra_client_id' ] ]->choices = $client_choices;
							} else {
								$form['fields'][ $field_indices[ 'neoserra_client_id' ] ]->defaultValue = $default_client->id;
							}
						}

						if ( isset( $_GET['client'] ) || count( $client_choices ) == 1 ) {
							if ( array_key_exists( 'neoserra_client_ftEmps', $field_indices ) ) $form['fields'][ $field_indices[ 'neoserra_client_ftEmps' ] ]->defaultValue = $default_client->ftEmps;
							// if ( array_key_exists( 'neoserra_milestone_ns_amount', $field_indices ) )  $form['fields'][ $field_indices[ 'neoserra_milestone_ns_amount' ] ]->defaultValue = $default_client->ftEmps;
							if ( array_key_exists( 'neoserra_client_ptEmps', $field_indices ) ) $form['fields'][ $field_indices[ 'neoserra_client_ptEmps' ] ]->defaultValue = $default_client->ptEmps;
							// if ( array_key_exists( 'neoserra_milestone_nspt_amount', $field_indices ) ) $form['fields'][ $field_indices[ 'neoserra_milestone_nspt_amount' ] ]->defaultValue = $default_client->ptEmps;
							if ( array_key_exists( 'neoserra_client_grossSales', $field_indices ) ) $form['fields'][ $field_indices[ 'neoserra_client_grossSales' ] ]->defaultValue = $default_client->grossSales;
							// if ( array_key_exists( 'neoserra_milestone_is_amount', $field_indices ) ) $form['fields'][ $field_indices[ 'neoserra_milestone_is_amount' ] ]->defaultValue = $default_client->grossSales;
						}

						// assign css classes to fields
						foreach ( $field_indices as $k => $field_index ) {
							if ( $field_index ) {
								$form['fields'][ $field_index ]->cssClass .= ' ' . 'field-' . $k;
							}
						}

					}
				}

				if ( array_key_exists( 'neoserra_client_id', $field_indices ) && in_array( $form['fields'][ $field_indices[ 'neoserra_client_id' ] ]->type, array( 'radio', 'select' ) ) ) {
					if ( $form['fields'][ $field_indices[ 'neoserra_client_id' ] ]->enableOtherChoice ) {
						$client_choices[] = array(
							'text' => 'New Business',
							'value' => -1,
							'isSelected' => empty( $client_choices )
						);
					}
					$form['fields'][ $field_indices[ 'neoserra_client_id' ] ]->choices = $client_choices;
				}

				return $form;
			}, 10, 3 );

			add_filter( 'gform_field_choice_markup_pre_render', function( $choice_markup, $choice, $field, $value ) {
				if ( $field->inputName == 'neoserra_client_id' && isset( $choice['isOtherChoice'] ) && boolval( $choice['isOtherChoice'] ) ) return '';
				return $choice_markup;
			}, 10, 4 );


			add_action( 'wp_footer', function() {
				if ( empty( self::$session_neoserra_clients ) ) return;
				?>
					<script>
						var sessionNeoserraClients = <?php echo json_encode( self::$session_neoserra_clients ); ?>;
						(function($) {
							$(document).on('change', '.field-neoserra_client_id input[type=radio], .field-neoserra_client_id select', function(e) {
								var form = $(this).closest('form');
								var clientId = $(this).val();
								if($(this).is('input[type=radio]')) {
									clientId = form.find('input[name=' + $(this).attr('name') + ']:checked').val();
								}
								var selectedClient = null;
								for(var i in sessionNeoserraClients) {
									var client = sessionNeoserraClients[i];
									if(client.clientId == clientId) {
										selectedClient = client;
										break;
									}
								}
								if(!selectedClient) {
									selectedClient = {
										ftEmps: '',
										ptEmps: '',
										grossSales: ''
									};
								}
								var fieldValues = {
									client_ftEmps: selectedClient.ftEmps,
									// milestone_ns_amount: selectedClient.ftEmps,
									client_ptEmps: selectedClient.ptEmps,
									// milestone_nspt_amount: selectedClient.ptEmps,
									client_grossSales: selectedClient.grossSales,
									// milestone_is_amount: selectedClient.grossSales
								};
								for(var i in fieldValues) {
									var input = $('.field-neoserra_' + i + ' input', form);
									if(input.length) {
										input.val(fieldValues[i]).trigger('change');
										if(typeof gf_form_conditional_logic != 'undefined' && (matches = input.attr('id').match(/^input_(\d+)_(\d+)/))) {
											if(gf_form_conditional_logic[matches[1]] && gf_form_conditional_logic[matches[1]].defaults[matches[2]]) gf_form_conditional_logic[matches[1]].defaults[matches[2]] = fieldValues[i];
										}
									}
								}
							});
							$('.field-employee_type').closest('form').find('.field-neoserra_milestone_ns_amount input, .field-neoserra_milestone_nspt_amount input').prop('readonly', true);
							$(document).on('change', '.field-employee_type input[type=checkbox]', function(e) {
								var form = $(this).closest('form');
								var selectedOptions = [];
								$(this).closest('.gfield').find('input:checked').each(function(i, el2) {
									selectedOptions.push($(el2).val());
								});
								$('.field-neoserra_milestone_ns_amount input', form).prop('readonly', selectedOptions.indexOf('NS') == -1);
								$('.field-neoserra_milestone_nspt_amount input', form).prop('readonly', selectedOptions.indexOf('NSPT') == -1);
							});
						})(jQuery);
					</script>
				<?php
			} );


			add_filter( 'gform_pre_validation', function( $form ) {
				$contact_id = isset( $_GET['contact'] ) ? intval( $_GET['contact'] ) : null;
				$client_id = isset( $_GET['client'] ) ? intval( $_GET['client'] ) : null;
				$form = self::set_contact_client_field_options( $form, $contact_id, $client_id );
				return $form;
			} );

			add_filter( 'gform_pre_submission_filter', function( $form ) {
				$contact_id = isset( $_GET['contact'] ) ? intval( $_GET['contact'] ) : null;
				$client_id = isset( $_GET['client'] ) ? intval( $_GET['client'] ) : null;
				$form = self::set_contact_client_field_options( $form, $contact_id, $client_id );
				return $form;
			} );

			add_filter( 'gform_us_states', function( $states ) {
				$new_states = array();
				foreach ( $states as $state ) {
					$new_states[ GF_Fields::get( 'address' )->get_us_state_code( $state ) ] = $state;
				}
				return $new_states;
			}, 10, 1 );

			add_filter( 'gform_field_validation', function( $result, $value, $form, $field ) {
				if ( $result['is_valid'] && $field->get_input_type() == 'date' && $field->adminLabel == 'Business Start Date' ) {
					$date = GFCommon::parse_date( $value );
					$date_timestamp = strtotime( $date['year'] . '-' . $date['month'] . '-' . $date['day'] );
					if ( $date_timestamp > time() ) {
						$result['is_valid'] = false;
						$result['message']  = 'Business must already be started. Please provide a date in the past.';
					}
				}
				return $result;
			}, 10, 4 );

			add_filter( 'gform_column_input', function( $input_info, $field, $column_text, $value, $form_id ) {
				if ( $field->adminLabel == 'Additional Capital Funding Investments' ) {
					$column_index = 1;
					if ( is_array( $field->choices ) ) {
						foreach ( $field->choices as $choice ) {
							if ( $choice['text'] == $column_text ) break;
							$column_index++;
						}
					}
					if ( $column_index == 1 ) {
						$input_info = array(
							'type' => 'select',
							'choices' => array(
								array( 'value' => '', 'text' => 'Select Option' ),
								array( 'value' => '.', 'text' => 'CA Relief Grant' ),
								array( 'value' => 'C', 'text' => 'Commercial (Bank) Loan' ),
								array( 'value' => 'U', 'text' => 'Community Advantage' ),
								array( 'value' => 'X', 'text' => 'Community Express Loan' ),
								array( 'value' => ')', 'text' => 'Crowd Funding' ),
								array( 'value' => '$', 'text' => 'Dream Fund Grant' ),
								array( 'value' => '+', 'text' => 'Equipment Loan or Financing' ),
								array( 'value' => '(', 'text' => 'Equity Investment: Seed Funding' ),
								array( 'value' => '8', 'text' => 'Equity Investment: Series A' ),
								array( 'value' => '9', 'text' => 'Equity Investment: Series B' ),
								array( 'value' => '_', 'text' => 'Equity Investment: Series C' ),
								array( 'value' => '3', 'text' => 'Grants' ),
								array( 'value' => 'R', 'text' => 'Line of Credit' ),
								array( 'value' => '1', 'text' => 'Local Loan' ),
								array( 'value' => 'M', 'text' => 'Micro-Loan' ),
								array( 'value' => 'E', 'text' => 'Other Equity Investment' ),
								array( 'value' => 'W', 'text' => 'Owner Investment' ),
								array( 'value' => '0', 'text' => 'Private Non-Institution' ),
								array( 'value' => 'L', 'text' => 'SBA Loan' ),
								array( 'value' => '7', 'text' => 'SBIR/STTR Grant' ),
								array( 'value' => 'T', 'text' => 'Stock Investment' ),
								array( 'value' => 'V', 'text' => 'Venture Capital' )
							)
						);
					}
				}
				return $input_info;
			}, 10, 5 );

			add_filter( 'gform_field_validation', function( $result, $value, $form, $field ) {
				if ( $result['is_valid'] && $field->get_input_type() == 'list' && $field->adminLabel == 'Additional Capital Funding Investments' ) {
					$has_missing_type = false;
					$has_missing_amount = false;
					foreach ( $value as $row_values ) {
						$row_values = array_values( $row_values );
						$type = $row_values[0];
						$amount = floatval( preg_replace( '/[^0-9\.\-]/', '', $row_values[1] ) );
						if ( $amount > 0 && empty( $type ) ) {
							$has_missing_type = true;
						} else if ( ! empty( $type ) && $amount <= 0 ) {
							$has_missing_amount = true;
						}
					}
					if ( $has_missing_type ) {
						$result['is_valid'] = false;
						$result['message'] = 'Please provide a funding source for all investments.';
					} else if ( $has_missing_amount ) {
						$result['is_valid'] = false;
						$result['message'] = 'Please provide an amount for all selected funding sources.';
					}
				}
				return $result;
			}, 10, 4 );
				
			


			// add_filter( 'gform_pre_render', array( __CLASS__, 'populate_client_field_options' ) );
			// add_filter( 'gform_pre_validation', array( __CLASS__, 'populate_client_field_options' ) );
			// add_filter( 'gform_pre_submission_filter', array( __CLASS__, 'populate_client_field_options' ) );
			// // add_filter( 'gform_admin_pre_render', array( __CLASS__, 'populate_client_field_options' ) );

		}


		public static function populate_client_field_options( $form ) {
			// print_r($form['fields']); die;
			$client_choices = array_map( function( $client ) {
				return array(
					'text' => $client->company,
					'value' => $client->id,
					'isSelected' => isset( $_GET['client'] ) && $_GET['client'] == $client->id
				);
			}, self::$session_neoserra_clients );
			if ( count( $client_choices ) == 1 ) {
				$client_choices[0]['isSelected'] = true;
			}
			foreach ( $form['fields'] as $field ) {
				if ( $field->inputName == 'client' && in_array( $field->type, array( 'radio', 'select' ) ) ) {
					$field->choices = $client_choices;
				}
			}
			return $form;
		}


		protected static function set_contact_client_field_options( $form, $contact_id, $default = null ) {

			$field_indices = array();
			foreach ( $form['fields'] as $i => $field ) {
				if ( $field->inputName == 'client' && in_array( $field->type, array( 'radio', 'select' ) ) ) {
					$field_indeces[] = $i;
				}
			}
			if ( empty( $field_indices ) ) return $form;

			$client_choices = array();

			if ( ! empty( $contact_id ) ) {
			
				$client_search_response = Crown_Neoserra_Records_Api::get_contact_clients( $contact_id );
				$clients = is_object( $client_search_response ) && property_exists( $client_search_response, 'rows' ) && is_array( $client_search_response->rows ) && ! empty( $client_search_response->rows ) ? $client_search_response->rows : array();

				$client_choices = array_map( function( $client ) use ( $default ) {
					return array(
						'text' => $client->company,
						'value' => $client->clientId,
						'isSelected' => ! empty( $default ) && $default == $client->clientId
					);
				}, $clients );
				if ( count( $client_choices ) == 1 ) {
					$client_choices[0]['isSelected'] = true;
				}

			}

			foreach ( $field_indices as $i ) {
				$choices = $client_choices;
				if ( $form['fields'][ $i ]->enableOtherChoice ) {
					$choices[] = array(
						'text' => 'New Business',
						'value' => -1,
						'isSelected' => empty( $client_choices )
					);
				}
				$form['fields'][ $i ]->choices = $choices;
			}

			return $form;
		}
	

		public static function get_instance() {
			if ( self::$_instance == null ) {
				self::$_instance = new self();
			}
	
			return self::$_instance;
		}


		public function feed_settings_fields() {
			return array(
				array(
					'title'  => esc_html__( 'Neoserra Settings', 'gfneoserra' ),
					'fields' => array(
						array(
							'name' => 'feedName',
							'label' => esc_html__( 'Name', 'gfneoserra' ),
							'type' => 'text',
							'required' => true,
							'class' => 'medium',
							'tooltip' => sprintf(
								'<h6>%s</h6>%s',
								esc_html__( 'Name', 'gfneoserra' ),
								esc_html__( 'Enter a feed name to uniquely identify this setup.', 'gfneoserra' )
							),
						),
						array(
							'name'     => 'contact_id_field',
							'label'    => esc_html__( 'Contact ID', 'gfneoserra' ),
							'type'     => 'field_select',
							'tooltip' => esc_html__( 'Select the contact ID field to use for updating the corresponding contact record in Neoserra. If the provided contact ID is blank, a new contact record will be created.', 'gfneoserra' ),
							'args'     => array(
								// 'input_types' => array( 'email' )
							)
						),
						array(
							'name'     => 'client_id_field',
							'label'    => esc_html__( 'Client ID', 'gfneoserra' ),
							'type'     => 'field_select',
							'tooltip' => esc_html__( 'Select the client ID field to use for updating the corresponding client record in Neoserra. If the provided client ID is blank, a new client record will be created and associated with the contact record.', 'gfneoserra' ),
							'args'     => array(
								// 'input_types' => array( 'email' )
							)
						),
						array(
							'name' => 'default_center_id',
							'label' => esc_html__( 'Default Center ID', 'gfneoserra' ),
							'type' => 'text',
							'class' => 'small',
							'tooltip' => esc_html__( 'When creating a new contact/client record, this is the center ID which it should be assigned (if not defined elsewhere).', 'gfneoserra' ),
						),
						array(
							'label' => esc_html__( 'Program', 'gfneoserra' ),
							'name' => 'program',
							'type' => 'field_select',
							'field_type' => array( 'text', 'select', 'hidden' ),
							'tooltip' => esc_html__( 'Use this field to map to a Neoserra center ID to override the default one provided above based on the linked program.', 'gfneoserra' ),
						),
						array(
							'type'    => 'checkbox',
							'name'    => 'notification_options',
							'label'   => esc_html__( 'Notifications', 'gfneoserra' ),
							'choices' => array(
								array(
									'label' => esc_html__( 'Send Counselor Notification', 'gfneoserra' ),
									'name' => 'notification_counselor_enabled',
									'default_value' => 0
								)
							)
						),
						array(
							'type'  => 'feed_condition',
							'name'  => 'update_record_condition',
							'label' => 'Feed Condition',
						)
					)
				),
				array(
					'title'  => esc_html__( 'Update Contact Record', 'gfneoserra' ),
					'fields' => array(
						array(
							// 'label' => esc_html__( 'Contact Record Properties', 'gfneoserra' ),
							'name' => 'contact_props',
							'type' => 'generic_map',
							'key_field' => array(
								'title' => 'Property Name',
								'allow_custom'  => true,
								'allow_duplicates' => true,
								'choices' => self::get_contact_record_property_choices()
							),
							'value_field' => array(
								'title' => 'Form Field'
							)
						),
					)
				),
				array(
					'title'  => esc_html__( 'Update Client Record', 'gfneoserra' ),
					'fields' => array(
						array(
							// 'label' => esc_html__( 'Client Record Properties', 'gfneoserra' ),
							'name' => 'client_props',
							'type' => 'generic_map',
							'key_field' => array(
								'title' => 'Property Name',
								'allow_custom'  => true,
								'allow_duplicates' => true,
								'choices' => self::get_client_record_property_choices()
							),
							'value_field' => array(
								'title' => 'Form Field'
							)
						),
					)
				),
				array(
					'title'  => esc_html__( 'Add New Milestone Record', 'gfneoserra' ),
					'fields' => array(
						array(
							'type'    => 'checkbox',
							'name'    => 'milestone_record_options',
							// 'label'   => esc_html__( 'Milestone Record Options', 'gfneoserra' ),
							'choices' => array(
								array(
									'label' => esc_html__( 'Enable Milestone Record Creation', 'gfneoserra' ),
									'name' => 'milestone_record_create_enabled',
									'default_value' => 0
								)
							)
						),
						array(
							// 'label' => esc_html__( 'Milestone Record Properties', 'gfneoserra' ),
							'name' => 'milestone_props',
							'type' => 'generic_map',
							'key_field' => array(
								'title' => 'Property Name',
								'allow_custom'  => true,
								'allow_duplicates' => true,
								'choices' => self::get_milestone_record_property_choices()
							),
							'value_field' => array(
								'title' => 'Form Field'
							)
						),
					)
				),
				array(
					'title'  => esc_html__( 'Add New Capital Funding Record', 'gfneoserra' ),
					'fields' => array(
						array(
							'type'    => 'checkbox',
							'name'    => 'capital_funding_record_options',
							// 'label'   => esc_html__( 'Capital Funding Record Options', 'gfneoserra' ),
							'choices' => array(
								array(
									'label' => esc_html__( 'Enable Capital Funding Record Creation', 'gfneoserra' ),
									'name' => 'capital_funding_record_create_enabled',
									'default_value' => 0
								)
							)
						),
						array(
							// 'label' => esc_html__( 'Capital Funding Record Properties', 'gfneoserra' ),
							'name' => 'capital_funding_props',
							'type' => 'generic_map',
							'key_field' => array(
								'title' => 'Property Name',
								'allow_custom'  => true,
								'allow_duplicates' => true,
								'choices' => self::get_capital_funding_record_property_choices()
							),
							'value_field' => array(
								'title' => 'Form Field'
							)
						),
					)
				)
			);
		}


		protected static function get_contact_record_property_choices() {
			$properties = array(
				'Salutation' => 'salutation',
				'First Name' => 'first',
				'Last Name' => 'last',
				'Pronouns' => 'pronouns',
				'Email Address' => 'email',
				'Secondary Email Address' => 'emailAlt',
				'Subscribe to emails?' => 'emailingLists',
				'Preferred Language' => 'language',
				'Position' => 'position',
				'Business Owner?' => 'owner',
				'Phone Number' => 'phone',
				'Work Phone Number' => 'phone2',
				'Cell Phone' => 'mobileph',
				'Fax Number' => 'fax',
				// 'Center ID (override)' => 'centerId',
				'Address' => 'mailaddr',
				'City' => 'mailcity',
				'State' => 'mailst',
				'County' => 'county',
				'Zip Code' => 'mailzip',
				'Federal Congressional District' => 'congDistFed',
				'State Representative District' => 'houseDistState',
				'State Senate/Assembly District' => 'senateDistState',
				'Country' => 'Country',
				'Special Program' => 'specprog',
				'Family Income' => 'famincome',
				'Annual Family Income' => 'afamincome',
				'Family Size' => 'famsize',
				'Single-Parent Family' => 'singparent',
				'CDBG Income Certification Date' => 'date',
				'Alternate Email Address' => 'altemail',
				'Age' => 'age',
				'Date of Birth' => 'dob',
				'Gender' => 'gender',
				'LGBTQ+' => 'orientation',
				'Identification Type' => 'identType',
				'Identification Number' => 'ident',
				'Race' => 'ethnic',
				'Additional Race(s)' => 'raceAdd',
				'Hispanic Origin' => 'hispanic',
				'Indian Tribal Entity' => 'tribe',
				'Veteran Status' => 'veteran',
				'Highest Military Rank' => 'militaryRank',
				'Military Status' => 'reservist',
				'Military Branch' => 'militaryBranch',
				'Disabled/Handicapped?' => 'handicapped',
				'Education Level Completed' => 'education',
				'Notes' => 'notes'
			);
			return self::convert_properties_to_choices( $properties );
		}

		protected static function get_client_record_property_choices() {
			$properties = array(
				'Is Intake?' => 'intake',
				'Intake Memo' => 'intakeMemo',
				'Client/Pre-client Type' => 'type2',
				'Stakeholder Type' => 'stakeholderType',
				'Services Sought' => 'serviceSeeking',
				'Company Name' => 'company',
				'DBA' => 'dba',
				'Phone Number' => 'busphone',
				'Secondary Phone Number' => 'busphone2',
				'Fax Number' => 'busfax',
				'Email Address' => 'busemail',
				'Subscribe to emails?' => 'emailingLists',
				'Website' => 'url',
				'Client Start Date' => 'started',
				'Expiration Date' => 'expires',
				'Physical Address Street' => 'physaddr',
				'Physical Address City' => 'physcity',
				'Physical Address State' => 'physst',
				'Physical Address Zip Code' => 'physzip',
				'Physical Address County' => 'county',
				'Country' => 'country',
				'Federal Congressional District' => 'congDistFed',
				'State Representative District' => 'houseDistState',
				'State Senate District' => 'senateDistState',
				'Mailing address is the same as physical address?' => 'mailUsePhys',
				'Mailing Address' => 'mailaddr',
				'Mailing City' => 'mailcity',
				'Mailing State' => 'mailst',
				'Mailing ZIP Code' => 'mailzip',
				'Mailing Address County' => 'mailCounty',
				'Ethnicity-Expanded' => 'ethnic',
				'Language' => 'user5',
				'Age' => 'age',
				'Qualifies for YEP (14-27 yrs old) ?' => 'yep',
				'Primary contact employed at intake?' => 'employed',
				'Have you attended the Business Basics workshop' => 'busbasic',
				'Referral From Bank' => 'refbank',
				'SBDC Regional Special Programs' => 'sbdcsp',
				'Special Program' => 'specialpgm',
				'Client Funding Program' => 'fundpgm',
				'Other' => 'other',
				'CDBG Income Certification Date' => 'cdbgicd',
				'Family Income' => 'famincome',
				'Annual Family Income' => 'familyinc',
				'Family Size' => 'famsize',
				'Single-Parent Family?' => 'sglparent',
				'Dream Fund Client?' => 'dfc',
				'Client is grant eligible?' => 'eligible',
				'Business Concept' => 'bcon',
				'Business Model' => 'bmod',
				'Business Type (Dream Fund)' => 'btyp',
				'Business Industry' => 'bind',
				'Intended Use(s) of Award' => 'intaw',
				'Intended Operation Location (Zip Code)' => 'intzip',
				'Has Business Bank Account?' => 'bnkacc',
				'Applicable Business Formation Documents Complete' => 'bizform',
				'Physical Location Established' => 'location',
				'Hired at least one employee' => 'job',
				'Revenue Generated' => 'revenue',
				'Spent money on business expenses' => 'expenses',
				'Business Investment Received' => 'invest',
				'East Bay Program Code' => 'ebpc',
				'Would you be interested in in-person advising in Oakland, Concord or Richmond?' => 'ebtraining',
				'Centro Latino West' => 'clw',
				'What is your SJSU Affiliation?' => 'sjsuaff',
				'Santa Cruz SBDC' => 'scsbdc',
				'Santa Cruz Special Programs' => 'spsc',
				'Are you a student of Cabrillo College?' => 'cabrillo',
				'Are you applying for services to retain current jobs in the business, including your own?' => 'retjob',
				'What is your preferred method of contact?' => 'contact',
				'San Francisco Legacy Business Status' => 'sflbs',
				'Sonoma Program Codes' => 'sonprco',
				'Date of Birth' => 'dob',
				'Gender Expanded' => 'gender',
				'City of Chico Client' => 'user20',
				'Income Level' => 'user25',
				'# In Household' => 'user26',
				'Has your business been affected by the 2018 wildfires in Shasta and Trinity Counties?' => 'wildfires',
				'MEHKO Client?' => 'mehko',
				'Date of Initial MEHKO Consultation' => 'initcons',
				'Race or Ethnicity of MEHKO Client' => 'ethnmehko',
				'Gender of MEHKO Client' => 'gendmehko',
				'Veteran Status of MEHKO Client' => 'vetmehko',
				'APEX Client?' => 'apex',
				'APEX Counselor Assignment' => 'apexcouns',
				'Is this client registered with any local (cities, counties, etc.) agencies to do business?' => 'localcont',
				// 'Is your company registered with Cal eProcure?' => '',
				// 'California Certifications' => '',
				'CA Certification ID' => 'caci',
				'CA Certification Renewal Date' => 'caexpir',
				'SAM.gov Registration Renewal Date' => 'samrenew',
				// 'Is your business registered in the SBA\'s Dynamic Small Business Search (DSBS)?' => '',
				// 'Is your company currently a government vendor listed on one or more GSA schedules, CMAS, or other similar contract vehicles?' => '',
				'Compliant with CMMC 2.0 Level 1?' => 'cmmc1',
				'Compliant with CMMC 2.0 Level 2 or above?' => 'cmmc2',
				// 'Compliant with FAR 52.204-21 (although not necessarily compliant with CMMC 2.0)' => '',
				// 'Is client working with Project Spectrum?' => '',
				// 'Has this client been connected with a federal laboratory?' => '',
				'Do you have a business plan?' => 'bplan',
				'Do you have money to finance your business venture?' => 'finance',
				'How much funding are you seeking? $' => 'funding2',
				'Step One: How may we help you?' => 'step1',
				'Step Two: How may we assist your business?' => 'step2',
				'If Other' => 'other',
				'Initial Business Status' => 'statusInit',
				'Company Status' => 'status',
				'Date Company Established' => 'estab',
				'Verified to be in business?' => 'verifiedInBusiness',
				'Reportable Business Start Impact' => 'impactDate',
				'Full-Time Employees' => 'ftEmps',
				'Part-Time Employees' => 'ptEmps',
				'Export-Related Employees' => 'empsExport',
				'Ownership Gender' => 'ownerGender',
				'Ownership Gender Certification Date' => 'ownerGenderDate',
				'Percentage of Woman Ownership' => 'womanOwnedPct',
				'Company Veteran Status' => 'ownerVeteran',
				'Veteran Verification/Certification Date' => 'ownerVeteranDate',
				'Business Size' => 'bussize',
				'Disadvantage Status' => 'disadvStatus',
				'Disadvantage Certification Date' => 'disadvCertdate',
				'Business Type' => 'bustype',
				'Organization Type' => 'orgtype',
				'State of Incorporation' => 'incstate',
				'HUBZone' => 'hubzone',
				'HUBZone Certification Date' => 'hubzoneDate',
				'Distressed Area?' => 'distress',
				'Located on Tribal Lands?' => 'locationTribalLands',
				'Indian Tribal Entity' => 'tribe',
				'Member of an underserved community?' => 'underserved',
				'International Trade' => 'intlTrade',
				'Export Countries' => 'exportCountries',
				'Business Online?' => 'busonline',
				'Home-based?' => 'homebased',
				'Conducts business in a language other than English?' => 'otEnglish',
				'Business Languages' => 'oteLangs',
				'Federal ID' => 'fedid',
				'SBA Client Type' => 'sbaClientType',
				'SBA Relationship' => 'sbarel',
				'Gross Revenue' => 'grossSales',
				'Gross Revenue Date' => 'grossSalesDate',
				'Gross Exported-Related Revenue' => 'grossSalesExport',
				'Profits/Losses' => 'grossProfits',
				'Profits/Losses Date' => 'grossProfitsDate',
				'Current Bonding Amount' => 'bondingAmount',
				'Government Industrial Base (GIB) ready?' => 'hasPotential',
				'GIB Ready Date' => 'hasPotentialDate',
				'Defense Industrial Base (DIB) ready?' => 'hasDodPotential',
				'DIB Ready Date' => 'hasDodPotentialDate',
				'Key Technology Areas' => 'kta',
				'Key Technology Sub-areas' => 'subkta',
				'SAM Registration' => 'samReg',
				'Capabilities Statement?' => 'capStmt',
				'IP Ownership' => 'ipOwnership',
				'IP Owner Name' => 'ipOwner',
				'Products Commercially Available' => 'commerciallyAvailable',
				'Annual Production Capacity' => 'prodCap',
				'Technology Readiness Level' => 'techReadyLevel',
				'DoD Covered Small Business?' => 'coveredSb',
				'Unique Entity Identifier' => 'uei',
				'DUNS Number' => 'duns',
				'CAGE Code' => 'cage',
				'Primary Counselor' => 'counselId',
				'Default Funding Source' => 'defaultfundarea',
				'Default Sub-funding Source' => 'defaultfemaEnergy',
				'Referral From' => 'reffrom',
				'Referral From Description' => 'reffromDesc',
				'Referral To' => 'refto',
				'Referral To Description' => 'reftoDesc',
				'PSCs' => 'pscs',
				'Primary PSC' => 'primaryPsc',
				'SICs' => 'sics',
				'Primary SIC' => 'primarySic',
				'NAICs' => 'naics',
				'Primary NAICS' => 'primaryNaics',
				'ISICs' => 'isics',
				'Primary ISIC' => 'primaryIsic',
				'HS Code(s)' => 'hs',
				'Primary Harmonized Code' => 'primaryHs',
				'Product or Service Description' => 'product',
				'Notes' => 'notes',
				'Case End Type' => 'caseend',
				'Agreement on file?' => 'agreement',
				'Permit SBA surveys?' => 'allowSbaContact',
				'Signature' => 'signature',
				'Signature Date' => 'ecenterEntry',
			);
			return self::convert_properties_to_choices( $properties );
		}

		protected static function get_milestone_record_property_choices() {
			$properties = array(
				'Milestone Date' => 'date',
				'Milestone Type' => 'type',
				'Milestone Amount' => 'amount',
				'Initial Date' => 'initialDate',
				'Initial Amount' => 'initialAmount',
				'Counterpart' => 'remark',
				'COVID-19 related?' => 'covid19',
				'Subject' => 'text',
				// 'Center ID' => 'centerId',
				'Funding Source' => 'fundarea',
				'Sub-funding Source' => 'femaEnergy',
				'Notes' => 'memo',
				'Survey Response' => 'surveyId',
				'Reportable?' => 'isReportable',
				'Attribution Statement' => 'attribStatement',
				'Attribution Source' => 'attribution',
				'Attribution Signature' => 'attribSignature',
				'Attribution Date' => 'attribDate',
				'Verified' => 'verify'
			);
			return self::convert_properties_to_choices( $properties );
		}

		protected static function get_capital_funding_record_property_choices() {
			$properties = array(
				'Reporting Date' => 'date',
				'Application Date' => 'appdate',
				'Completion Status' => 'status',
				'Date Completed' => 'dateCompleted',
				'Funding Type' => 'type',
				'Institution' => 'institution',
				'Amount Requested' => 'amountReq',
				'Amount Approved' => 'amountApproved',
				'Subject' => 'text',
				// 'Center ID' => 'centerId',
				'Funding Source' => 'fundarea',
				'Notes' => 'memo',
				'Attribution Statement' => 'attribStatement',
				'Attribution Source' => 'attribution',
				'Attribution Signature' => 'attribSignature',
				'Attribution Date' => 'attribDate',
				'Required Attribution' => 'reqattrib'
			);
			return self::convert_properties_to_choices( $properties );
		}


		protected static function convert_properties_to_choices( $properties ) {
			$choices = array();
			foreach ( $properties as $label => $value ) {
				$choice = array(
					'label' => $label
				);
				if ( is_array( $value ) ) {
					$choice['choices'] = array();
					foreach ( $value as $inner_label => $inner_value ) {
						$choice['choices'][] = array(
							'label' => $inner_label,
							'value' => $inner_value
						);
					}
				} else {
					$choice['value'] = $value;
				}
				$choices[] = $choice;
			}
			return $choices;
		}


		public function feed_list_columns() {
			return array(
				'feedName' => __( 'Name', 'gfneoserra' ),
				// 'center_id'   => __( 'Center Id', 'gfneoserra' )
			);
		}


		public function process_feed( $feed, $entry, $form ) {

			$error_messages = array();

			$contact_props = $this->get_generic_map_fields( $feed, 'contact_props' );
			$client_props = $this->get_generic_map_fields( $feed, 'client_props' );
			$milestone_props = $this->get_generic_map_fields( $feed, 'milestone_props' );
			$capital_funding_props = $this->get_generic_map_fields( $feed, 'capital_funding_props' );

			$notes_field_ids = array();
			foreach ( $feed['meta']['client_props'] as $mapping ) {
				if ( $mapping['key'] == 'notes' && ! empty( $mapping['value'] ) ) {
					$notes_field_ids[] = $mapping['value'];
				}
			}
			if ( count( $notes_field_ids ) > 1 ) {
				$client_props['notes'] = $notes_field_ids;
			}

			$contact_id_field_id = $feed['meta']['contact_id_field'];
			$contact_id = ! empty( $contact_id_field_id ) ? $this->get_field_value( $form, $entry, $contact_id_field_id ) : '';

			$client_id_field_id = $feed['meta']['client_id_field'];
			$client_id = ! empty( $client_id_field_id ) ? $this->get_field_value( $form, $entry, $client_id_field_id ) : '';
			if ( intval( $client_id ) == -1 ) $client_id = '';

			$contact = null;
			$client = null;

			if ( ! empty( $contact_id ) ) {
				$contact_response = Crown_Neoserra_Records_Api::get_contact( $contact_id );
				$contact = is_object( $contact_response ) && property_exists( $contact_response, 'id' ) ? $contact_response : null;
			}

			if ( ! empty( $client_id ) ) {
				$client_response = Crown_Neoserra_Records_Api::get_client( $client_id );
				$client = is_object( $client_response ) && property_exists( $client_response, 'id' ) ? $client_response : null;
			}

			$default_center_id = $feed['meta']['default_center_id'];
			$program_field_id = $feed['meta']['program'];
			$queried_program = ! empty( $program_field_id ) ? $this->get_field_value( $form, $entry, $program_field_id ) : '';
			if ( ! empty( $queried_program ) && class_exists( 'Crown_Site_Settings_Signup' ) ) {
				$program = Crown_Site_Settings_Signup::get_program( $queried_program );
				if ( $program && !empty( trim( $program->neoserra_center_id ) ) ) {
					$default_center_id = trim( $program->neoserra_center_id );
				}
			}

			$center_id = $contact ? $contact->centerId : ( $client ? $client->centerId : $default_center_id );

			$contact_args = $this->get_record_args_from_props( $contact_props, $entry, $form );
			$client_args = $this->get_record_args_from_props( $client_props, $entry, $form );
			$milestone_args = boolval( $feed['meta']['milestone_record_create_enabled'] ) ? $this->get_record_args_from_props( $milestone_props, $entry, $form ) : array();
			$capital_funding_args = boolval( $feed['meta']['capital_funding_record_create_enabled'] ) ? $this->get_record_args_from_props( $capital_funding_props, $entry, $form ) : array();

			$counselor_notification_links = array();
			$counselor_id = '';
			$counselor_email = '';
			$center_director_email = '';
			if ( $client && ! empty( $client->counselId ) ) {
				$counselor_id = $client->counselId;
				$counselor_response = Crown_Neoserra_Records_Api::get_counselor( $counselor_id );
				$counselor = is_object( $counselor_response ) && property_exists( $counselor_response, 'id' ) ? $counselor_response : null;
				if ( $counselor ) {
					$counselor_email = ! empty( $counselor->email ) ? $counselor->email : $counselor_email;
				}
			}
			if ( ! empty( $center_id ) && ( empty( $counselor_id ) || empty( $counselor_email ) || empty( $center_director_email ) ) ) {
				$center_response = Crown_Neoserra_Records_Api::get_center( $center_id );
				$center = is_object( $center_response ) && property_exists( $center_response, 'id' ) ? $center_response : null;
				if ( $center ) {
					$counselor_id = empty( $counselor_id ) ? $center->counselId : $counselor_id;
					$counselor_email = empty( $counselor_email ) ? $center->diremail : $counselor_email;
					$center_director_email = empty( $center_director_email ) ? $center->diremail : $center_director_email;
				}
			}


			// create/update contact record
			if ( ! empty( $contact_args ) ) {
				$contact_args = array_merge( array(
					'centerId' => $center_id
				), $contact_args );
				$contact_response = null;
				if ( $contact ) {
					$contact_response = Crown_Neoserra_Records_Api::update_contact( $contact_id, $contact_args );
					Crown_Neoserra_Records_Api::clear_cached_get_contact( $client_id );
				} else if ( empty( $contact_id ) ) {
					$contact_response = Crown_Neoserra_Records_Api::create_contact( $contact_args );
				} else {
					$error_messages[] = '[update_contact] ' . 'Contact record #' . $contact_id . ' not found.';
				}
				if ( $contact_response ) {
					$error_messages = array_merge( $error_messages, self::get_error_messages( $contact_response, $contact ? 'update_contact' : 'create_contact' ) );
					$contact_id = is_object( $contact_response ) && property_exists( $contact_response, 'id' ) ? $contact_response->id : null;
					if ( $contact_id ) {
						gform_update_meta( $entry['id'], 'neoserra_contact_id', $contact_id );
						$counselor_notification_links['contact'] = self::$neoserra_dashboard_uri . 'contacts/' . $contact_id;
					}
				}
			}


			$already_in_business = false;
			if ( $client ) {
				if ( in_array( $client->statusInit, array( 'S', 'B' ) ) ) {
					$already_in_business = true;
				} else if ( ! empty( $client->impactDate ) ) {
					$already_in_business = true;
				}
			}


			// create/update client record
			if ( ! empty( $client_args ) ) {
				$client_args = array_merge( array(
					'centerId' => $center_id
				), $client_args );
				if ( array_key_exists( 'estab', $client_args ) && ! empty( $client_args['estab'] ) && ! array_key_exists( 'status', $client_args ) ) {
					$date_estab = new DateTime( $client_args['estab'] );
					$now = new DateTime();
					$diff = $now->diff( $date_estab );
					$client_args['status'] = intval( $diff->format('%y') ) > 0 ? 'B' : 'S';
				}
				if ( ( array_key_exists( 'ftEmps', $client_args ) && ! empty( $client_args['ftEmps'] ) ) || ( array_key_exists( 'ptEmps', $client_args ) && ! empty( $client_args['ptEmps'] ) ) ) {
					if ( array_key_exists( 'status', $client_args ) ) {
						if ( ! in_array( $client_args['status'], array( 'S', 'B' ) ) ) {
							$client_args['status'] = 'S';
						}
					} else if ( $client ) {
						if ( ! in_array( $client->status, array( 'S', 'B' ) ) ) {
							$client_args['status'] = 'S';
						}
					} else {
						$client_args['status'] = 'S';
					}
				}
				if ( $already_in_business ) {
					if ( array_key_exists( 'estab', $client_args ) ) unset( $client_args['estab'] );
					if ( array_key_exists( 'impactDate', $client_args ) ) unset( $client_args['impactDate'] );
				}
				$client_response = null;
				if ( $client ) {
					$client_response = Crown_Neoserra_Records_Api::update_client( $client_id, $client_args );
					Crown_Neoserra_Records_Api::clear_cached_get_client( $client_id );
				} else if ( empty( $client_id ) ) {
					$client_response = Crown_Neoserra_Records_Api::create_client( $client_args );
				} else {
					$error_messages[] = '[update_client] ' . 'Client record #' . $client_id . ' not found.';
				}
				if ( $client_response ) {
					$error_messages = array_merge( $error_messages, self::get_error_messages( $client_response, $client ? 'update_client' : 'create_client' ) );
					$client_id = is_object( $client_response ) && property_exists( $client_response, 'id' ) ? $client_response->id : null;
					if ( $client_id ) {
						gform_update_meta( $entry['id'], 'neoserra_client_id', $client_id );
						$counselor_notification_links['client'] = self::$neoserra_dashboard_uri . 'clients/' . $client_id;
					}
					if ( $contact_id ) {
						// Crown_Neoserra_Records_Api::clear_cached_get_contact_relationships( $contact_id );
						Crown_Neoserra_Records_Api::clear_cached_get_contact_clients( $contact_id );
					}
				}
			}


			// add new contact/client relationship
			if ( $contact_id && $client_id ) {
				$relationship_response = Crown_Neoserra_Records_Api::update_client_relationship( $client_id, $contact_id, (object) array() );
				$error_messages = array_merge( $error_messages, self::get_error_messages( $relationship_response, 'update_client_relationship' ) );
			}


			// if client just created and info needed for other records, fetch client data
			if ( ! $client && $client_id && ( empty( $milestone_args ) || empty( $capital_funding_args ) ) ) {
				$client_response = Crown_Neoserra_Records_Api::get_client( $client_id );
				$client = is_object( $client_response ) && property_exists( $client_response, 'id' ) ? $client_response : null;
			}


			// create milestone record
			if ( $client && ! empty( $milestone_args ) ) {
				if ( $already_in_business && isset( $milestone_args['type'] ) && $milestone_args['type'] == '+BSI' ) {
					// do not create a new business start milestone
				} else {
					$milestone_args = array_merge( array(
						'clientId' => $client_id,
						'centerId' => $center_id,
						'fundarea' => ! empty( $client->defaultfundarea ) && ! in_array( $client->defaultfundarea, array( '?' ) ) ? $client->defaultfundarea : 'S',
						'counselors' => $counselor_id
					), $milestone_args );
					foreach ( array( 'amount', 'initialAmount' ) as $prop ) {
						if ( array_key_exists( $prop, $milestone_args ) ) $milestone_args[ $prop ] = floatval( preg_replace( '/[^\d\.\-]/', '', $milestone_args[ $prop ] ) );
					}
					foreach ( array( 'date', 'initialDate', 'attribDate' ) as $prop ) {
						if ( array_key_exists( $prop, $milestone_args ) ) $milestone_args[ $prop ] = preg_replace( '/^(\d{4}-\d{2}-\d{2}).*/', '$1', $milestone_args[ $prop ] );
					}
					$milestone_response = Crown_Neoserra_Records_Api::create_milestone( $milestone_args );
					$error_messages = array_merge( $error_messages, self::get_error_messages( $milestone_response, 'create_milestone' ) );
					$milestone_id = is_object( $milestone_response ) && property_exists( $milestone_response, 'id' ) ? $milestone_response->id : null;
					if ( $milestone_id ) {
						gform_update_meta( $entry['id'], 'neoserra_milestone_id', $milestone_id );
						$counselor_notification_links['milestone'] = self::$neoserra_dashboard_uri . 'activity/view?formid=7&eid=' . $milestone_id . '&url=/clients/' . $client->id;
					}
					if ( isset( $milestone_args['type'] ) && $milestone_args['type'] == '+BSI' ) {
						$conseling_args = array(
							'clients' => $client_id,
							'counselors' => $counselor_id,
							'date' => current_time( 'Y-m-d' ),
							'type' => 'U',
							'contactType' => 'OT',
							'sbaArea' => '7',
							'isReportable' => true,
							'text' => 'Client record update',
							'memo' => 'This update session was created to document the change in "Reportable Business Start Impact Date" on the client record. This system-defined session is necessary for export to Nexus and it cannot be edited or deleted. If you need to change the Reportable Business Start Impact Date, then please edit the client record.'
						);
						$counseling_response = Crown_Neoserra_Records_Api::create_counseling( $conseling_args );
						$error_messages = array_merge( $error_messages, self::get_error_messages( $counseling_response, 'create_counseling' ) );
						$counseling_id = is_object( $counseling_response ) && property_exists( $counseling_response, 'id' ) ? $counseling_response->id : null;
						if ( $counseling_id ) {
							gform_update_meta( $entry['id'], 'neoserra_counseling_id', $counseling_id );
						}
					}
				}
			}


			// create capital funding record
			if ( $client && ! empty( $capital_funding_args ) ) {
				$capital_funding_args = array_merge( array(
					'clientId' => $client_id,
					'centerId' => $center_id,
					'fundarea' => ! empty( $client->defaultfundarea ) && ! in_array( $client->defaultfundarea, array( '?' ) ) ? $client->defaultfundarea : 'S',
					'counselors' => $counselor_id
				), $capital_funding_args );
				foreach ( array( 'amountReq', 'amountApproved' ) as $prop ) {
					if ( array_key_exists( $prop, $capital_funding_args ) ) $capital_funding_args[ $prop ] = floatval( preg_replace( '/[^\d\.\-]/', '', $capital_funding_args[ $prop ] ) );
				}
				foreach ( array( 'date', 'appdate', 'dateCompleted', 'attribDate' ) as $prop ) {
					if ( array_key_exists( $prop, $capital_funding_args ) ) $capital_funding_args[ $prop ] = preg_replace( '/^(\d{4}-\d{2}-\d{2}).*/', '$1', $capital_funding_args[ $prop ] );
				}
				if ( array_key_exists( 'amountApproved', $capital_funding_args ) && $capital_funding_args['amountApproved'] > 0 ) {
					$capital_funding_response = Crown_Neoserra_Records_Api::create_capital_funding( $capital_funding_args );
					$error_messages = array_merge( $error_messages, self::get_error_messages( $capital_funding_response, 'create_capital_funding' ) );
					$capital_funding_id = is_object( $capital_funding_response ) && property_exists( $capital_funding_response, 'id' ) ? $capital_funding_response->id : null;
					if ( $capital_funding_id ) {
						gform_update_meta( $entry['id'], 'neoserra_capital_funding_id', $capital_funding_id );
						$counselor_notification_links['capital_funding'] = self::$neoserra_dashboard_uri . 'activity/view?formid=20&eid=' . $capital_funding_id . '&url=/clients/' . $client->id;
					}
				}
				foreach ( $form['fields'] as $field ) {
					if ( $field->type == 'list' && $field->adminLabel == 'Additional Capital Funding Investments' ) {
						$additional_funding = json_decode( $this->get_field_value( $form, $entry, $field->id ) );
						if ( is_array( $additional_funding ) ) {
							foreach ( $additional_funding as $funding ) {
								$funding = array_values( (array) $funding );
								$type = trim( $funding[0] );
								$amount = floatval( preg_replace( '/[^\d\.\-]/', '', trim( $funding[1] ) ) );
								if ( ! empty( $type ) && $amount > 0 ) {
									$capital_funding_args['type'] = $type;
									$capital_funding_args['amountApproved'] = $amount;
									$capital_funding_response = Crown_Neoserra_Records_Api::create_capital_funding( $capital_funding_args );
									$error_messages = array_merge( $error_messages, self::get_error_messages( $capital_funding_response, 'create_capital_funding' ) );
								}
							}
						}
					}
				}
			}


			// handle error messages
			foreach ( $error_messages as $error_message ) {
				$this->add_feed_error( $error_message, $feed, $entry, $form );
			}
			if ( ! empty( $error_messages ) ) {
				gform_update_meta( $entry['id'], 'neoserra_api_errors', $error_messages );
				GFAPI::send_notifications( $form, $entry, 'neoserra_api_error' );
			}

			$links = gform_get_meta( $entry['id'], 'neoserra_record_links' );
			if ( empty( $links ) ) $links = array();
			$links = array_merge( $links, $counselor_notification_links );
			gform_update_meta( $entry['id'], 'neoserra_record_links', $links );

			gform_update_meta( $entry['id'], 'neoserra_counselor_email', $counselor_email );
			gform_update_meta( $entry['id'], 'neoserra_center_director_email', $center_director_email );

			// send counselor notifications
			if ( boolval( $feed['meta']['notification_counselor_enabled'] ) && ! empty( $counselor_notification_links ) && ! empty( $counselor_email ) ) {
				GFAPI::send_notifications( $form, $entry, 'neoserra_counselor_notification' );
			}

			return;
		}

		protected function get_record_args_from_props( $props, $entry, $form ) {
			$args = array();
			foreach ( $props as $prop => $field_id ) {
				if ( empty( $field_id ) ) continue;
				$value = null;
				if ( is_array( $field_id ) ) {
					$values = array();
					foreach ( $field_id as $fid ) {
						$v = $this->get_field_value( $form, $entry, $fid );
						if ( empty( $v ) ) continue;
						$label = GFCommon::get_label( RGFormsModel::get_field( $form, $fid ) );
						$values[] = $label . ': ' . $v;
					}
					$value = implode( "\n", $values );
				} else {
					if ( array_key_exists( $field_id, $entry ) ) {
						$value = $this->get_field_value( $form, $entry, $field_id );
					} else {
						$value = GFCommon::replace_variables( $field_id, $form, $entry );
					}
				}
				// if ( ! empty( $value ) ) {
				// 	$args[ $prop ] = $value;
				// }
				$args[ $prop ] = $value;
			}
			return $args;
		}

		protected static function get_error_messages( $response, $context ) {
			$error_messages = array();
			if ( ! is_object( $response ) ) {
				$error_messages[] = '[' . $context . '] ' . 'No API response.';
			} else if ( property_exists( $response, 'errors' ) ) {
				foreach ( $response->errors as $error ) {
					$error = array_merge( array(
						'field' => '',
						'error' => ''
					), (array) $error );
					$error_messages[] = '[' . $context . ']' . ( ! empty( $error['field'] ) ? '[' . $error['field'] . ']' : '' ) . ' ' . $error['error'];
				}
			} else if ( property_exists( $response, 'exception' ) ) {
				$error_messages[] = '[' . $context . '] ' . $response->exception;
			} else {
				if ( preg_match( '/^get_/', $context ) ) {
					// no error logged for getter methods
				} else {
					if ( ! property_exists( $response, 'status' ) || $response->status != 'okay' ) {
						$error_messages[] = '[' . $context . '] ' . 'An unknown error occurred: ' . json_encode( $response );
					}
				}
			}
			return $error_messages;
		}


		public function add_notification_events( $notification_events ) {
			$notification_events['neoserra_api_error'] = __( 'Neoserra API Error', 'gfneoserra' );
			$notification_events['neoserra_counselor_notification'] = __( 'Neoserra Counselor Notification', 'gfneoserra' );
			return $notification_events;
		}

		
		public function add_custom_merge_tags( $merge_tags, $form_id, $fields, $element_id ) {
			$merge_tags[] = array( 'label' => 'Neoserra API Errors', 'tag' => '{neoserra_api_errors}' );
			$merge_tags[] = array( 'label' => 'Neoserra Counselor Email', 'tag' => '{neoserra_counselor_email}' );
			$merge_tags[] = array( 'label' => 'Neoserra Center Director Email', 'tag' => '{neoserra_center_director_email}' );
			$merge_tags[] = array( 'label' => 'Neoserra Record Links', 'tag' => '{neoserra_record_links}' );
			return $merge_tags;
		}


		public function replace_custom_merge_tags( $text, $form, $entry, $url_encode, $esc_html, $nl2br, $format ) {

			$merge_tag = '{neoserra_api_errors}';
			if ( strpos( $text, $merge_tag ) !== false ) {
				$errors = gform_get_meta( $entry['id'], 'neoserra_api_errors' );
				if ( ! empty( $errors ) ) {
					$text = str_replace( $merge_tag, implode( "\n", $errors ), $text );
				} else {
					$text = str_replace( $merge_tag, '', $text );
				}
			}

			$merge_tag = '{neoserra_counselor_email}';
			if ( strpos( $text, $merge_tag ) !== false ) {
				$email = gform_get_meta( $entry['id'], 'neoserra_counselor_email' );
				if ( ! empty( $email ) ) {
					$text = str_replace( $merge_tag, $email, $text );
				} else {
					$text = str_replace( $merge_tag, '', $text );
				}
			}

			$merge_tag = '{neoserra_center_director_email}';
			if ( strpos( $text, $merge_tag ) !== false ) {
				$email = gform_get_meta( $entry['id'], 'neoserra_center_director_email' );
				if ( ! empty( $email ) ) {
					$text = str_replace( $merge_tag, $email, $text );
				} else {
					$text = str_replace( $merge_tag, '', $text );
				}
			}

			$merge_tag = '{neoserra_record_links}';
			if ( strpos( $text, $merge_tag ) !== false ) {
				$links = gform_get_meta( $entry['id'], 'neoserra_record_links' );
				if ( ! empty( $links ) ) {
					$html_links = array();
					foreach ( $links as $k => $link ) {
						$label = 'Record';
						if ( $k == 'contact' ) $label = 'Contact Record';
						if ( $k == 'client' ) $label = 'Client Record';
						if ( $k == 'milestone' ) $label = 'Milestone Record';
						if ( $k == 'capital_funding' ) $label = 'Capital Funding Record';
						$html_links[] = '<strong>' . $label . ':</strong> <a href="' . $link . '" target="_blank">' . $link . '</a>';
					}
					$text = str_replace( $merge_tag, implode( "\n", $html_links ), $text );
				} else {
					$text = str_replace( $merge_tag, '', $text );
				}
			}

			return $text;
		}


	}
}