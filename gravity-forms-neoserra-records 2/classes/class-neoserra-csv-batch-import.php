<?php
/**
 * Neoserra CSV Batch Import
 *
 * Provides a WordPress admin interface to upload CSV files and batch import
 * client records into Neoserra via API.
 */

if ( ! class_exists( 'Neoserra_CSV_Batch_Import' ) ) {
	class Neoserra_CSV_Batch_Import {

		private static $instance = null;
		private static $init = false;

		// Default center ID (NorCal SBDC Regional Lead Center)
		private static $default_center_id = 23;

		// CSV column to Neoserra field mapping
		// Supports both Gravity Forms export column names and simplified CSV headers
		private static $field_mapping = array(
			// ========================================
			// GRAVITY FORMS EXPORT COLUMN NAMES
			// (These match the labels/admin labels from GF exports)
			// ========================================

			// Contact/Primary Contact fields
			'Name (First)'                    => 'first',
			'Name (Last)'                     => 'last',
			'Primary Contact (First)'         => 'first',
			'Primary Contact (Last)'          => 'last',
			'Email'                           => 'email',
			'PC Email'                        => 'email',
			'Phone'                           => 'phone',
			'PC Work Phone'                   => 'phone',
			'Cell Phone'                      => 'mobileph',

			// Home/Mailing Address (from GF address field)
			'Home Address (Street Address)'   => 'mailaddr',
			'Home Address (City)'             => 'mailcity',
			'Home Address (State / Province)' => 'mailst',
			'Home Address (ZIP / Postal Code)'=> 'mailzip',
			'PC Address (Street Address)'     => 'mailaddr',
			'PC Address (City)'               => 'mailcity',
			'PC Address (State / Province)'   => 'mailst',
			'PC Address (ZIP / Postal Code)'  => 'mailzip',

			// Business/Client fields
			'Are you in business?'            => 'statusInit',
			'Company/Initial Status'          => 'statusInit',
			'Business Name'                   => 'company',
			'Company Name'                    => 'company',
			'Date Business Established'       => 'estab',
			'Date Company Established'        => 'estab',

			// Business Address (from GF address field)
			'Business Address (Street Address)'   => 'physaddr',
			'Business Address (City)'             => 'physcity',
			'Business Address (State / Province)' => 'physst',
			'Business Address (ZIP / Postal Code)'=> 'physzip',
			'CO Physical Address (Street Address)'   => 'physaddr',
			'CO Physical Address (City)'             => 'physcity',
			'CO Physical Address (State / Province)' => 'physst',
			'CO Physical Address (ZIP / Postal Code)'=> 'physzip',

			// Product/Service description
			'In a few sentences, tell us about your core product(s) and or service(s) and how your business stands out from your competition.' => 'product',
			'In a few sentences, tell us about your business idea (is this a product or service?) and what makes your business idea stand out from marketplace competitors.' => 'product_alt',
			'Describe your business'          => 'product',           // NEW-UPDATED v2 form
			'Describe your business idea'     => 'product_alt',       // NEW-UPDATED v2 form
			'Business Idea'                   => 'product_alt',
			'Business Description'            => 'product',

			// Position and referral
			'Your Position in the Company'    => 'position',
			'PC Position'                     => 'position',
			'Referred by'                     => 'reffrom',
			'Referral From'                   => 'reffrom',
			'Referred by Other'               => 'reffromDesc',
			'New Referrals Other'             => 'reffromDesc',

			// Terms and signature
			'Signature'                       => 'signature',
			'Privacy Release'                 => 'allowSbaContact',
			'Terms of Service'                => 'agreement',
			'Subscribe to Newsletter'         => 'emailingLists',

			// Program field
			'Program'                         => 'program',

			// ========================================
			// SIMPLIFIED CSV COLUMN NAMES
			// (For manual CSV creation)
			// ========================================
			'First Name'           => 'first',
			'Last Name'            => 'last',
			'First'                => 'first',
			'Last'                 => 'last',
			'Address'              => 'mailaddr',
			'City'                 => 'mailcity',
			'State'                => 'mailst',
			'Zip'                  => 'mailzip',
			'ZIP Code'             => 'mailzip',
			'ZIP'                  => 'mailzip',
			'Physical Address'     => 'physaddr',
			'Physical City'        => 'physcity',
			'Physical State'       => 'physst',
			'Physical Zip'         => 'physzip',
			'Center ID'            => 'centerId',
			'Notes'                => 'notes',
			'Gender'               => 'gender',
			'Veteran Status'       => 'veteran',
			'Race'                 => 'ethnic',
			'Date of Birth'        => 'dob',

			// Legacy format support
			'Primary Contact'      => 'full_name',      // Will be parsed into first/last
			'PC Address'           => 'address_full',   // Will be parsed if full address string
		);

		// Status value mapping (maps GF choice values/text to Neoserra status codes)
		private static $status_mapping = array(
			// Neoserra codes (pass through)
			'P'           => 'P',   // Pre-venture/Pre-client
			'B'           => 'I',   // In Business (GF uses B, Neoserra uses I)
			'I'           => 'I',   // In Business

			// Text values
			'Pre-venture' => 'P',
			'Pre-client'  => 'P',
			'In Business' => 'I',

			// Yes/No responses (from "Are you in business?")
			'Yes'         => 'I',
			'No'          => 'P',
			'No, not yet' => 'P',
		);

		// Program to Center ID mapping
		// This maps the 'program' hidden field value to the appropriate Neoserra center ID
		// Note: Keys are lowercase - the lookup will convert to lowercase
		private static $program_center_mapping = array(
			// Special Programs (Fictitious)
			'health'      => 96,    // ~SBDC Health
			'hlth'        => 96,    // ~SBDC Health (alternate code)
			'sdsl'        => 85,    // ~Source Diverse Source Local

			// Finance Center
			'fc'          => 38,    // The Finance Center

			// Affiliates
			'aff-lake'    => 105,   // Lake County SBDC (Affiliate)

			// Regional Programs
			'rp'          => 47,    // Regional Training

			// Add more program mappings as needed
		);

		// Master list of all SBDC Centers
		// Format: 'Neo Code' => array( 'name' => 'Center Name', 'region' => 'Region Type' )
		private static $centers = array(
			// SBA Centers
			77  => array( 'name' => 'Access SBDC', 'region' => 'SBA' ),
			39  => array( 'name' => 'Butte College SBDC', 'region' => 'SBA' ),
			76  => array( 'name' => 'CA Hispanic SBDC', 'region' => 'SBA' ),
			71  => array( 'name' => 'East Bay SBDC', 'region' => 'SBA' ),
			36  => array( 'name' => 'Marin SBDC', 'region' => 'SBA' ),
			24  => array( 'name' => 'Mendocino SBDC', 'region' => 'SBA' ),
			13  => array( 'name' => 'North Coast SBDC', 'region' => 'SBA' ),
			72  => array( 'name' => 'Sacramento Valley SBDC', 'region' => 'SBA' ),
			15  => array( 'name' => 'San Francisco SBDC', 'region' => 'SBA' ),
			68  => array( 'name' => 'San Joaquin SBDC', 'region' => 'SBA' ),
			69  => array( 'name' => 'San Mateo SBDC', 'region' => 'SBA' ),
			9   => array( 'name' => 'Santa Cruz SBDC', 'region' => 'SBA' ),
			40  => array( 'name' => 'Shasta-Cascade SBDC', 'region' => 'SBA' ),
			43  => array( 'name' => 'Sierra SBDC', 'region' => 'SBA' ),
			70  => array( 'name' => 'Silicon Valley SBDC', 'region' => 'SBA' ),
			18  => array( 'name' => 'Solano-Napa SBDC', 'region' => 'SBA' ),
			73  => array( 'name' => 'Sonoma SBDC', 'region' => 'SBA' ),

			// SBA Lead Center
			23  => array( 'name' => 'Northern California SBDC Regional Lead Center', 'region' => 'SBA-LC' ),

			// SBA Special Programs
			63  => array( 'name' => 'NorCal EATS', 'region' => 'SBA-SP' ),
			47  => array( 'name' => 'Regional Training', 'region' => 'SBA-SP' ),
			34  => array( 'name' => 'Tech Futures Group', 'region' => 'SBA-SP' ),
			38  => array( 'name' => 'The Finance Center', 'region' => 'SBA-SP' ),
			60  => array( 'name' => 'The Inclusivity Project', 'region' => 'SBA-SP' ),

			// Affiliates
			97  => array( 'name' => 'California Black Chamber', 'region' => 'AFFILIATE' ),
			105 => array( 'name' => 'Lake County SBDC', 'region' => 'AFFILIATE' ),
			108 => array( 'name' => 'Pitch Globally', 'region' => 'AFFILIATE' ),
			75  => array( 'name' => 'SBDCtech @ UCB Haas', 'region' => 'AFFILIATE' ),
			94  => array( 'name' => 'Silicon Valley Successes', 'region' => 'AFFILIATE' ),

			// Fictitious (Internal/Special Programs)
			109 => array( 'name' => '~AIU', 'region' => 'FICTITIOUS' ),
			87  => array( 'name' => '~Beauty Boss', 'region' => 'FICTITIOUS' ),
			84  => array( 'name' => '~CA Shop Small', 'region' => 'FICTITIOUS' ),
			95  => array( 'name' => '~Hola SBDC', 'region' => 'FICTITIOUS' ),
			106 => array( 'name' => '~ProBiz', 'region' => 'FICTITIOUS' ),
			86  => array( 'name' => '~San Francisco Grant Program', 'region' => 'FICTITIOUS' ),
			96  => array( 'name' => '~SBDC Health', 'region' => 'FICTITIOUS' ),
			85  => array( 'name' => '~Source Diverse Source Local', 'region' => 'FICTITIOUS' ),
		);


		public static function get_instance() {
			if ( self::$instance === null ) {
				self::$instance = new self();
			}
			return self::$instance;
		}


		/**
		 * Get all available centers
		 * @return array Center list with ID as key
		 */
		public static function get_centers() {
			return self::$centers;
		}


		/**
		 * Get center name by ID
		 * @param int $center_id
		 * @return string|null Center name or null if not found
		 */
		public static function get_center_name( $center_id ) {
			return isset( self::$centers[ $center_id ] ) ? self::$centers[ $center_id ]['name'] : null;
		}


		public static function init() {
			if ( self::$init ) return;
			self::$init = true;

			add_action( 'admin_menu', array( __CLASS__, 'add_admin_menu' ) );
			add_action( 'admin_init', array( __CLASS__, 'handle_csv_upload' ) );
			add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_admin_styles' ) );
		}


		public static function add_admin_menu() {
			add_submenu_page(
				'gf_edit_forms',
				'Neoserra CSV Import',
				'CSV Import',
				'manage_options',
				'neoserra-csv-import',
				array( __CLASS__, 'render_admin_page' )
			);
		}


		public static function enqueue_admin_styles( $hook ) {
			if ( $hook !== 'forms_page_neoserra-csv-import' ) return;

			wp_add_inline_style( 'wp-admin', '
				.neoserra-import-wrap { max-width: 1200px; }
				.neoserra-import-wrap .card { background: #fff; border: 1px solid #ccd0d4; padding: 20px; margin-bottom: 20px; }
				.neoserra-import-wrap .results-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
				.neoserra-import-wrap .results-table th,
				.neoserra-import-wrap .results-table td { padding: 10px; border: 1px solid #ccd0d4; text-align: left; }
				.neoserra-import-wrap .results-table th { background: #f1f1f1; }
				.neoserra-import-wrap .status-success { color: #46b450; }
				.neoserra-import-wrap .status-error { color: #dc3232; }
				.neoserra-import-wrap .status-skipped { color: #ffb900; }
				.neoserra-import-wrap .error-details { font-size: 12px; color: #666; margin-top: 5px; }
				.neoserra-import-wrap .summary-box { display: inline-block; padding: 15px 25px; margin-right: 15px; border-radius: 4px; }
				.neoserra-import-wrap .summary-success { background: #d4edda; border: 1px solid #c3e6cb; }
				.neoserra-import-wrap .summary-error { background: #f8d7da; border: 1px solid #f5c6cb; }
				.neoserra-import-wrap .summary-total { background: #e2e3e5; border: 1px solid #d6d8db; }
				.neoserra-import-wrap .field-mapping { background: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 4px; }
				.neoserra-import-wrap .field-mapping code { background: #e1e1e1; padding: 2px 6px; border-radius: 3px; }
			' );
		}


		public static function render_admin_page() {
			?>
			<div class="wrap neoserra-import-wrap">
				<h1>Neoserra CSV Batch Import</h1>

				<div class="card">
					<h2>Upload CSV File</h2>
					<p>Upload a CSV file containing client records to import into Neoserra. The importer will attempt to match or create contacts and clients based on the email address.</p>

					<form method="post" enctype="multipart/form-data" action="">
						<?php wp_nonce_field( 'neoserra_csv_import', 'neoserra_csv_nonce' ); ?>

						<table class="form-table">
							<tr>
								<th scope="row"><label for="csv_file">CSV File</label></th>
								<td>
									<input type="file" name="csv_file" id="csv_file" accept=".csv,.txt" required />
									<p class="description">Upload a CSV file with client records.</p>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="center_id">Destination Center</label></th>
								<td>
									<select name="center_id" id="center_id" style="min-width: 350px;">
										<?php
										// Group centers by region
										$grouped = array(
											'SBA' => array(),
											'SBA-LC' => array(),
											'SBA-SP' => array(),
											'AFFILIATE' => array(),
											'FICTITIOUS' => array(),
										);
										foreach ( self::$centers as $id => $center ) {
											$grouped[ $center['region'] ][ $id ] = $center['name'];
										}

										// Output grouped options
										$region_labels = array(
											'SBA' => 'SBA Centers',
											'SBA-LC' => 'SBA Lead Center',
											'SBA-SP' => 'SBA Special Programs',
											'AFFILIATE' => 'Affiliates',
											'FICTITIOUS' => 'Special Programs (Fictitious)',
										);
										foreach ( $grouped as $region => $centers ) :
											if ( empty( $centers ) ) continue;
											asort( $centers ); // Sort alphabetically
										?>
											<optgroup label="<?php echo esc_attr( $region_labels[ $region ] ); ?>">
												<?php foreach ( $centers as $id => $name ) : ?>
													<option value="<?php echo esc_attr( $id ); ?>" <?php selected( $id, self::$default_center_id ); ?>>
														<?php echo esc_html( $name ); ?> (<?php echo esc_html( $id ); ?>)
													</option>
												<?php endforeach; ?>
											</optgroup>
										<?php endforeach; ?>
									</select>
									<p class="description">Select the SBDC center to send these records to. Can be overridden per-row with a "Center ID" column in the CSV.</p>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="is_intake">Process as Intake</label></th>
								<td>
									<input type="checkbox" name="is_intake" id="is_intake" value="1" />
									<label for="is_intake">Create new clients as intake records</label>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="update_existing">Update Existing</label></th>
								<td>
									<input type="checkbox" name="update_existing" id="update_existing" value="1" checked />
									<label for="update_existing">Update existing records if email match is found</label>
								</td>
							</tr>
							<tr>
								<th scope="row"><label for="dry_run">Dry Run</label></th>
								<td>
									<input type="checkbox" name="dry_run" id="dry_run" value="1" />
									<label for="dry_run">Preview import without making changes (recommended for first run)</label>
								</td>
							</tr>
						</table>

						<?php submit_button( 'Import CSV', 'primary', 'submit_csv_import' ); ?>
					</form>
				</div>

				<div class="card">
					<h2>Supported CSV Formats</h2>
					<p>This importer supports <strong>two formats</strong>: Gravity Forms CSV exports and simplified manual CSVs.</p>

					<div class="field-mapping">
						<h3>Option 1: Gravity Forms Export (Recommended)</h3>
						<p>Export entries directly from Gravity Forms using <strong>Forms → Entries → Export</strong>. The importer recognizes these column names:</p>

						<h4>Contact Fields:</h4>
						<ul>
							<li><code>Name (First)</code> / <code>Name (Last)</code> - Contact name</li>
							<li><code>Email</code> or <code>PC Email</code> - Email address (required)</li>
							<li><code>Phone</code> or <code>PC Work Phone</code> - Phone number</li>
							<li><code>Home Address (Street Address)</code>, <code>Home Address (City)</code>, <code>Home Address (State / Province)</code>, <code>Home Address (ZIP / Postal Code)</code></li>
						</ul>

						<h4>Business Fields:</h4>
						<ul>
							<li><code>Are you in business?</code> or <code>Company/Initial Status</code> - Status (B=In Business, P=Pre-venture)</li>
							<li><code>Business Name</code> or <code>Company Name</code></li>
							<li><code>Date Business Established</code></li>
							<li><code>Business Address (Street Address)</code>, <code>Business Address (City)</code>, etc.</li>
							<li><code>In a few sentences, tell us about your core product(s)...</code> - Business description</li>
							<li><code>In a few sentences, tell us about your business idea...</code> - Business idea (fallback)</li>
							<li><code>Your Position in the Company</code> - Position</li>
							<li><code>Referred by</code> - Referral source</li>
							<li><code>Signature</code>, <code>Privacy Release</code></li>
						</ul>

						<h4>Program Field:</h4>
						<ul>
							<li><code>Program</code> - Maps to center ID automatically (e.g., "health" → Center 23)</li>
						</ul>
					</div>

					<div class="field-mapping" style="margin-top: 20px;">
						<h3>Option 2: Simplified Manual CSV</h3>
						<p>Create a simple CSV with these column names:</p>

						<h4>Required Fields:</h4>
						<ul>
							<li><code>First Name</code>, <code>Last Name</code> - Contact name</li>
							<li><code>Email</code> - Email address (required)</li>
						</ul>

						<h4>Optional Fields:</h4>
						<ul>
							<li><code>Phone</code>, <code>Address</code>, <code>City</code>, <code>State</code>, <code>Zip</code></li>
							<li><code>Company Name</code>, <code>Business Description</code></li>
							<li><code>Physical Address</code>, <code>Physical City</code>, <code>Physical State</code>, <code>Physical Zip</code></li>
							<li><code>Referral From</code>, <code>Center ID</code>, <code>Notes</code></li>
						</ul>
					</div>

					<h3>Sample CSV (Simplified Format)</h3>
					<pre style="background: #f1f1f1; padding: 15px; overflow-x: auto;">First Name,Last Name,Email,Phone,Address,City,State,Zip,Company Name,Business Description,Referral From
John,Smith,john@example.com,(555) 123-4567,123 Main St,San Jose,CA,95123,Smith Consulting,Mobile app development,IW
Jane,Doe,jane@example.com,(555) 987-6543,456 Oak Ave,Oakland,CA,94612,Jane's Bakery,Organic bakery and cafe,O</pre>
				</div>

				<?php self::display_import_results(); ?>
			</div>
			<?php
		}


		public static function handle_csv_upload() {
			if ( ! isset( $_POST['submit_csv_import'] ) ) return;
			if ( ! isset( $_POST['neoserra_csv_nonce'] ) || ! wp_verify_nonce( $_POST['neoserra_csv_nonce'], 'neoserra_csv_import' ) ) {
				wp_die( 'Security check failed.' );
			}
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_die( 'You do not have permission to perform this action.' );
			}

			if ( ! isset( $_FILES['csv_file'] ) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK ) {
				set_transient( 'neoserra_import_error', 'Failed to upload file. Please try again.', 60 );
				return;
			}

			$file = $_FILES['csv_file']['tmp_name'];
			$center_id = isset( $_POST['center_id'] ) ? intval( $_POST['center_id'] ) : self::$default_center_id;
			$is_intake = isset( $_POST['is_intake'] ) && $_POST['is_intake'] == '1';
			$update_existing = isset( $_POST['update_existing'] ) && $_POST['update_existing'] == '1';
			$dry_run = isset( $_POST['dry_run'] ) && $_POST['dry_run'] == '1';

			$results = self::process_csv_file( $file, $center_id, $is_intake, $update_existing, $dry_run );
			$results['center_id'] = $center_id;
			$results['center_name'] = self::get_center_name( $center_id );

			set_transient( 'neoserra_import_results', $results, 300 ); // Store for 5 minutes
		}


		public static function process_csv_file( $file_path, $center_id, $is_intake = false, $update_existing = true, $dry_run = false ) {
			$results = array(
				'total'     => 0,
				'success'   => 0,
				'errors'    => 0,
				'skipped'   => 0,
				'dry_run'   => $dry_run,
				'rows'      => array(),
			);

			if ( ! file_exists( $file_path ) ) {
				$results['error'] = 'File not found.';
				return $results;
			}

			// Read CSV file
			$handle = fopen( $file_path, 'r' );
			if ( ! $handle ) {
				$results['error'] = 'Could not open file.';
				return $results;
			}

			// Get header row
			$headers = fgetcsv( $handle );
			if ( ! $headers ) {
				fclose( $handle );
				$results['error'] = 'Could not read CSV headers.';
				return $results;
			}

			// Clean headers (remove BOM, trim whitespace)
			$headers = array_map( function( $h ) {
				$h = preg_replace( '/^\xEF\xBB\xBF/', '', $h ); // Remove UTF-8 BOM
				return trim( $h );
			}, $headers );

			$row_number = 1;
			while ( ( $row = fgetcsv( $handle ) ) !== false ) {
				$row_number++;
				$results['total']++;

				// Skip empty rows
				if ( empty( array_filter( $row ) ) ) {
					$results['skipped']++;
					$results['rows'][] = array(
						'row'     => $row_number,
						'status'  => 'skipped',
						'message' => 'Empty row',
						'data'    => array(),
					);
					continue;
				}

				// Create associative array from row
				$data = array();
				foreach ( $headers as $index => $header ) {
					if ( isset( $row[ $index ] ) ) {
						$data[ $header ] = trim( $row[ $index ] );
					}
				}

				// Process this row
				$row_result = self::process_row( $data, $center_id, $is_intake, $update_existing, $dry_run );
				$row_result['row'] = $row_number;
				$row_result['data'] = $data;

				if ( $row_result['status'] === 'success' ) {
					$results['success']++;
				} elseif ( $row_result['status'] === 'error' ) {
					$results['errors']++;
				} else {
					$results['skipped']++;
				}

				$results['rows'][] = $row_result;
			}

			fclose( $handle );
			return $results;
		}


		private static function process_row( $data, $center_id, $is_intake, $update_existing, $dry_run ) {
			$result = array(
				'status'  => 'error',
				'message' => '',
				'contact_id' => null,
				'client_id'  => null,
			);

			// Parse and normalize the data
			$parsed = self::parse_row_data( $data, $center_id );

			// Validate required fields
			if ( empty( $parsed['contact']['email'] ) ) {
				$result['message'] = 'Missing required field: Email';
				return $result;
			}

			if ( empty( $parsed['contact']['first'] ) && empty( $parsed['contact']['last'] ) ) {
				$result['message'] = 'Missing required field: Name';
				return $result;
			}

			// Dry run - just validate
			if ( $dry_run ) {
				$result['status'] = 'success';
				$result['message'] = 'Validation passed (dry run)';
				$result['parsed_data'] = $parsed;
				return $result;
			}

			// Check for existing contact
			$contact_id = null;
			$client_id = null;
			$is_update = false;

			$contact_search = Crown_Neoserra_Records_Api::get_contacts( array( 'email' => $parsed['contact']['email'] ) );
			if ( is_object( $contact_search ) && property_exists( $contact_search, 'rows' ) && ! empty( $contact_search->rows ) ) {
				$contact_id = $contact_search->rows[0]->indivId;

				// Also check for existing client
				$client_search = Crown_Neoserra_Records_Api::get_clients( array( 'email' => $parsed['contact']['email'] ) );
				if ( is_object( $client_search ) && property_exists( $client_search, 'rows' ) && ! empty( $client_search->rows ) ) {
					$client_id = $client_search->rows[0]->clientId;
					$is_update = true;
				}
			}

			// If existing record found but update not allowed, skip
			if ( $is_update && ! $update_existing ) {
				$result['status'] = 'skipped';
				$result['message'] = 'Existing record found, update disabled';
				$result['contact_id'] = $contact_id;
				$result['client_id'] = $client_id;
				return $result;
			}

			// Perform API calls
			try {
				if ( $is_update ) {
					// Update existing records
					$contact_response = Crown_Neoserra_Records_Api::update_contact( $contact_id, $parsed['contact'] );
					$errors = self::get_api_errors( $contact_response, 'update_contact' );

					if ( ! empty( $errors ) ) {
						$result['message'] = implode( '; ', $errors );
						return $result;
					}

					if ( $client_id && ! empty( $parsed['client'] ) ) {
						$client_response = Crown_Neoserra_Records_Api::update_client( $client_id, $parsed['client'] );
						$errors = self::get_api_errors( $client_response, 'update_client' );

						if ( ! empty( $errors ) ) {
							$result['message'] = implode( '; ', $errors );
							return $result;
						}
					}

					$result['status'] = 'success';
					$result['message'] = 'Updated existing record';
					$result['contact_id'] = $contact_id;
					$result['client_id'] = $client_id;

				} else {
					// Create new records
					// Build combined client+contact payload
					$client_data = array_merge( $parsed['client'], array(
						'contact' => $parsed['contact'],
						'intake'  => $is_intake,
					) );

					// Ensure required fields have defaults
					if ( empty( $client_data['company'] ) ) {
						$client_data['company'] = 'Undefined';
					}

					// Ensure product field has a value (required by Neoserra)
					if ( empty( $client_data['product'] ) ) {
						$client_data['product'] = 'Not specified';
					}

					// Ensure physical address fields are set (required by Neoserra)
					if ( empty( $client_data['physzip'] ) && ! empty( $parsed['contact']['mailzip'] ) ) {
						$client_data['physzip'] = $parsed['contact']['mailzip'];
					}
					if ( empty( $client_data['physaddr'] ) && ! empty( $parsed['contact']['mailaddr'] ) ) {
						$client_data['physaddr'] = $parsed['contact']['mailaddr'];
					}
					if ( empty( $client_data['physcity'] ) && ! empty( $parsed['contact']['mailcity'] ) ) {
						$client_data['physcity'] = $parsed['contact']['mailcity'];
					}

					// Log what we're sending for debugging (can be removed later)
					error_log( 'Neoserra CSV Import - Creating client: ' . json_encode( $client_data ) );

					$client_response = Crown_Neoserra_Records_Api::create_client( $client_data );
					$errors = self::get_api_errors( $client_response, 'create_client' );

					if ( ! empty( $errors ) ) {
						$result['message'] = implode( '; ', $errors );
						return $result;
					}

					$result['status'] = 'success';
					$result['message'] = 'Created new record';
					$result['client_id'] = is_object( $client_response ) && property_exists( $client_response, 'id' ) ? $client_response->id : null;
				}

			} catch ( Exception $e ) {
				$result['message'] = 'Exception: ' . $e->getMessage();
			}

			return $result;
		}


		private static function parse_row_data( $data, $default_center_id ) {
			$contact = array(
				'centerId' => $default_center_id,
			);
			$client = array(
				'centerId' => $default_center_id,
			);

			// First pass: Check for program field to determine center ID
			foreach ( $data as $column => $value ) {
				if ( empty( $value ) ) continue;
				$field = isset( self::$field_mapping[ $column ] ) ? self::$field_mapping[ $column ] : null;

				if ( $field === 'program' && isset( self::$program_center_mapping[ strtolower( $value ) ] ) ) {
					$center_id = self::$program_center_mapping[ strtolower( $value ) ];
					$contact['centerId'] = $center_id;
					$client['centerId'] = $center_id;
				}
			}

			// Second pass: Map all other fields
			foreach ( $data as $column => $value ) {
				if ( empty( $value ) ) continue;

				$field = isset( self::$field_mapping[ $column ] ) ? self::$field_mapping[ $column ] : null;

				// Skip if no mapping found
				if ( ! $field ) continue;

				switch ( $field ) {
					case 'full_name':
						// Parse "First Last" format
						$name_parts = self::parse_name( $value );
						if ( ! isset( $contact['first'] ) || empty( $contact['first'] ) ) {
							$contact['first'] = $name_parts['first'];
						}
						if ( ! isset( $contact['last'] ) || empty( $contact['last'] ) ) {
							$contact['last'] = $name_parts['last'];
						}
						break;

					case 'address_full':
						// Parse "Street, City, ST ZIP" format
						$address_parts = self::parse_address( $value );
						if ( ! empty( $address_parts['street'] ) ) {
							$contact['mailaddr'] = $address_parts['street'];
							if ( empty( $client['physaddr'] ) ) {
								$client['physaddr'] = $address_parts['street'];
							}
						}
						if ( ! empty( $address_parts['city'] ) ) {
							$contact['mailcity'] = $address_parts['city'];
							if ( empty( $client['physcity'] ) ) {
								$client['physcity'] = $address_parts['city'];
							}
						}
						if ( ! empty( $address_parts['state'] ) ) {
							$contact['mailst'] = $address_parts['state'];
							if ( empty( $client['physst'] ) ) {
								$client['physst'] = $address_parts['state'];
							}
						}
						if ( ! empty( $address_parts['zip'] ) ) {
							$contact['mailzip'] = $address_parts['zip'];
							if ( empty( $client['physzip'] ) ) {
								$client['physzip'] = $address_parts['zip'];
							}
						}
						break;

					case 'statusInit':
						// Map status values (B -> I, P -> P)
						$client['statusInit'] = isset( self::$status_mapping[ $value ] ) ? self::$status_mapping[ $value ] : $value;
						break;

					case 'emailingLists':
						// Convert Yes/No to boolean
						$client['emailingLists'] = ( strtolower( $value ) === 'yes' || $value === '1' ) ? true : false;
						break;

					case 'agreement':
						$client['agreement'] = ( strtolower( $value ) === 'yes' || $value === '1' ) ? true : false;
						break;

					case 'allowSbaContact':
						// Privacy release - Yes/No
						$client['allowSbaContact'] = ( strtolower( $value ) === 'yes' || $value === '1' ) ? true : false;
						break;

					case 'centerId':
						$contact['centerId'] = intval( $value );
						$client['centerId'] = intval( $value );
						break;

					case 'program':
						// Already handled in first pass, skip
						break;

					// Contact-specific fields
					case 'first':
					case 'last':
					case 'email':
					case 'phone':
					case 'phone2':
					case 'mobileph':
					case 'mailaddr':
					case 'mailcity':
					case 'mailst':
					case 'mailzip':
					case 'gender':
					case 'veteran':
					case 'ethnic':
					case 'dob':
					case 'position':
						$contact[ $field ] = $value;
						break;

					// Client-specific fields
					case 'product':
					case 'product_alt':
					case 'company':
					case 'physaddr':
					case 'physcity':
					case 'physst':
					case 'physzip':
					case 'reffrom':
					case 'reffromDesc':
					case 'notes':
					case 'signature':
					case 'estab':
						$client[ $field ] = $value;
						break;
				}
			}

			// Handle product fallback (use product_alt if product is empty)
			if ( ( ! isset( $client['product'] ) || empty( $client['product'] ) ) && isset( $client['product_alt'] ) && ! empty( $client['product_alt'] ) ) {
				$client['product'] = $client['product_alt'];
			}
			unset( $client['product_alt'] );

			// Copy contact address to client physical address if not set
			if ( empty( $client['physaddr'] ) && ! empty( $contact['mailaddr'] ) ) {
				$client['physaddr'] = $contact['mailaddr'];
			}
			if ( empty( $client['physcity'] ) && ! empty( $contact['mailcity'] ) ) {
				$client['physcity'] = $contact['mailcity'];
			}
			if ( empty( $client['physst'] ) && ! empty( $contact['mailst'] ) ) {
				$client['physst'] = $contact['mailst'];
			}
			if ( empty( $client['physzip'] ) && ! empty( $contact['mailzip'] ) ) {
				$client['physzip'] = $contact['mailzip'];
			}

			return array(
				'contact' => $contact,
				'client'  => $client,
			);
		}


		private static function parse_name( $full_name ) {
			$parts = preg_split( '/\s+/', trim( $full_name ), 2 );
			return array(
				'first' => isset( $parts[0] ) ? $parts[0] : '',
				'last'  => isset( $parts[1] ) ? $parts[1] : '',
			);
		}


		private static function parse_address( $address_string ) {
			$result = array(
				'street' => '',
				'city'   => '',
				'state'  => '',
				'zip'    => '',
			);

			// Try to parse "Street, City, ST ZIP" or "Street City, ST ZIP" formats
			// Common patterns:
			// "123 Main St, San Jose, CA 95123"
			// "123 Main St San Jose, CA 95123"

			// Extract ZIP code first
			if ( preg_match( '/\b(\d{5}(?:-\d{4})?)\s*$/', $address_string, $zip_match ) ) {
				$result['zip'] = $zip_match[1];
				$address_string = trim( preg_replace( '/\b\d{5}(?:-\d{4})?\s*$/', '', $address_string ) );
			}

			// Extract state (2-letter code before ZIP)
			if ( preg_match( '/,?\s*([A-Z]{2})\s*$/i', $address_string, $state_match ) ) {
				$result['state'] = strtoupper( $state_match[1] );
				$address_string = trim( preg_replace( '/,?\s*[A-Z]{2}\s*$/i', '', $address_string ) );
			}

			// Split remaining by comma
			$parts = array_map( 'trim', explode( ',', $address_string ) );

			if ( count( $parts ) >= 2 ) {
				// Last part is city, rest is street
				$result['city'] = array_pop( $parts );
				$result['street'] = implode( ', ', $parts );
			} else {
				// Try to guess - look for common city patterns
				$result['street'] = $address_string;
			}

			// Handle "United States" or "Map It" suffixes
			$result['street'] = preg_replace( '/\s*(United States|Map It)\s*$/i', '', $result['street'] );
			$result['city'] = preg_replace( '/\s*(United States|Map It)\s*$/i', '', $result['city'] );

			return $result;
		}


		private static function get_api_errors( $response, $context ) {
			$errors = array();

			if ( ! is_object( $response ) ) {
				$errors[] = "[$context] No API response.";
			} elseif ( property_exists( $response, 'errors' ) ) {
				foreach ( $response->errors as $error ) {
					$error = (array) $error;
					$field_info = ! empty( $error['field'] ) ? "[{$error['field']}] " : '';
					$errors[] = "[$context] {$field_info}" . ( $error['error'] ?? 'Unknown error' );
				}
			} elseif ( property_exists( $response, 'exception' ) ) {
				$errors[] = "[$context] " . $response->exception;
			}

			return $errors;
		}


		private static function display_import_results() {
			$error = get_transient( 'neoserra_import_error' );
			if ( $error ) {
				delete_transient( 'neoserra_import_error' );
				echo '<div class="notice notice-error"><p>' . esc_html( $error ) . '</p></div>';
				return;
			}

			$results = get_transient( 'neoserra_import_results' );
			if ( ! $results ) return;

			delete_transient( 'neoserra_import_results' );
			?>
			<div class="card">
				<h2>Import Results <?php echo $results['dry_run'] ? '(Dry Run Preview)' : ''; ?></h2>

				<?php if ( ! empty( $results['center_name'] ) ) : ?>
					<p style="font-size: 14px; margin-bottom: 15px;">
						<strong>Destination:</strong> <?php echo esc_html( $results['center_name'] ); ?>
						(Center ID: <?php echo esc_html( $results['center_id'] ); ?>)
					</p>
				<?php endif; ?>

				<div class="summary-boxes" style="margin: 20px 0;">
					<div class="summary-box summary-total">
						<strong style="font-size: 24px;"><?php echo esc_html( $results['total'] ); ?></strong><br>
						Total Rows
					</div>
					<div class="summary-box summary-success">
						<strong style="font-size: 24px;"><?php echo esc_html( $results['success'] ); ?></strong><br>
						<?php echo $results['dry_run'] ? 'Valid' : 'Successful'; ?>
					</div>
					<div class="summary-box summary-error">
						<strong style="font-size: 24px;"><?php echo esc_html( $results['errors'] ); ?></strong><br>
						<?php echo $results['dry_run'] ? 'Invalid' : 'Errors'; ?>
					</div>
				</div>

				<?php if ( ! empty( $results['rows'] ) ) : ?>
					<h3>Row Details</h3>
					<table class="results-table">
						<thead>
							<tr>
								<th style="width: 60px;">Row</th>
								<th style="width: 100px;">Status</th>
								<th style="width: 200px;">Email</th>
								<th style="width: 200px;">Name</th>
								<th>Message</th>
								<th style="width: 120px;">IDs</th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ( $results['rows'] as $row ) :
								$status_class = 'status-' . esc_attr( $row['status'] );
								$email = isset( $row['data']['PC Email'] ) ? $row['data']['PC Email'] : ( isset( $row['data']['Email'] ) ? $row['data']['Email'] : '-' );
								$name = isset( $row['data']['Primary Contact'] ) ? $row['data']['Primary Contact'] : ( isset( $row['data']['First Name'] ) ? $row['data']['First Name'] . ' ' . ( $row['data']['Last Name'] ?? '' ) : '-' );
							?>
								<tr>
									<td><?php echo esc_html( $row['row'] ); ?></td>
									<td class="<?php echo $status_class; ?>">
										<strong><?php echo esc_html( ucfirst( $row['status'] ) ); ?></strong>
									</td>
									<td><?php echo esc_html( $email ); ?></td>
									<td><?php echo esc_html( $name ); ?></td>
									<td>
										<?php echo esc_html( $row['message'] ); ?>
									</td>
									<td>
										<?php if ( $row['contact_id'] ) : ?>
											C: <?php echo esc_html( $row['contact_id'] ); ?><br>
										<?php endif; ?>
										<?php if ( $row['client_id'] ) : ?>
											CL: <?php echo esc_html( $row['client_id'] ); ?>
										<?php endif; ?>
									</td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>

					<?php
					// Generate downloadable CSV of failed rows
					$failed_rows = array_filter( $results['rows'], function( $r ) { return $r['status'] === 'error'; } );
					if ( ! empty( $failed_rows ) && ! $results['dry_run'] ) :
					?>
						<h3 style="margin-top: 30px;">Export Failed Rows</h3>
						<p>Download a CSV of the rows that failed to import, so you can fix them and re-upload.</p>
						<form method="post" action="">
							<?php wp_nonce_field( 'neoserra_export_failed', 'neoserra_export_nonce' ); ?>
							<input type="hidden" name="failed_rows" value="<?php echo esc_attr( base64_encode( json_encode( $failed_rows ) ) ); ?>" />
							<?php submit_button( 'Download Failed Rows CSV', 'secondary', 'export_failed_csv' ); ?>
						</form>
					<?php endif; ?>

				<?php endif; ?>
			</div>
			<?php
		}


		/**
		 * Export failed rows as CSV
		 */
		public static function export_failed_rows() {
			if ( ! isset( $_POST['export_failed_csv'] ) ) return;
			if ( ! isset( $_POST['neoserra_export_nonce'] ) || ! wp_verify_nonce( $_POST['neoserra_export_nonce'], 'neoserra_export_failed' ) ) return;
			if ( ! current_user_can( 'manage_options' ) ) return;

			$failed_rows = json_decode( base64_decode( $_POST['failed_rows'] ), true );
			if ( empty( $failed_rows ) ) return;

			// Get all unique headers from failed rows
			$headers = array( 'Error Message' );
			foreach ( $failed_rows as $row ) {
				if ( isset( $row['data'] ) ) {
					$headers = array_merge( $headers, array_keys( $row['data'] ) );
				}
			}
			$headers = array_unique( $headers );

			// Output CSV
			header( 'Content-Type: text/csv' );
			header( 'Content-Disposition: attachment; filename="neoserra_failed_imports_' . date( 'Y-m-d_His' ) . '.csv"' );

			$output = fopen( 'php://output', 'w' );
			fputcsv( $output, $headers );

			foreach ( $failed_rows as $row ) {
				$csv_row = array( $row['message'] );
				foreach ( array_slice( $headers, 1 ) as $header ) {
					$csv_row[] = isset( $row['data'][ $header ] ) ? $row['data'][ $header ] : '';
				}
				fputcsv( $output, $csv_row );
			}

			fclose( $output );
			exit;
		}

	}
}

// Initialize on admin_init to handle exports
add_action( 'admin_init', array( 'Neoserra_CSV_Batch_Import', 'export_failed_rows' ), 5 );
