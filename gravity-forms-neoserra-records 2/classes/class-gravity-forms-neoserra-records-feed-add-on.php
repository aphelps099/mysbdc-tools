<?php

GFForms::include_feed_addon_framework();

if ( ! class_exists( 'Gravity_Forms_Neoserra_Records_Feed_Add_On' ) ) {
	class Gravity_Forms_Neoserra_Records_Feed_Add_On extends GFFeedAddOn {


		protected $_version = GRAVITY_FORMS_NEOSERRA_RECORDS_ADD_ON_VERSION;
		protected $_min_gravityforms_version = '1.9';
		protected $_slug = 'neoserra-records-add-on';
		protected $_path = GRAVITY_FORMS_NEOSERRA_RECORDS_ADD_ON_PATH_DIR . '/class-gravity-forms-neoserra-records-add-on.php';
		protected $_full_path = __FILE__;
		protected $_title = 'Gravity Forms Neoserra Records Add-On';
		protected $_short_title = 'Neoserra Records';


		private static $_instance = null;


		public function init() {
			parent::init();
	
			// add_filter( 'gform_notification_events', array( &$this, 'add_neoserra_api_error_event' ) );

			// add_filter( 'gform_custom_merge_tags', array( &$this, 'add_custom_merge_tags' ), 10, 4);
			// add_filter( 'gform_replace_merge_tags', array( &$this, 'replace_custom_merge_tags' ), 10, 7 );

			add_filter( 'gform_pre_render', function( $form, $ajax, $field_values ) {
				if ( empty( $form['id'] ) ) return $form;
				$current_page = GFFormDisplay::get_current_page( $form['id'] );

				$neoserra_record_check_field_index = null;
				foreach ( $form['fields'] as $field_index => $field ) {
					if ( $field->inputName == 'neoserra_record_check' ) {
						$neoserra_record_check_field_index = $field_index;
						break;
					}
				}
				if ( ! $neoserra_record_check_field_index ) return $form;

				$entry = GFFormsModel::get_current_lead();
				if ( ! empty( $entry[ $form['fields'][ $neoserra_record_check_field_index ]->id ] ) ) return $form;

				$contact_id = null;
				foreach ( $form['fields'] as $field ) {
					if ( $field->inputName == 'email' ) {
						$lookup_email = rgpost( 'input_' . $field->id );
						if ( ! empty( $lookup_email ) ) {
							$contact_search_response = Crown_Neoserra_Records_Api::get_contacts( array( 'email' => $lookup_email ) );
							$contact_id = is_object( $contact_search_response ) && property_exists( $contact_search_response, 'rows' ) && is_array( $contact_search_response->rows ) && ! empty( $contact_search_response->rows ) ? $contact_search_response->rows[0]->indivId : null;
							break;
						}
					}
				}

				if ( $contact_id ) {
					$form['fields'][ $neoserra_record_check_field_index ]->defaultValue = $contact_id;
				}

				return $form;
			}, 10, 3 );

			// add_action( 'gform_pre_submission', function( $form ) {

			// 	$neoserra_record_check_field_id = null;
			// 	$neoserra_contact_id_field_id = null;
			// 	foreach ( $form['fields'] as $field ) {
			// 		if ( !$neoserra_record_check_field_id && $field->type == 'email' ) {
			// 			$neoserra_record_check_field_id = $field->id;
			// 		}
			// 		if ( ! $neoserra_contact_id_field_id && $field->inputName == 'neoserra_contact_id' ) {
			// 			$neoserra_contact_id_field_id = $field->id;
			// 		}
			// 	}
			// 	if ( ! $neoserra_record_check_field_id ) return;
			// 	if ( ! $neoserra_contact_id_field_id ) return;

			// 	$lookup_email = rgpost( 'input_' . $neoserra_record_check_field_id );
			// 	if ( empty( $lookup_email ) ) return;

			// 	$contact_search_response = Crown_Neoserra_Records_Api::get_contacts( array( 'email' => $lookup_email ) );
			// 	$contact_id = is_object( $contact_search_response ) && property_exists( $contact_search_response, 'rows' ) && is_array( $contact_search_response->rows ) && ! empty( $contact_search_response->rows ) ? $contact_search_response->rows[0]->indivId : null;

			// 	if ( $contact_id ) {
			// 		$_POST[ 'input_' . $neoserra_contact_id_field_id ] = $contact_id;
			// 	}

			// } );

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
							'label' => esc_html__( 'Default Center ID', 'gfneoserra' ),
							'type' => 'text',
							'name' => 'center_id',
							'tooltip' => esc_html__( 'Provide the center ID to send this Neoserra data to.', 'gfneoserra' ),
							'required' => true
						),
						array(
							'label' => esc_html__( 'Program', 'gfneoserra' ),
							'name' => 'program',
							'type' => 'field_select',
							'field_type' => array( 'text', 'select', 'hidden' ),
							'tooltip' => esc_html__( 'Use this field to map to a Neoserra center ID to override the default one provided above based on the linked program.', 'gfneoserra' ),
						),
						array(
							'name'     => 'lookup_email',
							'label'    => esc_html__( 'Lookup Email (for updating an existing record)', 'gfneoserra' ),
							'type'     => 'field_select',
							'tooltip' => esc_html__( 'Select the email field to use when searching for an existing record to update with the submitted form data. Leave blank to always create a new record for the contact/client.', 'gfneoserra' ),
							'args'     => array(
								'input_types' => array( 'email' )
							)
						),
						array(
							'type'    => 'checkbox',
							'name'    => 'record_options',
							'label'   => esc_html__( 'Record Options', 'gfneoserra' ),
							'choices' => array(
								array(
									'label'         => esc_html__( 'Process client as intake record', 'gfneoserra' ),
									'name'          => 'is_intake_record',
									'default_value' => 0,
								)
							)
						)
					)
				),
				array(
					'title'  => esc_html__( 'Contact Record', 'gfneoserra' ),
					'fields' => array(
						array(
							'label' => esc_html__( 'Mandatory Properties (when creating a new record)', 'gfneoserra' ),
							'type' => 'field_map',
							'name' => 'contact_props_mandatory',
							'field_map' => array(
								array(
									'name' => 'first',
									'label' => esc_html__( 'First Name', 'gfneoserra' ),
									'field_type' => array( 'name', 'text', 'hidden' ),
									'default_value' => $this->get_first_field_by_type( 'name', 3 ),
								),
								array(
									'name' => 'last',
									'label' => esc_html__( 'Last Name', 'gfneoserra' ),
									'field_type' => array( 'name', 'text', 'hidden' ),
									'default_value' => $this->get_first_field_by_type( 'name', 6 ),
								),
								array(
									'name' => 'email',
									'label' => esc_html__( 'Email Address', 'gfneoserra' ),
									'field_type' => array( 'email', 'text', 'hidden' ),
									'default_value' => $this->get_first_field_by_type( 'email' ),
								),
								array(
									'name' => 'phone',
									'label' => esc_html__( 'Phone Number', 'gfneoserra' ),
									'field_type' => array( 'phone', 'text', 'hidden' ),
									'default_value' => $this->get_first_field_by_type( 'phone' ),
								),
							),
						),
						array(
							'label' => esc_html__( 'Optional Properties', 'gfneoserra' ),
							'name' => 'contact_props_optional',
							'type' => 'generic_map',
							'key_field' => array(
								'title' => 'Property Name',
								'allow_custom'  => true,
								'choices' => self::get_contact_record_optional_property_choices()
							),
							'value_field' => array(
								'title' => 'Form Field'
							)
						),
					)
				),
				array(
					'title'  => esc_html__( 'Client Record', 'gfneoserra' ),
					'fields' => array(
						array(
							'label' => esc_html__( 'Mandatory Properties (when creating a new record)', 'gfneoserra' ),
							'type' => 'field_map',
							'name' => 'client_props_mandatory',
							'field_map' => array(
								array(
									'name' => 'product',
									'label' => esc_html__( 'Product or Service Description', 'gfneoserra' ),
									// 'required' => true,
									'field_type' => array( 'text', 'textarea', 'hidden' ),
									'tooltip' => 'Use optional client record property "Business Idea" as a fallback (if this field isn\'t filled in).'
								),
								array(
									'name' => 'company',
									'label' => esc_html__( 'Company Name', 'gfneoserra' ),
									// 'required' => true,
									'field_type' => array( 'text', 'hidden' ),
									'tooltip' => 'Defaults to "Undefined" if this field isn\'t filled in.'
								),
								array(
									'name' => 'physaddr',
									'label' => esc_html__( 'Physical Address', 'gfneoserra' ),
									// 'required' => true,
									'field_type' => array( 'address', 'text', 'hidden' ),
									'default_value' => $this->get_first_field_by_type( 'address', 1 ),
									'tooltip' => 'Use optional contact record property "Address" as a fallback (if this field isn\'t filled in).'
								),
								array(
									'name' => 'physcity',
									'label' => esc_html__( 'Physical City', 'gfneoserra' ),
									// 'required' => true,
									'field_type' => array( 'address', 'text', 'hidden' ),
									'default_value' => $this->get_first_field_by_type( 'address', 3 ),
									'tooltip' => 'Use optional contact record property "City" as a fallback (if this field isn\'t filled in).'
								),
								array(
									'name' => 'physzip',
									'label' => esc_html__( 'Physical Zip Code', 'gfneoserra' ),
									// 'required' => true,
									'field_type' => array( 'address', 'text', 'hidden' ),
									'default_value' => $this->get_first_field_by_type( 'address', 5 ),
									'tooltip' => 'Use optional contact record property "Zip Code" as a fallback (if this field isn\'t filled in).'
								)
							),
						),
						array(
							'label' => esc_html__( 'Optional Properties', 'gfneoserra' ),
							'name' => 'client_props_optional',
							'type' => 'generic_map',
							'key_field' => array(
								'title' => 'Property Name',
								'allow_custom'  => true,
								'allow_duplicates' => true,
								'choices' => self::get_client_record_optional_property_choices()
							),
							'value_field' => array(
								'title' => 'Form Field'
							)
						),
					)
				),
				array(
					'title'  => esc_html__( 'TFG Application Record', 'gfneoserra' ),
					'fields' => array(
						array(
							'label' => esc_html__( 'TFG Application Properties', 'gfneoserra' ),
							'name' => 'tfg_application_props_optional',
							'type' => 'generic_map',
							'key_field' => array(
								'title' => 'Property Name',
								'allow_custom'  => true,
								'choices' => self::get_tfg_application_record_optional_property_choices()
							),
							'value_field' => array(
								'title' => 'Form Field'
							)
						),
					)
				)
			);
		}


		protected static function get_contact_record_optional_property_choices() {
			$properties = array(
				'Salutation' => 'salutation',
				'Pronouns' => 'pronouns',
				'Secondary Email Address' => 'emailAlt',
				'Subscribe to emails?' => 'emailingLists',
				'Preferred Language' => 'language',
				'Position' => 'position',
				'Business Owner?' => 'owner',
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

		protected static function get_client_record_optional_property_choices() {
			$properties = array(
				'Business Idea' => 'product_alt',
				'Client/Pre-client Type' => 'type2',
				'Services Sought' => 'serviceSeeking',
				'DBA' => 'dba',
				'Phone Number' => 'busphone',
				'Secondary Phone Number' => 'busphone2',
				'Fax Number' => 'busfax',
				'Email Address' => 'busemail',
				'Subscribe to emails?' => 'emailingLists',
				'Website' => 'url',
				'Client Start Date' => 'started',
				'Expiration Date' => 'expires',
				'Physical Address State' => 'physst',
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
				'Notes' => 'notes',
				'Case End Type' => 'caseend',
				'Agreement on file?' => 'agreement',
				'Permit SBA surveys?' => 'allowSbaContact',
				'Signature' => 'signature',
				'Signature Date' => 'ecenterEntry',
			);
			return self::convert_properties_to_choices( $properties );
		}

		protected static function get_tfg_application_record_optional_property_choices() {
			$properties = array(
				'Contact' => 'contacts',
				'Counselor' => 'counselId',
				'Funding Source' => 'fundarea',
				'Sub-funding Source' => 'femaEnergy',
				'Reportable?' => 'isReportable',
				'Notes' => 'memo',
				'Website URL' => 'websiteurl',
				'LinkedIn' => 'linkedin',
				'Names' => 'conames',
				'LinkedIn Profiles' => 'teamlinked',
				'How long have the cofounders known each other?' => 'howlong',
				'How did you meet?' => 'howmeet',
				'Part-time' => 'parttime',
				'Full-time' => 'fulltime',
				'Where are you incorporated?' => 'incorporated',
				'General Focus (check all that apply)' => 'focus',
				'If other, please describe' => 'otherfocus',
				'Name your sub-category' => 'subcat',
				'What is your vision?' => 'vision',
				'What exactly are you currently building?' => 'building',
				'What problem are you solving?' => 'solving',
				'Describe your MOAT/competitive advantage?' => 'moat',
				'What stage is your technology?' => 'stage',
				'Who is your beachhead customer & long-term customer?' => 'beachhead',
				'Tell us about what you learned from customer discovery' => 'discovery',
				'What is your domain knowledge in the space?' => 'domain',
				'Explain your Go-to-market strategy' => 'gotomarket',
				'Explain your revenue model' => 'revenue',
				'Premortem - What 3 things must happen for your company to succeed in the next 5 years?' => 'premortem',
				'Total amount of funding your company has received, including grants, debt, and equity?' => 'funding',
				'What was the last round that you raised (check all that apply)' => 'lastround',
				'Are you raising capital now? If yes, how much and what will the use of funds be?' => 'raisingcap',
				'What key achievements/milestones have you made in the last 6 months?' => 'keyachiev',
				'What are your needs for the next 12 months? (Check all that apply)' => 'needs',
				'Other. Ex: IP support, supply chain, manufacturing strategy?' => 'othernds'
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
				'center_id'   => __( 'Center Id', 'gfneoserra' )
			);
		}


		public function process_feed( $feed, $entry, $form ) {

			$error_messages = array();

			$center_id = $feed['meta']['center_id'];

			$program_field_id = $feed['meta']['program'];
			$queried_program = ! empty( $program_field_id ) ? $this->get_field_value( $form, $entry, $program_field_id ) : '';
			if ( ! empty( $queried_program ) && class_exists( 'Crown_Site_Settings_Signup' ) ) {
				$program = Crown_Site_Settings_Signup::get_program( $queried_program );
				if ( $program && !empty( trim( $program->neoserra_center_id ) ) ) {
					$center_id = trim( $program->neoserra_center_id );
				}
			}

			$contact_props_mandatory = $this->get_field_map_fields( $feed, 'contact_props_mandatory' );
			$contact_props_optional = $this->get_generic_map_fields( $feed, 'contact_props_optional' );
			$contact_props = array_merge( $contact_props_mandatory, $contact_props_optional );

			$client_props_mandatory = $this->get_field_map_fields( $feed, 'client_props_mandatory' );
			$client_props_optional = $this->get_generic_map_fields( $feed, 'client_props_optional' );
			$client_props = array_merge( $client_props_mandatory, $client_props_optional );

			$notes_field_ids = array();
			foreach ( $feed['meta']['client_props_optional'] as $mapping ) {
				if ( $mapping['key'] == 'notes' && ! empty( $mapping['value'] ) ) {
					$notes_field_ids[] = $mapping['value'];
				}
			}
			if ( count( $notes_field_ids ) > 1 ) {
				$client_props['notes'] = $notes_field_ids;
			}

			$tfg_application_props_optional = $this->get_generic_map_fields( $feed, 'tfg_application_props_optional' );
			$tfg_application_props = array_merge( $tfg_application_props_optional );

			$lookup_email_field_id = $feed['meta']['lookup_email'];
			$lookup_email = ! empty( $lookup_email_field_id ) ? $this->get_field_value( $form, $entry, $lookup_email_field_id ) : '';

			$contact_id = null;
			$client_id = null;
			$update_records = false;

			if ( ! empty( $lookup_email ) ) {
				$contact_search_response = Crown_Neoserra_Records_Api::get_contacts( array( 'email' => $lookup_email ) );
				$contact_id = is_object( $contact_search_response ) && property_exists( $contact_search_response, 'rows' ) && is_array( $contact_search_response->rows ) && ! empty( $contact_search_response->rows ) ? $contact_search_response->rows[0]->indivId : $contact_id;
				if ( $contact_id ) {
					$client_search_response = Crown_Neoserra_Records_Api::get_clients( array( 'email' => $lookup_email ) );
					$client_id = is_object( $client_search_response ) && property_exists( $client_search_response, 'rows' ) && is_array( $client_search_response->rows ) && ! empty( $client_search_response->rows ) ? $client_search_response->rows[0]->clientId : $client_id;
					if ( $client_id ) {
						$update_records = true;
					} else {
						// cannot find matching client, unset found contact ID
						$contact_id = null;
					}
				}
			}

			// fill in required client fields from fallback fields, if set
			if ( ( ! isset( $client_props[ 'product' ] ) || empty( $client_props[ 'product' ] ) || empty( $this->get_field_value( $form, $entry, $client_props[ 'product' ] ) ) ) && ( isset( $client_props[ 'product_alt' ] ) && ! empty( $client_props[ 'product_alt' ] ) ) ) {
				$client_props[ 'product' ] = $client_props[ 'product_alt' ];
			}
			if ( ( ! isset( $client_props[ 'physaddr' ] ) || empty( $client_props[ 'physaddr' ] ) || empty( $this->get_field_value( $form, $entry, $client_props[ 'physaddr' ] ) ) ) && ( isset( $contact_props[ 'mailaddr' ] ) && ! empty( $contact_props[ 'mailaddr' ] ) ) ) {
				$client_props[ 'physaddr' ] = $contact_props[ 'mailaddr' ];
			}
			if ( ( ! isset( $client_props[ 'physcity' ] ) || empty( $client_props[ 'physcity' ] ) || empty( $this->get_field_value( $form, $entry, $client_props[ 'physcity' ] ) ) ) && ( isset( $contact_props[ 'mailcity' ] ) && ! empty( $contact_props[ 'mailcity' ] ) ) ) {
				$client_props[ 'physcity' ] = $contact_props[ 'mailcity' ];
			}
			if ( ( ! isset( $client_props[ 'physzip' ] ) || empty( $client_props[ 'physzip' ] ) || empty( $this->get_field_value( $form, $entry, $client_props[ 'physzip' ] ) ) ) && ( isset( $contact_props[ 'mailzip' ] ) && ! empty( $contact_props[ 'mailzip' ] ) ) ) {
				$client_props[ 'physzip' ] = $contact_props[ 'mailzip' ];
			}

			// clear fallback only fields
			if ( isset( $client_props[ 'product_alt' ] ) ) unset( $client_props[ 'product_alt' ] );

			// check if all required client props are set
			if ( ! $update_records ) {
				foreach ( array( 'product', 'physaddr', 'physcity', 'physzip' ) as $p ) {
					if ( ! isset( $client_props[ $p ] ) || empty( $client_props[ $p ] ) ) {
						$client_props = array();
						break;
					}
				}
			}

			// set up contact
			$contact = array(
				'centerId' => $center_id
			);
			foreach ( $contact_props as $prop => $field_id ) {
				$value = $this->get_field_value( $form, $entry, $field_id );
				if ( ! empty( $value ) ) $contact[ $prop ] = $value;
			}

			$center_id = $contact['centerId'];

			if ( empty( $client_props ) ) {

				$contact_response = null;
				if ( $update_records ) {
					$contact_response = Crown_Neoserra_Records_Api::update_contact( $contact_id, $contact );
				} else {
					$contact_response = Crown_Neoserra_Records_Api::create_contact( $contact );
				}
				$error_messages = array_merge( $error_messages, self::get_error_messages( $contact_response, $update_records ? 'update_contact' : 'create_contact' ) );
				$contact_id = is_object( $contact_response ) && property_exists( $contact_response, 'id' ) ? $contact_response->id : null;
				if ( $contact_id ) {
					gform_update_meta( $entry['id'], 'neoserra_contact_id', $contact_id );
				}

			} else {

				// update contact (if defined)
				if ( $update_records ) {
					$contact_response = Crown_Neoserra_Records_Api::update_contact( $contact_id, $contact );
					$error_messages = array_merge( $error_messages, self::get_error_messages( $contact_response, 'update_contact' ) );
					$contact_id = is_object( $contact_response ) && property_exists( $contact_response, 'id' ) ? $contact_response->id : null;
					if ( $contact_id ) {
						gform_update_meta( $entry['id'], 'neoserra_contact_id', $contact_id );
					}
				}

				$client = array(
					'centerId' => $center_id
				);
				foreach ( $client_props as $prop => $field_id ) {
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
						$value = $this->get_field_value( $form, $entry, $field_id );
					}
					if ( ! empty( $value ) ) $client[ $prop ] = $value;
				}
				if ( ! isset( $client['company'] ) || empty( $client['company'] ) ) {
					$client['company'] = 'Undefined';
				}

				$client_response = null;
				if ( $update_records ) {
					$client_response = Crown_Neoserra_Records_Api::update_client( $client_id, $client );
				} else {
					$client = array_merge( $client, array(
						'contact' => $contact,
						'intake' => boolval( $feed['meta']['is_intake_record'] )
					) );
					$client_response = Crown_Neoserra_Records_Api::create_client( $client );
				}
				$error_messages = array_merge( $error_messages, self::get_error_messages( $client_response, $update_records ? 'update_client' : 'create_client' ) );
				$client_id = is_object( $client_response ) && property_exists( $client_response, 'id' ) ? $client_response->id : null;
				if ( $client_id ) {
					gform_update_meta( $entry['id'], 'neoserra_client_id', $client_id );
				}

				if ( ! $update_records ) {
					// create tfg application
					if ( ! empty( $tfg_application_props ) && ! empty( $client_id ) ) {
						$tfg_application = array(
							'clientId' => $client_id,
							'date' => $entry['date_created'],
							'centerId' => $center_id
						);
						foreach ( $tfg_application_props as $prop => $field_id ) {
							$value = $this->get_field_value( $form, $entry, $field_id );
							if ( ! empty( $value ) ) $tfg_application[ $prop ] = $value;
						}
						if ( count( $tfg_application ) > 3 ) {
							$tfg_application_response = Crown_Neoserra_Records_Api::create_tfg_application( $tfg_application );
							$error_messages = array_merge( $error_messages, self::get_error_messages( $tfg_application_response, 'create_tfg_application' ) );
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

			return;
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


		public function add_neoserra_api_error_event( $notification_events ) {
			$notification_events['neoserra_api_error'] = __( 'Neoserra API Error', 'gfneoserra' );
			return $notification_events;
		}

		
		public function add_custom_merge_tags( $merge_tags, $form_id, $fields, $element_id ) {
			$merge_tags[] = array( 'label' => 'Neoserra API Errors', 'tag' => '{neoserra_api_errors}' );
			return $merge_tags;
		}


		public function replace_custom_merge_tags( $text, $form, $entry, $url_encode, $esc_html, $nl2br, $format ) {
			$merge_tag = '{neoserra_api_errors}';
			if ( strpos( $text, $merge_tag ) === false ) {
				return $text;
			} else {
				$errors = gform_get_meta( $entry['id'], 'neoserra_api_errors' );
				if ( ! empty( $errors ) ) {
					$text = str_replace( $merge_tag, implode( "\n", $errors ), $text );
				} else {
					$text = str_replace( $merge_tag, '', $text );
				}
			}
			return $text;
		}


	}
}