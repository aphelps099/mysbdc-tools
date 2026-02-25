'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════
   Smart 641 — Internationalization
   Supported: en, es, vi, zh, fr
   ═══════════════════════════════════════════════════════ */

export type Locale = 'en' | 'es' | 'vi' | 'zh' | 'fr';

export const LOCALES: { code: Locale; flag: string; label: string }[] = [
  { code: 'en', flag: '🇺🇸', label: 'English' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
];

// ─── Translation dictionary ─────────────────────────────

const translations: Record<string, Record<Locale, string>> = {
  // ── Navigation ──
  'nav.continue': { en: 'Continue', es: 'Continuar', vi: 'Tiếp tục', zh: '继续', fr: 'Continuer' },
  'nav.back': { en: 'Back', es: 'Atrás', vi: 'Quay lại', zh: '返回', fr: 'Retour' },
  'nav.skip': { en: 'Skip', es: 'Omitir', vi: 'Bỏ qua', zh: '跳过', fr: 'Passer' },
  'nav.reviewSubmit': { en: 'Review & Submit', es: 'Revisar y enviar', vi: 'Xem lại & Gửi', zh: '审核并提交', fr: 'Vérifier et soumettre' },

  // ── Welcome Step ──
  'welcome.title': { en: "Let\u2019s get you started", es: 'Comencemos', vi: 'Hãy bắt đầu', zh: '让我们开始吧', fr: 'Commençons' },
  'welcome.subtitle': { en: 'This information creates your client profile and connects you with your local SBDC.', es: 'Esta información crea su perfil de cliente y lo conecta con su SBDC local.', vi: 'Thông tin này tạo hồ sơ khách hàng và kết nối bạn với SBDC địa phương.', zh: '此信息将创建您的客户档案并将您与当地SBDC联系起来。', fr: 'Ces informations créent votre profil client et vous connectent à votre SBDC local.' },
  'welcome.firstName': { en: 'First Name', es: 'Nombre', vi: 'Tên', zh: '名', fr: 'Prénom' },
  'welcome.lastName': { en: 'Last Name', es: 'Apellido', vi: 'Họ', zh: '姓', fr: 'Nom' },
  'welcome.email': { en: 'Email', es: 'Correo electrónico', vi: 'Email', zh: '电子邮件', fr: 'E-mail' },
  'welcome.phone': { en: 'Phone', es: 'Teléfono', vi: 'Điện thoại', zh: '电话', fr: 'Téléphone' },
  'welcome.address': { en: 'Home Address', es: 'Dirección', vi: 'Địa chỉ nhà', zh: '家庭住址', fr: 'Adresse' },
  'welcome.city': { en: 'City', es: 'Ciudad', vi: 'Thành phố', zh: '城市', fr: 'Ville' },
  'welcome.state': { en: 'State', es: 'Estado', vi: 'Tiểu bang', zh: '州', fr: 'État' },
  'welcome.zip': { en: 'ZIP Code', es: 'Código postal', vi: 'Mã bưu chính', zh: '邮编', fr: 'Code postal' },
  'welcome.yourSbdc': { en: 'Your SBDC:', es: 'Su SBDC:', vi: 'SBDC của bạn:', zh: '您的SBDC：', fr: 'Votre SBDC :' },

  // ── Business Status Step ──
  'status.title': { en: 'Are you currently in business?', es: '¿Tiene actualmente un negocio?', vi: 'Bạn hiện đang kinh doanh không?', zh: '您目前是否在经营企业？', fr: 'Êtes-vous actuellement en affaires ?' },
  'status.subtitle': { en: 'To be considered in business, you must meet at least one: acquired debt or equity, incurred expenses, sold a product, or paid employees.', es: 'Para considerarse en negocio, debe cumplir al menos uno: haber adquirido deuda o capital, incurrido gastos, vendido un producto o pagado empleados.', vi: 'Để được coi là đang kinh doanh, bạn phải đáp ứng ít nhất một: đã vay nợ hoặc góp vốn, phát sinh chi phí, bán sản phẩm hoặc trả lương nhân viên.', zh: '要被视为在经营中，您必须满足以下至少一项：已获得债务或股权、产生费用、销售产品或支付员工工资。', fr: 'Pour être considéré en affaires, vous devez remplir au moins un critère : avoir acquis une dette ou des capitaux, engagé des dépenses, vendu un produit ou payé des employés.' },
  'status.yesTitle': { en: "Yes, I\u2019m in business", es: 'Sí, tengo un negocio', vi: 'Có, tôi đang kinh doanh', zh: '是的，我在经营企业', fr: "Oui, j\u2019ai une entreprise" },
  'status.yesDesc': { en: "I\u2019ve acquired debt or equity, incurred expenses, sold products, or paid employees", es: 'He adquirido deuda o capital, incurrido gastos, vendido productos o pagado empleados', vi: 'Tôi đã vay nợ hoặc góp vốn, phát sinh chi phí, bán sản phẩm hoặc trả lương nhân viên', zh: '我已获得债务或股权、产生费用、销售产品或支付员工工资', fr: "J\u2019ai acquis une dette ou des capitaux, engagé des dépenses, vendu des produits ou payé des employés" },
  'status.noTitle': { en: 'Not yet', es: 'Todavía no', vi: 'Chưa', zh: '还没有', fr: 'Pas encore' },
  'status.noDesc': { en: "I\u2019m exploring or planning to start a business", es: 'Estoy explorando o planeando iniciar un negocio', vi: 'Tôi đang tìm hiểu hoặc lên kế hoạch kinh doanh', zh: '我正在探索或计划创业', fr: "J\u2019explore ou je prévois de créer une entreprise" },

  // ── Business Details Step ──
  'details.titleBiz': { en: 'Tell us about your business', es: 'Cuéntenos sobre su negocio', vi: 'Hãy cho chúng tôi biết về doanh nghiệp của bạn', zh: '告诉我们您的企业情况', fr: 'Parlez-nous de votre entreprise' },
  'details.titleIdea': { en: 'Describe your business idea', es: 'Describa su idea de negocio', vi: 'Mô tả ý tưởng kinh doanh của bạn', zh: '描述您的商业想法', fr: 'Décrivez votre idée d\u2019entreprise' },
  'details.subtitleBiz': { en: 'This creates your client record and helps us match you with the right advisor.', es: 'Esto crea su registro de cliente y nos ayuda a asignarle el asesor adecuado.', vi: 'Điều này tạo hồ sơ khách hàng và giúp chúng tôi kết nối bạn với tư vấn viên phù hợp.', zh: '这将创建您的客户记录，帮助我们为您匹配合适的顾问。', fr: 'Cela crée votre dossier client et nous aide à vous associer au bon conseiller.' },
  'details.subtitleIdea': { en: 'What product or service are you building? What makes it stand out?', es: '¿Qué producto o servicio está creando? ¿Qué lo hace destacar?', vi: 'Bạn đang xây dựng sản phẩm hoặc dịch vụ gì? Điều gì làm nó nổi bật?', zh: '您正在打造什么产品或服务？它有什么独特之处？', fr: 'Quel produit ou service développez-vous ? Qu\u2019est-ce qui le distingue ?' },
  'details.bizName': { en: 'Business Name', es: 'Nombre del negocio', vi: 'Tên doanh nghiệp', zh: '企业名称', fr: "Nom de l\u2019entreprise" },
  'details.dateEst': { en: 'Date Established', es: 'Fecha de establecimiento', vi: 'Ngày thành lập', zh: '成立日期', fr: "Date de création" },
  'details.bizAddress': { en: 'Business Address', es: 'Dirección del negocio', vi: 'Địa chỉ doanh nghiệp', zh: '企业地址', fr: "Adresse de l\u2019entreprise" },
  'details.city': { en: 'City', es: 'Ciudad', vi: 'Thành phố', zh: '城市', fr: 'Ville' },
  'details.state': { en: 'State', es: 'Estado', vi: 'Tiểu bang', zh: '州', fr: 'État' },
  'details.zip': { en: 'ZIP', es: 'Código postal', vi: 'Mã bưu chính', zh: '邮编', fr: 'Code postal' },
  'details.products': { en: 'Core products and/or services', es: 'Productos y/o servicios principales', vi: 'Sản phẩm và/hoặc dịch vụ chính', zh: '核心产品和/或服务', fr: 'Produits et/ou services principaux' },
  'details.position': { en: 'Your Position', es: 'Su cargo', vi: 'Chức vụ của bạn', zh: '您的职位', fr: 'Votre poste' },
  'details.website': { en: 'Website', es: 'Sitio web', vi: 'Trang web', zh: '网站', fr: 'Site web' },
  'details.optional': { en: '(optional)', es: '(opcional)', vi: '(tùy chọn)', zh: '（可选）', fr: '(facultatif)' },
  'details.posSelect': { en: 'Select...', es: 'Seleccionar...', vi: 'Chọn...', zh: '选择...', fr: 'Sélectionner...' },
  'details.posCEO': { en: 'CEO', es: 'Director ejecutivo', vi: 'Giám đốc điều hành', zh: '首席执行官', fr: 'PDG' },
  'details.posEmployee': { en: 'Employee', es: 'Empleado', vi: 'Nhân viên', zh: '员工', fr: 'Employé' },
  'details.posPartner': { en: 'Partner', es: 'Socio', vi: 'Đối tác', zh: '合伙人', fr: 'Associé' },
  'details.posPresident': { en: 'President', es: 'Presidente', vi: 'Chủ tịch', zh: '总裁', fr: 'Président' },
  'details.posSole': { en: 'Sole Proprietor', es: 'Propietario único', vi: 'Chủ sở hữu duy nhất', zh: '个体经营者', fr: 'Entrepreneur individuel' },
  'details.posVP': { en: 'Vice President', es: 'Vicepresidente', vi: 'Phó chủ tịch', zh: '副总裁', fr: 'Vice-président' },
  'details.posGM': { en: 'General Manager', es: 'Gerente general', vi: 'Tổng giám đốc', zh: '总经理', fr: 'Directeur général' },
  'details.posOwner': { en: 'Owner', es: 'Propietario', vi: 'Chủ sở hữu', zh: '业主', fr: 'Propriétaire' },

  // ── Goals Step ──
  'goals.title': { en: 'What are your goals?', es: '¿Cuáles son sus objetivos?', vi: 'Mục tiêu của bạn là gì?', zh: '您的目标是什么？', fr: 'Quels sont vos objectifs ?' },
  'goals.subtitle': { en: 'Select all that apply. This helps us match you with the right advisor and resources.', es: 'Seleccione todos los que apliquen. Esto nos ayuda a asignarle el asesor y los recursos adecuados.', vi: 'Chọn tất cả những mục phù hợp. Điều này giúp chúng tôi kết nối bạn với tư vấn viên và tài nguyên phù hợp.', zh: '选择所有适用的选项。这有助于我们为您匹配合适的顾问和资源。', fr: 'Sélectionnez tout ce qui s\u2019applique. Cela nous aide à vous associer au bon conseiller et aux bonnes ressources.' },
  'goals.accessCapital': { en: 'Access Capital / Funding', es: 'Acceder a capital / financiamiento', vi: 'Tiếp cận vốn / tài trợ', zh: '获取资金/融资', fr: 'Accéder au capital / financement' },
  'goals.startBusiness': { en: 'Start a Business', es: 'Iniciar un negocio', vi: 'Bắt đầu kinh doanh', zh: '创业', fr: 'Créer une entreprise' },
  'goals.growRevenue': { en: 'Grow Revenue', es: 'Aumentar ingresos', vi: 'Tăng doanh thu', zh: '增加收入', fr: 'Augmenter le chiffre d\u2019affaires' },
  'goals.govContracting': { en: 'Government Contracting', es: 'Contratos gubernamentales', vi: 'Hợp đồng chính phủ', zh: '政府合同', fr: 'Marchés publics' },
  'goals.buyBusiness': { en: 'Buy a Business', es: 'Comprar un negocio', vi: 'Mua doanh nghiệp', zh: '收购企业', fr: 'Acheter une entreprise' },
  'goals.export': { en: 'International Trade', es: 'Comercio internacional', vi: 'Thương mại quốc tế', zh: '国际贸易', fr: 'Commerce international' },
  'goals.technology': { en: 'Technology & Innovation', es: 'Tecnología e innovación', vi: 'Công nghệ & Đổi mới', zh: '技术与创新', fr: 'Technologie et innovation' },
  'goals.other': { en: 'Other / General Advising', es: 'Otro / Asesoría general', vi: 'Khác / Tư vấn chung', zh: '其他/一般咨询', fr: 'Autre / Conseil général' },

  // ── Programs Step ──
  'programs.title': { en: 'Interested in a specialized program?', es: '¿Interesado en un programa especializado?', vi: 'Bạn quan tâm đến chương trình chuyên biệt?', zh: '有兴趣参加专业项目吗？', fr: 'Intéressé par un programme spécialisé ?' },
  'programs.subtitle': { en: 'We offer focused programs for specific industries. Select any that apply, or skip to continue.', es: 'Ofrecemos programas enfocados para industrias específicas. Seleccione los que apliquen u omita para continuar.', vi: 'Chúng tôi cung cấp các chương trình chuyên biệt cho các ngành cụ thể. Chọn bất kỳ mục nào phù hợp hoặc bỏ qua để tiếp tục.', zh: '我们为特定行业提供专业项目。选择适用的选项，或跳过继续。', fr: 'Nous proposons des programmes ciblés pour des secteurs spécifiques. Sélectionnez ceux qui s\u2019appliquent ou passez pour continuer.' },
  'programs.probiz': { en: 'ProBiz', es: 'ProBiz', vi: 'ProBiz', zh: 'ProBiz', fr: 'ProBiz' },
  'programs.probizDesc': { en: 'Government contracting, certifications, and procurement opportunities', es: 'Contratos gubernamentales, certificaciones y oportunidades de adquisición', vi: 'Hợp đồng chính phủ, chứng nhận và cơ hội mua sắm', zh: '政府合同、认证和采购机会', fr: 'Marchés publics, certifications et opportunités d\u2019approvisionnement' },
  'programs.health': { en: 'SBDC Health', es: 'SBDC Salud', vi: 'SBDC Sức khỏe', zh: 'SBDC健康', fr: 'SBDC Santé' },
  'programs.healthDesc': { en: 'Healthcare entrepreneurs and clinician-to-CEO transitions', es: 'Emprendedores de salud y transición de médico a director ejecutivo', vi: 'Doanh nhân y tế và chuyển đổi từ bác sĩ sang giám đốc', zh: '医疗保健创业者和从医生到CEO的转型', fr: 'Entrepreneurs en santé et transition de clinicien à dirigeant' },
  'programs.eats': { en: 'SBDC Eats', es: 'SBDC Eats', vi: 'SBDC Eats', zh: 'SBDC美食', fr: 'SBDC Eats' },
  'programs.eatsDesc': { en: 'Food, restaurant, and hospitality businesses', es: 'Negocios de comida, restaurantes y hostelería', vi: 'Kinh doanh thực phẩm, nhà hàng và khách sạn', zh: '食品、餐饮和酒店业', fr: 'Entreprises de restauration et d\u2019hôtellerie' },
  'programs.manufacturing': { en: 'Roadmap 4 Innovation', es: 'Roadmap 4 Innovation', vi: 'Roadmap 4 Innovation', zh: 'Roadmap 4 Innovation', fr: 'Roadmap 4 Innovation' },
  'programs.manufacturingDesc': { en: 'Manufacturing strategy, product innovation, and supply chain optimization', es: 'Estrategia de manufactura, innovación de productos y optimización de la cadena de suministro', vi: 'Chiến lược sản xuất, đổi mới sản phẩm và tối ưu hóa chuỗi cung ứng', zh: '制造战略、产品创新和供应链优化', fr: 'Stratégie manufacturière, innovation produit et optimisation de la chaîne d\u2019approvisionnement' },
  'programs.tfg': { en: 'Tech Futures', es: 'Tech Futures', vi: 'Tech Futures', zh: 'Tech Futures', fr: 'Tech Futures' },
  'programs.tfgDesc': { en: 'Software, SaaS, BioTech, and Climate Tech ventures', es: 'Empresas de software, SaaS, biotecnología y tecnología climática', vi: 'Phần mềm, SaaS, Công nghệ sinh học và Công nghệ khí hậu', zh: '软件、SaaS、生物技术和气候技术企业', fr: 'Logiciels, SaaS, biotech et technologies climatiques' },

  // ── Capital Readiness Step ──
  'capital.title': { en: 'Capital readiness', es: 'Preparación de capital', vi: 'Sẵn sàng về vốn', zh: '资金准备', fr: 'Préparation au financement' },
  'capital.subtitle': { en: 'Help us understand your funding needs so we can connect you with the right resources.', es: 'Ayúdenos a entender sus necesidades de financiamiento para conectarle con los recursos adecuados.', vi: 'Giúp chúng tôi hiểu nhu cầu tài trợ của bạn để kết nối bạn với các tài nguyên phù hợp.', zh: '帮助我们了解您的资金需求，以便为您提供合适的资源。', fr: 'Aidez-nous à comprendre vos besoins de financement afin de vous orienter vers les bonnes ressources.' },
  'capital.whenLabel': { en: 'When do you need funding?', es: '¿Cuándo necesita financiamiento?', vi: 'Khi nào bạn cần tài trợ?', zh: '您何时需要资金？', fr: 'Quand avez-vous besoin de financement ?' },
  'capital.urgent30': { en: 'Within 30 days', es: 'Dentro de 30 días', vi: 'Trong vòng 30 ngày', zh: '30天内', fr: 'Dans les 30 jours' },
  'capital.near90': { en: '1 to 3 months', es: '1 a 3 meses', vi: '1 đến 3 tháng', zh: '1至3个月', fr: '1 à 3 mois' },
  'capital.withinYear': { en: 'Within 12 months', es: 'Dentro de 12 meses', vi: 'Trong vòng 12 tháng', zh: '12个月内', fr: 'Dans les 12 mois' },
  'capital.exploring': { en: 'Just exploring options', es: 'Solo explorando opciones', vi: 'Chỉ đang tìm hiểu', zh: '只是在了解选项', fr: 'J\u2019explore les options' },
  'capital.amountLabel': { en: 'How much are you seeking?', es: '¿Cuánto busca?', vi: 'Bạn đang tìm kiếm bao nhiêu?', zh: '您需要多少资金？', fr: 'Combien recherchez-vous ?' },
  'capital.under10k': { en: 'Under $10K', es: 'Menos de $10K', vi: 'Dưới $10K', zh: '低于$10K', fr: 'Moins de 10K $' },
  'capital.10k50k': { en: '$10K \u2013 $50K', es: '$10K \u2013 $50K', vi: '$10K \u2013 $50K', zh: '$10K \u2013 $50K', fr: '10K $ \u2013 50K $' },
  'capital.50k250k': { en: '$50K \u2013 $250K', es: '$50K \u2013 $250K', vi: '$50K \u2013 $250K', zh: '$50K \u2013 $250K', fr: '50K $ \u2013 250K $' },
  'capital.250kPlus': { en: '$250K+', es: '$250K+', vi: '$250K+', zh: '$250K+', fr: '250K $ +' },
  'capital.docsLabel': { en: 'Financial documents status', es: 'Estado de documentos financieros', vi: 'Tình trạng tài liệu tài chính', zh: '财务文件状态', fr: 'État des documents financiers' },
  'capital.docsAllReady': { en: 'All ready to go', es: 'Todo listo', vi: 'Tất cả đã sẵn sàng', zh: '全部准备就绪', fr: 'Tout est prêt' },
  'capital.docsAllDesc': { en: 'Tax returns, P&L, balance sheet, business plan', es: 'Declaraciones de impuestos, P&G, balance general, plan de negocio', vi: 'Khai thuế, lãi lỗ, bảng cân đối, kế hoạch kinh doanh', zh: '纳税申报表、损益表、资产负债表、商业计划书', fr: 'Déclarations fiscales, compte de résultat, bilan, business plan' },
  'capital.docsSomeReady': { en: 'Some ready', es: 'Algunos listos', vi: 'Một số đã sẵn sàng', zh: '部分准备好', fr: 'Partiellement prêt' },
  'capital.docsSomeDesc': { en: "I have a few but not everything", es: 'Tengo algunos pero no todo', vi: 'Tôi có một vài nhưng chưa đầy đủ', zh: '我有一些但不是全部', fr: "J\u2019en ai quelques-uns mais pas tout" },
  'capital.docsNotStarted': { en: 'Not started', es: 'Sin empezar', vi: 'Chưa bắt đầu', zh: '尚未开始', fr: 'Pas encore commencé' },
  'capital.docsNotDesc': { en: 'I need help pulling things together', es: 'Necesito ayuda para preparar todo', vi: 'Tôi cần giúp đỡ để chuẩn bị', zh: '我需要帮助来准备材料', fr: "J\u2019ai besoin d\u2019aide pour rassembler les documents" },
  'capital.creditLabel': { en: 'Credit score range', es: 'Rango de puntaje crediticio', vi: 'Phạm vi điểm tín dụng', zh: '信用评分范围', fr: 'Fourchette de score de crédit' },
  'capital.excellent': { en: 'Excellent (720+)', es: 'Excelente (720+)', vi: 'Xuất sắc (720+)', zh: '优秀 (720+)', fr: 'Excellent (720+)' },
  'capital.good': { en: 'Good (660\u2013719)', es: 'Bueno (660\u2013719)', vi: 'Tốt (660\u2013719)', zh: '良好 (660\u2013719)', fr: 'Bon (660\u2013719)' },
  'capital.fair': { en: 'Fair (580\u2013659)', es: 'Regular (580\u2013659)', vi: 'Khá (580\u2013659)', zh: '一般 (580\u2013659)', fr: 'Correct (580\u2013659)' },
  'capital.unsure': { en: 'Not sure', es: 'No estoy seguro', vi: 'Không chắc', zh: '不确定', fr: 'Pas sûr' },

  // ── Demographics Step ──
  'demo.title': { en: 'About you', es: 'Sobre usted', vi: 'Về bạn', zh: '关于您', fr: 'À propos de vous' },
  'demo.subtitle': { en: 'Optional \u2014 the SBA uses this for reporting only. Every field has a "Prefer not to say" option.', es: 'Opcional \u2014 la SBA usa esto solo para informes. Cada campo tiene la opción "Prefiero no decir".', vi: 'Tùy chọn \u2014 SBA chỉ sử dụng thông tin này để báo cáo. Mỗi trường đều có lựa chọn "Không muốn trả lời".', zh: '可选 \u2014 SBA仅将此信息用于报告。每个字段都有"不想透露"选项。', fr: 'Facultatif \u2014 la SBA utilise ces données uniquement pour ses rapports. Chaque champ a une option « Préfère ne pas répondre ».' },
  'demo.gender': { en: 'Gender', es: 'Género', vi: 'Giới tính', zh: '性别', fr: 'Genre' },
  'demo.female': { en: 'Female', es: 'Femenino', vi: 'Nữ', zh: '女', fr: 'Femme' },
  'demo.male': { en: 'Male', es: 'Masculino', vi: 'Nam', zh: '男', fr: 'Homme' },
  'demo.preferNot': { en: 'Prefer not to say', es: 'Prefiero no decir', vi: 'Không muốn trả lời', zh: '不想透露', fr: 'Préfère ne pas répondre' },
  'demo.ethnicity': { en: 'Race / Ethnicity', es: 'Raza / Etnicidad', vi: 'Chủng tộc / Dân tộc', zh: '种族/民族', fr: 'Race / Ethnicité' },
  'demo.white': { en: 'White', es: 'Blanco', vi: 'Da trắng', zh: '白人', fr: 'Blanc' },
  'demo.black': { en: 'Black / African American', es: 'Negro / Afroamericano', vi: 'Da đen / Người Mỹ gốc Phi', zh: '黑人/非裔美国人', fr: 'Noir / Afro-américain' },
  'demo.asian': { en: 'Asian', es: 'Asiático', vi: 'Châu Á', zh: '亚裔', fr: 'Asiatique' },
  'demo.native': { en: 'Native American', es: 'Nativo americano', vi: 'Người Mỹ bản địa', zh: '美洲原住民', fr: 'Amérindien' },
  'demo.pacific': { en: 'Native Hawaiian / Pacific Islander', es: 'Nativo de Hawái / Isleño del Pacífico', vi: 'Người Hawaii / Đảo Thái Bình Dương', zh: '夏威夷原住民/太平洋岛民', fr: 'Hawaïen / Insulaire du Pacifique' },
  'demo.middleEastern': { en: 'Middle Eastern', es: 'Medio Oriente', vi: 'Trung Đông', zh: '中东', fr: 'Moyen-Oriental' },
  'demo.hispanic': { en: 'Hispanic, Latino, or Spanish Origin?', es: '¿Hispano, latino o de origen español?', vi: 'Gốc Tây Ban Nha, Latino hoặc Tây Ban Nha?', zh: '西班牙裔、拉丁裔或西班牙血统？', fr: 'Hispanique, Latino ou d\u2019origine espagnole ?' },
  'demo.yes': { en: 'Yes', es: 'Sí', vi: 'Có', zh: '是', fr: 'Oui' },
  'demo.no': { en: 'No', es: 'No', vi: 'Không', zh: '否', fr: 'Non' },
  'demo.veteran': { en: 'Veteran Status', es: 'Estado de veterano', vi: 'Tình trạng cựu chiến binh', zh: '退伍军人身份', fr: 'Statut d\u2019ancien combattant' },
  'demo.vet': { en: 'Veteran', es: 'Veterano', vi: 'Cựu chiến binh', zh: '退伍军人', fr: 'Ancien combattant' },
  'demo.disabledVet': { en: 'Service-Disabled Veteran', es: 'Veterano con discapacidad', vi: 'Cựu chiến binh khuyết tật', zh: '伤残退伍军人', fr: 'Ancien combattant handicapé' },
  'demo.nonVet': { en: 'Non-veteran', es: 'No veterano', vi: 'Không phải cựu chiến binh', zh: '非退伍军人', fr: 'Non ancien combattant' },

  // ── Wrapup Step ──
  'wrapup.title': { en: 'Almost done', es: 'Casi terminamos', vi: 'Gần xong rồi', zh: '即将完成', fr: 'Presque terminé' },
  'wrapup.subtitle': { en: 'A few final items before we set up your account.', es: 'Unos últimos detalles antes de crear su cuenta.', vi: 'Một vài mục cuối cùng trước khi chúng tôi thiết lập tài khoản của bạn.', zh: '在设置您的帐户之前还有几项最后的事项。', fr: 'Quelques derniers éléments avant de créer votre compte.' },
  'wrapup.referralLabel': { en: 'How did you hear about us?', es: '¿Cómo se enteró de nosotros?', vi: 'Bạn biết đến chúng tôi qua đâu?', zh: '您是如何了解到我们的？', fr: 'Comment avez-vous entendu parler de nous ?' },
  'wrapup.refSelect': { en: 'Select...', es: 'Seleccionar...', vi: 'Chọn...', zh: '选择...', fr: 'Sélectionner...' },
  'wrapup.refOtherPlaceholder': { en: 'Please specify...', es: 'Por favor especifique...', vi: 'Vui lòng ghi rõ...', zh: '请注明...', fr: 'Veuillez préciser...' },
  'wrapup.newsletter': { en: 'Newsletter', es: 'Boletín informativo', vi: 'Bản tin', zh: '电子通讯', fr: 'Newsletter' },
  'wrapup.newsletterHint': { en: 'Business tips, workshop announcements, and resources. Unsubscribe anytime.', es: 'Consejos de negocios, anuncios de talleres y recursos. Cancele en cualquier momento.', vi: 'Mẹo kinh doanh, thông báo hội thảo và tài nguyên. Hủy đăng ký bất cứ lúc nào.', zh: '商业建议、研讨会通知和资源。随时可以取消订阅。', fr: 'Conseils d\u2019affaires, annonces d\u2019ateliers et ressources. Désabonnement possible à tout moment.' },
  'wrapup.subscribe': { en: 'Subscribe', es: 'Suscribirse', vi: 'Đăng ký', zh: '订阅', fr: "S\u2019abonner" },
  'wrapup.noThanks': { en: 'No thanks', es: 'No, gracias', vi: 'Không, cảm ơn', zh: '不了，谢谢', fr: 'Non merci' },
  'wrapup.tosHeader': { en: 'Information Notice \u2014 OMB Approval No.: 3245-0324', es: 'Aviso informativo \u2014 Aprobación OMB No.: 3245-0324', vi: 'Thông báo thông tin \u2014 Phê duyệt OMB số: 3245-0324', zh: '信息通知 \u2014 OMB 批准号：3245-0324', fr: 'Avis d\u2019information \u2014 Approbation OMB n° : 3245-0324' },
  'wrapup.tosP1': { en: 'I request business counseling service from the Northern California Small Business Development Center (SBDC) Network, an SBA Resource Partner. I agree to cooperate should I be selected to participate in surveys designed to evaluate SBDC services. I understand that any information disclosed will be held in strict confidence.', es: 'Solicito servicios de asesoría empresarial de la Red del Centro de Desarrollo de Pequeñas Empresas (SBDC) del Norte de California, un socio de recursos de la SBA. Acepto cooperar si soy seleccionado para participar en encuestas diseñadas para evaluar los servicios del SBDC. Entiendo que cualquier información proporcionada será tratada con estricta confidencialidad.', vi: 'Tôi yêu cầu dịch vụ tư vấn kinh doanh từ Mạng lưới Trung tâm Phát triển Doanh nghiệp Nhỏ (SBDC) Bắc California, một Đối tác Tài nguyên SBA. Tôi đồng ý hợp tác nếu được chọn tham gia khảo sát đánh giá dịch vụ SBDC. Tôi hiểu rằng mọi thông tin được tiết lộ sẽ được giữ bí mật nghiêm ngặt.', zh: '我请求北加州小企业发展中心（SBDC）网络（SBA资源合作伙伴）提供商业咨询服务。如果被选中参加评估SBDC服务的调查，我同意配合。我理解所有披露的信息将严格保密。', fr: 'Je demande un service de conseil aux entreprises auprès du réseau des Small Business Development Centers (SBDC) du Nord de la Californie, partenaire de ressources de la SBA. J\u2019accepte de coopérer si je suis sélectionné pour participer à des enquêtes d\u2019évaluation des services SBDC. Je comprends que toute information divulguée sera traitée de manière strictement confidentielle.' },
  'wrapup.tosP2': { en: 'I authorize the SBDC to furnish relevant information to the assigned Business Advisor(s). I further understand that the advisor(s) agree not to recommend goods or services from sources in which they have an interest, and not to accept fees or commissions developing from this counseling relationship.', es: 'Autorizo al SBDC a proporcionar información relevante al(los) asesor(es) de negocios asignado(s). Además, entiendo que el(los) asesor(es) acuerdan no recomendar bienes o servicios de fuentes en las que tengan interés, y no aceptar honorarios o comisiones derivadas de esta relación de asesoría.', vi: 'Tôi ủy quyền cho SBDC cung cấp thông tin liên quan cho (các) Cố vấn Kinh doanh được chỉ định. Tôi cũng hiểu rằng (các) cố vấn đồng ý không giới thiệu hàng hóa hoặc dịch vụ từ các nguồn mà họ có lợi ích, và không nhận phí hoặc hoa hồng phát sinh từ mối quan hệ tư vấn này.', zh: '我授权SBDC向指定的商业顾问提供相关信息。我进一步了解，顾问同意不推荐他们有利益关系的商品或服务，也不接受因咨询关系而产生的费用或佣金。', fr: 'J\u2019autorise le SBDC à transmettre les informations pertinentes au(x) conseiller(s) d\u2019affaires assigné(s). Je comprends également que le(s) conseiller(s) s\u2019engagent à ne pas recommander des biens ou services provenant de sources dans lesquelles ils ont un intérêt, et à ne pas accepter de frais ou commissions découlant de cette relation de conseil.' },
  'wrapup.tosP3': { en: 'In consideration of the counselor(s) furnishing management or technical assistance, I waive all claims against SBA personnel, and that of its Resource Partners, host organizations, and SBDC Advisors arising from this assistance.', es: 'En consideración de que el(los) asesor(es) proporcionan asistencia de gestión o técnica, renuncio a todos los reclamos contra el personal de la SBA, y de sus socios de recursos, organizaciones anfitrionas y asesores del SBDC derivados de esta asistencia.', vi: 'Xem xét việc (các) tư vấn viên cung cấp hỗ trợ quản lý hoặc kỹ thuật, tôi từ bỏ mọi khiếu nại đối với nhân viên SBA, và của các Đối tác Tài nguyên, tổ chức chủ nhà và Cố vấn SBDC phát sinh từ sự hỗ trợ này.', zh: '鉴于顾问提供管理或技术援助，我放弃对SBA人员及其资源合作伙伴、主办机构和SBDC顾问因此援助产生的所有索赔。', fr: 'En contrepartie de l\u2019assistance de gestion ou technique fournie par le(s) conseiller(s), je renonce à toute réclamation contre le personnel de la SBA, ses partenaires de ressources, les organisations hôtes et les conseillers SBDC découlant de cette assistance.' },
  'wrapup.tosHighlight': { en: 'By accepting these terms, I give my consent to participate in surveys designed to evaluate the services and impact of the Northern California SBDC Network.', es: 'Al aceptar estos términos, doy mi consentimiento para participar en encuestas diseñadas para evaluar los servicios e impacto de la Red SBDC del Norte de California.', vi: 'Bằng việc chấp nhận các điều khoản này, tôi đồng ý tham gia các khảo sát được thiết kế để đánh giá dịch vụ và tác động của Mạng lưới SBDC Bắc California.', zh: '接受这些条款即表示我同意参加旨在评估北加州SBDC网络服务和影响的调查。', fr: 'En acceptant ces conditions, je donne mon consentement pour participer à des enquêtes visant à évaluer les services et l\u2019impact du réseau SBDC du Nord de la Californie.' },
  'wrapup.readFull': { en: 'Read full terms', es: 'Leer todos los términos', vi: 'Đọc đầy đủ điều khoản', zh: '阅读完整条款', fr: 'Lire les conditions complètes' },
  'wrapup.showLess': { en: 'Show less', es: 'Mostrar menos', vi: 'Hiển thị ít hơn', zh: '收起', fr: 'Voir moins' },
  'wrapup.signatureLabel': { en: 'Signature', es: 'Firma', vi: 'Chữ ký', zh: '签名', fr: 'Signature' },
  'wrapup.signatureHint': { en: 'Type your full name to accept the terms above.', es: 'Escriba su nombre completo para aceptar los términos anteriores.', vi: 'Nhập tên đầy đủ của bạn để chấp nhận các điều khoản trên.', zh: '输入您的全名以接受上述条款。', fr: 'Tapez votre nom complet pour accepter les conditions ci-dessus.' },
  'wrapup.privacyLabel': { en: 'Privacy Release', es: 'Divulgación de privacidad', vi: 'Đồng ý bảo mật', zh: '隐私授权', fr: 'Autorisation de confidentialité' },
  'wrapup.privacyHint': { en: 'I permit SBA or its agent the use of my name and address for surveys and information mailings. Not required for SBDC services.', es: 'Permito a la SBA o su agente el uso de mi nombre y dirección para encuestas y correos informativos. No es obligatorio para los servicios del SBDC.', vi: 'Tôi cho phép SBA hoặc đại diện sử dụng tên và địa chỉ của tôi cho các khảo sát và thư thông tin. Không bắt buộc cho dịch vụ SBDC.', zh: '我允许SBA或其代理人使用我的姓名和地址进行调查和信息邮寄。这不是SBDC服务的必要条件。', fr: 'J\u2019autorise la SBA ou son agent à utiliser mon nom et adresse pour des enquêtes et envois d\u2019information. Non requis pour les services SBDC.' },

  // ── Review Step ──
  'review.title': { en: 'Review your information', es: 'Revise su información', vi: 'Xem lại thông tin của bạn', zh: '审核您的信息', fr: 'Vérifiez vos informations' },
  'review.subtitle': { en: 'Everything look right? You can go back to make changes.', es: '¿Todo se ve bien? Puede regresar para hacer cambios.', vi: 'Mọi thứ có đúng không? Bạn có thể quay lại để thay đổi.', zh: '一切看起来正确吗？您可以返回进行更改。', fr: 'Tout semble correct ? Vous pouvez revenir en arrière pour modifier.' },
  'review.name': { en: 'Name', es: 'Nombre', vi: 'Tên', zh: '姓名', fr: 'Nom' },
  'review.email': { en: 'Email', es: 'Correo electrónico', vi: 'Email', zh: '电子邮件', fr: 'E-mail' },
  'review.phone': { en: 'Phone', es: 'Teléfono', vi: 'Điện thoại', zh: '电话', fr: 'Téléphone' },
  'review.location': { en: 'Location', es: 'Ubicación', vi: 'Vị trí', zh: '位置', fr: 'Emplacement' },
  'review.status': { en: 'Status', es: 'Estado', vi: 'Trạng thái', zh: '状态', fr: 'Statut' },
  'review.inBusiness': { en: 'In Business', es: 'En negocio', vi: 'Đang kinh doanh', zh: '经营中', fr: 'En activité' },
  'review.preVenture': { en: 'Pre-venture', es: 'Pre-emprendimiento', vi: 'Tiền kinh doanh', zh: '创业前期', fr: 'Pré-création' },
  'review.business': { en: 'Business', es: 'Negocio', vi: 'Doanh nghiệp', zh: '企业', fr: 'Entreprise' },
  'review.website': { en: 'Website', es: 'Sitio web', vi: 'Trang web', zh: '网站', fr: 'Site web' },
  'review.goals': { en: 'Goals', es: 'Objetivos', vi: 'Mục tiêu', zh: '目标', fr: 'Objectifs' },
  'review.programs': { en: 'Programs', es: 'Programas', vi: 'Chương trình', zh: '项目', fr: 'Programmes' },
  'review.center': { en: 'SBDC Center', es: 'Centro SBDC', vi: 'Trung tâm SBDC', zh: 'SBDC中心', fr: 'Centre SBDC' },
  'review.signed': { en: 'Signed', es: 'Firmado', vi: 'Đã ký', zh: '已签名', fr: 'Signé' },
  'review.submit': { en: 'Complete Application', es: 'Completar solicitud', vi: 'Hoàn tất đơn', zh: '完成申请', fr: 'Terminer la demande' },
  'review.submitting': { en: 'Creating your account...', es: 'Creando su cuenta...', vi: 'Đang tạo tài khoản...', zh: '正在创建您的帐户...', fr: 'Création de votre compte...' },

  // ── Result Screen ──
  'result.title': { en: "You\u2019re all set,", es: 'Todo listo,', vi: 'Bạn đã sẵn sàng,', zh: '一切就绪，', fr: 'Vous êtes prêt,' },
  'result.desc': { en: 'Your account has been created and your information is on file. An SBDC advisor will review your profile and reach out within 1\u20132 business days. In the meantime, schedule your intake interview below.', es: 'Su cuenta ha sido creada y su información está archivada. Un asesor del SBDC revisará su perfil y se comunicará dentro de 1\u20132 días hábiles. Mientras tanto, programe su entrevista de admisión a continuación.', vi: 'Tài khoản của bạn đã được tạo và thông tin của bạn đã được lưu. Một cố vấn SBDC sẽ xem xét hồ sơ của bạn và liên hệ trong vòng 1\u20132 ngày làm việc. Trong khi chờ đợi, hãy đặt lịch phỏng vấn nhận hồ sơ bên dưới.', zh: '您的帐户已创建，您的信息已存档。SBDC顾问将审核您的资料并在1\u20132个工作日内与您联系。同时，请在下方安排您的接收面谈。', fr: 'Votre compte a été créé et vos informations sont enregistrées. Un conseiller SBDC examinera votre profil et vous contactera dans un délai de 1 à 2 jours ouvrables. En attendant, planifiez votre entretien d\u2019admission ci-dessous.' },
  'result.crmBadge': { en: 'Account created in Neoserra', es: 'Cuenta creada en Neoserra', vi: 'Tài khoản đã tạo trong Neoserra', zh: '帐户已在Neoserra中创建', fr: 'Compte créé dans Neoserra' },
  'result.error': { en: 'Note: Your submission encountered an issue:', es: 'Nota: Su envío encontró un problema:', vi: 'Lưu ý: Đơn gửi của bạn gặp vấn đề:', zh: '注意：您的提交遇到了问题：', fr: 'Note : Votre soumission a rencontré un problème :' },
  'result.scheduleTitle': { en: 'Schedule your intake interview', es: 'Programe su entrevista de admisión', vi: 'Đặt lịch phỏng vấn nhận hồ sơ', zh: '安排您的接收面谈', fr: 'Planifiez votre entretien d\u2019admission' },
  'result.scheduleDesc': { en: 'Book a 15\u201320 minute conversation with your SBDC advisor to discuss your goals and get started.', es: 'Reserve una conversación de 15\u201320 minutos con su asesor del SBDC para discutir sus objetivos y comenzar.', vi: 'Đặt cuộc trò chuyện 15\u201320 phút với cố vấn SBDC để thảo luận về mục tiêu và bắt đầu.', zh: '预约与您的SBDC顾问进行15\u201320分钟的对话，讨论您的目标并开始。', fr: 'Réservez une conversation de 15 à 20 minutes avec votre conseiller SBDC pour discuter de vos objectifs et commencer.' },

  // ── Footer ──
  'footer.text': { en: 'Funded in part through a Cooperative Agreement with the U.S. Small Business Administration.', es: 'Financiado en parte a través de un Acuerdo Cooperativo con la Administración de Pequeñas Empresas de EE. UU.', vi: 'Được tài trợ một phần thông qua Thỏa thuận Hợp tác với Cơ quan Quản lý Doanh nghiệp Nhỏ Hoa Kỳ.', zh: '部分资金来自与美国小企业管理局的合作协议。', fr: 'Financé en partie par un accord de coopération avec la U.S. Small Business Administration.' },
};

// ─── Context ────────────────────────────────────────────

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  const t = useCallback(
    (key: string): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[locale] || entry.en || key;
    },
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
