export interface Country {
  name: string;
  code: string;
  flag: string;
  iso: string;
  placeholder: string;
  length: number;
}

// Comprehensive list of 200+ countries and territories, strictly sorted alphabetically (A to Z)
export const COUNTRIES: Country[] = [
  // --- A ---
  { name: 'Afghanistan', code: '+93', flag: '🇦🇫', iso: 'AF', placeholder: '701234567', length: 9 },
  { name: 'Albania', code: '+355', flag: '🇦🇱', iso: 'AL', placeholder: '671234567', length: 9 },
  { name: 'Algeria', code: '+213', flag: '🇩🇿', iso: 'DZ', placeholder: '551234567', length: 9 },
  { name: 'American Samoa', code: '+1684', flag: '🇦🇸', iso: 'AS', placeholder: '6841234', length: 7 },
  { name: 'Andorra', code: '+376', flag: '🇦🇩', iso: 'AD', placeholder: '312345', length: 6 },
  { name: 'Angola', code: '+244', flag: '🇦🇴', iso: 'AO', placeholder: '923123456', length: 9 },
  { name: 'Anguilla', code: '+1264', flag: '🇦🇮', iso: 'AI', placeholder: '2641234', length: 7 },
  { name: 'Antigua and Barbuda', code: '+1268', flag: '🇦🇬', iso: 'AG', placeholder: '2681234', length: 7 },
  { name: 'Argentina', code: '+54', flag: '🇦🇷', iso: 'AR', placeholder: '91112345678', length: 11 },
  { name: 'Armenia', code: '+374', flag: '🇦🇲', iso: 'AM', placeholder: '77123456', length: 8 },
  { name: 'Aruba', code: '+297', flag: '🇦🇼', iso: 'AW', placeholder: '5612345', length: 7 },
  { name: 'Australia', code: '+61', flag: '🇦🇺', iso: 'AU', placeholder: '412345678', length: 9 },
  { name: 'Austria', code: '+43', flag: '🇦🇹', iso: 'AT', placeholder: '6601234567', length: 10 },
  { name: 'Azerbaijan', code: '+994', flag: '🇦🇿', iso: 'AZ', placeholder: '501234567', length: 9 },

  // --- B ---
  { name: 'Bahamas', code: '+1242', flag: '🇧🇸', iso: 'BS', placeholder: '2421234', length: 7 },
  { name: 'Bahrain', code: '+973', flag: '🇧🇭', iso: 'BH', placeholder: '31234567', length: 8 },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩', iso: 'BD', placeholder: '1712345678', length: 10 },
  { name: 'Barbados', code: '+1246', flag: '🇧🇧', iso: 'BB', placeholder: '2461234', length: 7 },
  { name: 'Belarus', code: '+375', flag: '🇧🇾', iso: 'BY', placeholder: '291234567', length: 9 },
  { name: 'Belgium', code: '+32', flag: '🇧🇪', iso: 'BE', placeholder: '470123456', length: 9 },
  { name: 'Belize', code: '+501', flag: '🇧🇿', iso: 'BZ', placeholder: '6123456', length: 7 },
  { name: 'Benin', code: '+229', flag: '🇧🇯', iso: 'BJ', placeholder: '97123456', length: 8 },
  { name: 'Bermuda', code: '+1441', flag: '🇧🇲', iso: 'BM', placeholder: '4411234', length: 7 },
  { name: 'Bhutan', code: '+975', flag: '🇧🇹', iso: 'BT', placeholder: '17123456', length: 8 },
  { name: 'Bolivia', code: '+591', flag: '🇧🇴', iso: 'BO', placeholder: '71234567', length: 8 },
  { name: 'Bosnia and Herzegovina', code: '+387', flag: '🇧🇦', iso: 'BA', placeholder: '61123456', length: 8 },
  { name: 'Botswana', code: '+267', flag: '🇧🇼', iso: 'BW', placeholder: '71123456', length: 8 },
  { name: 'Brazil', code: '+55', flag: '🇧🇷', iso: 'BR', placeholder: '11987654321', length: 11 },
  { name: 'British Virgin Islands', code: '+1284', flag: '🇻🇬', iso: 'VG', placeholder: '2841234', length: 7 },
  { name: 'Brunei', code: '+673', flag: '🇧🇳', iso: 'BN', placeholder: '8123456', length: 7 },
  { name: 'Bulgaria', code: '+359', flag: '🇧🇬', iso: 'BG', placeholder: '871234567', length: 9 },
  { name: 'Burkina Faso', code: '+226', flag: '🇧🇫', iso: 'BF', placeholder: '70123456', length: 8 },
  { name: 'Burundi', code: '+257', flag: '🇧🇮', iso: 'BI', placeholder: '79123456', length: 8 },

  // --- C ---
  { name: 'Cambodia', code: '+855', flag: '🇰🇭', iso: 'KH', placeholder: '12123456', length: 8 },
  { name: 'Cameroon', code: '+237', flag: '🇨🇲', iso: 'CM', placeholder: '671234567', length: 9 },
  { name: 'Canada', code: '+1', flag: '🇨🇦', iso: 'CA', placeholder: '6045550123', length: 10 },
  { name: 'Cape Verde', code: '+238', flag: '🇨🇻', iso: 'CV', placeholder: '9912345', length: 7 },
  { name: 'Cayman Islands', code: '+1345', flag: '🇰🇾', iso: 'KY', placeholder: '3451234', length: 7 },
  { name: 'Central African Republic', code: '+236', flag: '🇨🇫', iso: 'CF', placeholder: '75123456', length: 8 },
  { name: 'Chad', code: '+235', flag: '🇹🇩', iso: 'TD', placeholder: '66123456', length: 8 },
  { name: 'Chile', code: '+56', flag: '🇨🇱', iso: 'CL', placeholder: '912345678', length: 9 },
  { name: 'China', code: '+86', flag: '🇨🇳', iso: 'CN', placeholder: '13812345678', length: 11 },
  { name: 'Colombia', code: '+57', flag: '🇨🇴', iso: 'CO', placeholder: '3001234567', length: 10 },
  { name: 'Comoros', code: '+269', flag: '🇰🇲', iso: 'KM', placeholder: '3212345', length: 7 },
  { name: 'Congo (Brazzaville)', code: '+242', flag: '🇨🇬', iso: 'CG', placeholder: '061234567', length: 9 },
  { name: 'Congo (Kinshasa)', code: '+243', flag: '🇨🇩', iso: 'CD', placeholder: '812345678', length: 9 },
  { name: 'Cook Islands', code: '+682', flag: '🇨🇰', iso: 'CK', placeholder: '51234', length: 5 },
  { name: 'Costa Rica', code: '+506', flag: '🇨🇷', iso: 'CR', placeholder: '83123456', length: 8 },
  { name: 'Croatia', code: '+385', flag: '🇭🇷', iso: 'HR', placeholder: '911234567', length: 9 },
  { name: 'Cuba', code: '+53', flag: '🇨🇺', iso: 'CU', placeholder: '51234567', length: 8 },
  { name: 'Curaçao', code: '+599', flag: '🇨🇼', iso: 'CW', placeholder: '9512345', length: 7 },
  { name: 'Cyprus', code: '+357', flag: '🇨🇾', iso: 'CY', placeholder: '96123456', length: 8 },
  { name: 'Czech Republic', code: '+420', flag: '🇨🇿', iso: 'CZ', placeholder: '601123456', length: 9 },

  // --- D ---
  { name: 'Denmark', code: '+45', flag: '🇩🇰', iso: 'DK', placeholder: '20123456', length: 8 },
  { name: 'Djibouti', code: '+253', flag: '🇩🇯', iso: 'DJ', placeholder: '77123456', length: 8 },
  { name: 'Dominica', code: '+1767', flag: '🇩🇲', iso: 'DM', placeholder: '7671234', length: 7 },
  { name: 'Dominican Republic', code: '+1809', flag: '🇩🇴', iso: 'DO', placeholder: '8091234567', length: 10 },

  // --- E ---
  { name: 'Ecuador', code: '+593', flag: '🇪🇨', iso: 'EC', placeholder: '991234567', length: 9 },
  { name: 'Egypt', code: '+20', flag: '🇪🇬', iso: 'EG', placeholder: '1012345678', length: 10 },
  { name: 'El Salvador', code: '+503', flag: '🇸🇻', iso: 'SV', placeholder: '70123456', length: 8 },
  { name: 'Equatorial Guinea', code: '+240', flag: '🇬🇶', iso: 'GQ', placeholder: '222123456', length: 9 },
  { name: 'Eritrea', code: '+291', flag: '🇪🇷', iso: 'ER', placeholder: '7123456', length: 7 },
  { name: 'Estonia', code: '+372', flag: '🇪🇪', iso: 'EE', placeholder: '51234567', length: 8 },
  { name: 'Eswatini', code: '+268', flag: '🇸🇿', iso: 'SZ', placeholder: '76123456', length: 8 },
  { name: 'Ethiopia', code: '+251', flag: '🇪🇹', iso: 'ET', placeholder: '911234567', length: 9 },

  // --- F ---
  { name: 'Falkland Islands', code: '+500', flag: '🇫🇰', iso: 'FK', placeholder: '51234', length: 5 },
  { name: 'Faroe Islands', code: '+298', flag: '🇫🇴', iso: 'FO', placeholder: '212345', length: 6 },
  { name: 'Fiji', code: '+679', flag: '🇫🇯', iso: 'FJ', placeholder: '7012345', length: 7 },
  { name: 'Finland', code: '+358', flag: '🇫🇮', iso: 'FI', placeholder: '401234567', length: 9 },
  { name: 'France', code: '+33', flag: '🇫🇷', iso: 'FR', placeholder: '612345678', length: 9 },
  { name: 'French Guiana', code: '+594', flag: '🇬🇫', iso: 'GF', placeholder: '694123456', length: 9 },
  { name: 'French Polynesia', code: '+689', flag: '🇵🇫', iso: 'PF', placeholder: '87123456', length: 8 },

  // --- G ---
  { name: 'Gabon', code: '+241', flag: '🇬🇦', iso: 'GA', placeholder: '06123456', length: 8 },
  { name: 'Gambia', code: '+220', flag: '🇬🇲', iso: 'GM', placeholder: '7123456', length: 7 },
  { name: 'Georgia', code: '+995', flag: '🇬🇪', iso: 'GE', placeholder: '555123456', length: 9 },
  { name: 'Germany', code: '+49', flag: '🇩🇪', iso: 'DE', placeholder: '15123456789', length: 11 },
  { name: 'Ghana', code: '+233', flag: '🇬🇭', iso: 'GH', placeholder: '241234567', length: 9 },
  { name: 'Gibraltar', code: '+350', flag: '🇬🇮', iso: 'GI', placeholder: '57123456', length: 8 },
  { name: 'Greece', code: '+30', flag: '🇬🇷', iso: 'GR', placeholder: '6912345678', length: 10 },
  { name: 'Greenland', code: '+299', flag: '🇬🇱', iso: 'GL', placeholder: '212345', length: 6 },
  { name: 'Grenada', code: '+1473', flag: '🇬🇩', iso: 'GD', placeholder: '4731234', length: 7 },
  { name: 'Guadeloupe', code: '+590', flag: '🇬🇵', iso: 'GP', placeholder: '690123456', length: 9 },
  { name: 'Guam', code: '+1671', flag: '🇬🇺', iso: 'GU', placeholder: '6711234', length: 7 },
  { name: 'Guatemala', code: '+502', flag: '🇬🇹', iso: 'GT', placeholder: '51234567', length: 8 },
  { name: 'Guinea', code: '+224', flag: '🇬🇳', iso: 'GN', placeholder: '621123456', length: 9 },
  { name: 'Guinea-Bissau', code: '+245', flag: '🇬🇼', iso: 'GW', placeholder: '955123456', length: 9 },
  { name: 'Guyana', code: '+592', flag: '🇬🇾', iso: 'GY', placeholder: '6123456', length: 7 },

  // --- H ---
  { name: 'Haiti', code: '+509', flag: '🇭🇹', iso: 'HT', placeholder: '34123456', length: 8 },
  { name: 'Honduras', code: '+504', flag: '🇭🇳', iso: 'HN', placeholder: '91234567', length: 8 },
  { name: 'Hong Kong', code: '+852', flag: '🇭🇰', iso: 'HK', placeholder: '91234567', length: 8 },
  { name: 'Hungary', code: '+36', flag: '🇭🇺', iso: 'HU', placeholder: '201234567', length: 9 },

  // --- I ---
  { name: 'Iceland', code: '+354', flag: '🇮🇸', iso: 'IS', placeholder: '6123456', length: 7 },
  { name: 'India', code: '+91', flag: '🇮🇳', iso: 'IN', placeholder: '9876543210', length: 10 },
  { name: 'Indonesia', code: '+62', flag: '🇮🇩', iso: 'ID', placeholder: '8123456789', length: 10 },
  { name: 'Iran', code: '+98', flag: '🇮🇷', iso: 'IR', placeholder: '9123456789', length: 10 },
  { name: 'Iraq', code: '+964', flag: '🇮🇶', iso: 'IQ', placeholder: '7701234567', length: 10 },
  { name: 'Ireland', code: '+353', flag: '🇮🇪', iso: 'IE', placeholder: '851234567', length: 9 },
  { name: 'Isle of Man', code: '+44', flag: '🇮🇲', iso: 'IM', placeholder: '7624123456', length: 10 },
  { name: 'Israel', code: '+972', flag: '🇮🇱', iso: 'IL', placeholder: '501234567', length: 9 },
  { name: 'Italy', code: '+39', flag: '🇮🇹', iso: 'IT', placeholder: '3123456789', length: 10 },
  { name: 'Ivory Coast', code: '+225', flag: '🇨🇮', iso: 'CI', placeholder: '0712345678', length: 10 },

  // --- J ---
  { name: 'Jamaica', code: '+1876', flag: '🇯🇲', iso: 'JM', placeholder: '8761234567', length: 10 },
  { name: 'Japan', code: '+81', flag: '🇯🇵', iso: 'JP', placeholder: '9012345678', length: 10 },
  { name: 'Jersey', code: '+44', flag: '🇯🇪', iso: 'JE', placeholder: '7797123456', length: 10 },
  { name: 'Jordan', code: '+962', flag: '🇯🇴', iso: 'JO', placeholder: '791234567', length: 9 },

  // --- K ---
  { name: 'Kazakhstan', code: '+7', flag: '🇰🇿', iso: 'KZ', placeholder: '7011234567', length: 10 },
  { name: 'Kenya', code: '+254', flag: '🇰🇪', iso: 'KE', placeholder: '712345678', length: 9 },
  { name: 'Kiribati', code: '+686', flag: '🇰🇮', iso: 'KI', placeholder: '7212345', length: 7 },
  { name: 'Kosovo', code: '+383', flag: '🇽🇰', iso: 'XK', placeholder: '44123456', length: 8 },
  { name: 'Kuwait', code: '+965', flag: '🇰🇼', iso: 'KW', placeholder: '51234567', length: 8 },
  { name: 'Kyrgyzstan', code: '+996', flag: '🇰🇬', iso: 'KG', placeholder: '555123456', length: 9 },

  // --- L ---
  { name: 'Laos', code: '+856', flag: '🇱🇦', iso: 'LA', placeholder: '2012345678', length: 10 },
  { name: 'Latvia', code: '+371', flag: '🇱🇻', iso: 'LV', placeholder: '21234567', length: 8 },
  { name: 'Lebanon', code: '+961', flag: '🇱🇧', iso: 'LB', placeholder: '70123456', length: 8 },
  { name: 'Lesotho', code: '+266', flag: '🇱🇸', iso: 'LS', placeholder: '58123456', length: 8 },
  { name: 'Liberia', code: '+231', flag: '🇱🇷', iso: 'LR', placeholder: '77123456', length: 8 },
  { name: 'Libya', code: '+218', flag: '🇱🇾', iso: 'LY', placeholder: '911234567', length: 9 },
  { name: 'Liechtenstein', code: '+423', flag: '🇱🇮', iso: 'LI', placeholder: '6612345', length: 7 },
  { name: 'Lithuania', code: '+370', flag: '🇱🇹', iso: 'LT', placeholder: '61234567', length: 8 },
  { name: 'Luxembourg', code: '+352', flag: '🇱🇺', iso: 'LU', placeholder: '621123456', length: 9 },

  // --- M ---
  { name: 'Macau', code: '+853', flag: '🇲🇴', iso: 'MO', placeholder: '66123456', length: 8 },
  { name: 'Madagascar', code: '+261', flag: '🇲🇬', iso: 'MG', placeholder: '321234567', length: 9 },
  { name: 'Malawi', code: '+265', flag: '🇲🇼', iso: 'MW', placeholder: '991234567', length: 9 },
  { name: 'Malaysia', code: '+60', flag: '🇲🇾', iso: 'MY', placeholder: '123456789', length: 9 },
  { name: 'Maldives', code: '+960', flag: '🇲🇻', iso: 'MV', placeholder: '7712345', length: 7 },
  { name: 'Mali', code: '+223', flag: '🇲🇱', iso: 'ML', placeholder: '65123456', length: 8 },
  { name: 'Malta', code: '+356', flag: '🇲🇹', iso: 'MT', placeholder: '99123456', length: 8 },
  { name: 'Marshall Islands', code: '+692', flag: '🇲🇭', iso: 'MH', placeholder: '2351234', length: 7 },
  { name: 'Martinique', code: '+596', flag: '🇲🇶', iso: 'MQ', placeholder: '696123456', length: 9 },
  { name: 'Mauritania', code: '+222', flag: '🇲🇷', iso: 'MR', placeholder: '22123456', length: 8 },
  { name: 'Mauritius', code: '+230', flag: '🇲🇺', iso: 'MU', placeholder: '57123456', length: 8 },
  { name: 'Mayotte', code: '+262', flag: '🇾🇹', iso: 'YT', placeholder: '639123456', length: 9 },
  { name: 'Mexico', code: '+52', flag: '🇲🇽', iso: 'MX', placeholder: '5512345678', length: 10 },
  { name: 'Micronesia', code: '+691', flag: '🇫🇲', iso: 'FM', placeholder: '9201234', length: 7 },
  { name: 'Moldova', code: '+373', flag: '🇲🇩', iso: 'MD', placeholder: '60123456', length: 8 },
  { name: 'Monaco', code: '+377', flag: '🇲🇨', iso: 'MC', placeholder: '612345678', length: 9 },
  { name: 'Mongolia', code: '+976', flag: '🇲🇳', iso: 'MN', placeholder: '88123456', length: 8 },
  { name: 'Montenegro', code: '+382', flag: '🇲🇪', iso: 'ME', placeholder: '67123456', length: 8 },
  { name: 'Montserrat', code: '+1664', flag: '🇲🇸', iso: 'MS', placeholder: '4911234', length: 7 },
  { name: 'Morocco', code: '+212', flag: '🇲🇦', iso: 'MA', placeholder: '612345678', length: 9 },
  { name: 'Mozambique', code: '+258', flag: '🇲🇿', iso: 'MZ', placeholder: '841234567', length: 9 },
  { name: 'Myanmar', code: '+95', flag: '🇲🇲', iso: 'MM', placeholder: '912345678', length: 9 },

  // --- N ---
  { name: 'Namibia', code: '+264', flag: '🇳🇦', iso: 'NA', placeholder: '811234567', length: 9 },
  { name: 'Nauru', code: '+674', flag: '🇳🇷', iso: 'NR', placeholder: '5551234', length: 7 },
  { name: 'Nepal', code: '+977', flag: '🇳🇵', iso: 'NP', placeholder: '9812345678', length: 10 },
  { name: 'Netherlands', code: '+31', flag: '🇳🇱', iso: 'NL', placeholder: '612345678', length: 9 },
  { name: 'New Caledonia', code: '+687', flag: '🇳🇨', iso: 'NC', placeholder: '751234', length: 6 },
  { name: 'New Zealand', code: '+64', flag: '🇳🇿', iso: 'NZ', placeholder: '212345678', length: 9 },
  { name: 'Nicaragua', code: '+505', flag: '🇳🇮', iso: 'NI', placeholder: '81234567', length: 8 },
  { name: 'Niger', code: '+227', flag: '🇳🇪', iso: 'NE', placeholder: '90123456', length: 8 },
  { name: 'Nigeria', code: '+234', flag: '🇳🇬', iso: 'NG', placeholder: '8021234567', length: 10 },
  { name: 'North Korea', code: '+850', flag: '🇰🇵', iso: 'KP', placeholder: '1912345678', length: 10 },
  { name: 'North Macedonia', code: '+389', flag: '🇲🇰', iso: 'MK', placeholder: '70123456', length: 8 },
  { name: 'Northern Mariana Islands', code: '+1670', flag: '🇲🇵', iso: 'MP', placeholder: '2341234', length: 7 },
  { name: 'Norway', code: '+47', flag: '🇳🇴', iso: 'NO', placeholder: '91234567', length: 8 },

  // --- O ---
  { name: 'Oman', code: '+968', flag: '🇴🇲', iso: 'OM', placeholder: '91234567', length: 8 },

  // --- P ---
  { name: 'Pakistan', code: '+92', flag: '🇵🇰', iso: 'PK', placeholder: '3001234567', length: 10 },
  { name: 'Palau', code: '+680', flag: '🇵🇼', iso: 'PW', placeholder: '7751234', length: 7 },
  { name: 'Palestine', code: '+970', flag: '🇵🇸', iso: 'PS', placeholder: '599123456', length: 9 },
  { name: 'Panama', code: '+507', flag: '🇵🇦', iso: 'PA', placeholder: '61234567', length: 8 },
  { name: 'Papua New Guinea', code: '+675', flag: '🇵🇬', iso: 'PG', placeholder: '71234567', length: 8 },
  { name: 'Paraguay', code: '+595', flag: '🇵🇾', iso: 'PY', placeholder: '981123456', length: 9 },
  { name: 'Peru', code: '+51', flag: '🇵🇪', iso: 'PE', placeholder: '912345678', length: 9 },
  { name: 'Philippines', code: '+63', flag: '🇵🇭', iso: 'PH', placeholder: '9171234567', length: 10 },
  { name: 'Poland', code: '+48', flag: '🇵🇱', iso: 'PL', placeholder: '512345678', length: 9 },
  { name: 'Portugal', code: '+351', flag: '🇵🇹', iso: 'PT', placeholder: '912345678', length: 9 },
  { name: 'Puerto Rico', code: '+1787', flag: '🇵🇷', iso: 'PR', placeholder: '7871234567', length: 10 },

  // --- Q ---
  { name: 'Qatar', code: '+974', flag: '🇶🇦', iso: 'QA', placeholder: '55123456', length: 8 },

  // --- R ---
  { name: 'Réunion', code: '+262', flag: '🇷🇪', iso: 'RE', placeholder: '692123456', length: 9 },
  { name: 'Romania', code: '+40', flag: '🇷🇴', iso: 'RO', placeholder: '712345678', length: 9 },
  { name: 'Russia', code: '+7', flag: '🇷🇺', iso: 'RU', placeholder: '9123456789', length: 10 },
  { name: 'Rwanda', code: '+250', flag: '🇷🇼', iso: 'RW', placeholder: '781234567', length: 9 },

  // --- S ---
  { name: 'Saint Barthélemy', code: '+590', flag: '🇧🇱', iso: 'BL', placeholder: '690123456', length: 9 },
  { name: 'Saint Kitts and Nevis', code: '+1869', flag: '🇰🇳', iso: 'KN', placeholder: '8691234', length: 7 },
  { name: 'Saint Lucia', code: '+1758', flag: '🇱🇨', iso: 'LC', placeholder: '7581234', length: 7 },
  { name: 'Saint Martin', code: '+590', flag: '🇲🇫', iso: 'MF', placeholder: '690123456', length: 9 },
  { name: 'Saint Pierre and Miquelon', code: '+508', flag: '🇵🇲', iso: 'PM', placeholder: '551234', length: 6 },
  { name: 'Saint Vincent and the Grenadines', code: '+1784', flag: '🇻🇨', iso: 'VC', placeholder: '7841234', length: 7 },
  { name: 'Samoa', code: '+685', flag: '🇼🇸', iso: 'WS', placeholder: '7212345', length: 7 },
  { name: 'San Marino', code: '+378', flag: '🇸🇲', iso: 'SM', placeholder: '66123456', length: 8 },
  { name: 'Sao Tome and Principe', code: '+239', flag: '🇸🇹', iso: 'ST', placeholder: '9912345', length: 7 },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦', iso: 'SA', placeholder: '501234567', length: 9 },
  { name: 'Senegal', code: '+221', flag: '🇸🇳', iso: 'SN', placeholder: '771234567', length: 9 },
  { name: 'Serbia', code: '+381', flag: '🇷🇸', iso: 'RS', placeholder: '601234567', length: 9 },
  { name: 'Seychelles', code: '+248', flag: '🇸🇨', iso: 'SC', placeholder: '2512345', length: 7 },
  { name: 'Sierra Leone', code: '+232', flag: '🇸🇱', iso: 'SL', placeholder: '76123456', length: 8 },
  { name: 'Singapore', code: '+65', flag: '🇸🇬', iso: 'SG', placeholder: '81234567', length: 8 },
  { name: 'Sint Maarten', code: '+1721', flag: '🇸🇽', iso: 'SX', placeholder: '7211234', length: 7 },
  { name: 'Slovakia', code: '+421', flag: '🇸🇰', iso: 'SK', placeholder: '901234567', length: 9 },
  { name: 'Slovenia', code: '+386', flag: '🇸🇮', iso: 'SI', placeholder: '31234567', length: 8 },
  { name: 'Solomon Islands', code: '+677', flag: '🇸🇧', iso: 'SB', placeholder: '7412345', length: 7 },
  { name: 'Somalia', code: '+252', flag: '🇸🇴', iso: 'SO', placeholder: '611234567', length: 9 },
  { name: 'South Africa', code: '+27', flag: '🇿🇦', iso: 'ZA', placeholder: '821234567', length: 9 },
  { name: 'South Korea', code: '+82', flag: '🇰🇷', iso: 'KR', placeholder: '1012345678', length: 10 },
  { name: 'South Sudan', code: '+211', flag: '🇸🇸', iso: 'SS', placeholder: '912345678', length: 9 },
  { name: 'Spain', code: '+34', flag: '🇪🇸', iso: 'ES', placeholder: '612345678', length: 9 },
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰', iso: 'LK', placeholder: '771234567', length: 9 },
  { name: 'Sudan', code: '+249', flag: '🇸🇩', iso: 'SD', placeholder: '911234567', length: 9 },
  { name: 'Suriname', code: '+597', flag: '🇸🇷', iso: 'SR', placeholder: '8123456', length: 7 },
  { name: 'Sweden', code: '+46', flag: '🇸🇪', iso: 'SE', placeholder: '701234567', length: 9 },
  { name: 'Switzerland', code: '+41', flag: '🇨🇭', iso: 'CH', placeholder: '711234567', length: 9 },
  { name: 'Syria', code: '+963', flag: '🇸🇾', iso: 'SY', placeholder: '931234567', length: 9 },

  // --- T ---
  { name: 'Taiwan', code: '+886', flag: '🇹🇼', iso: 'TW', placeholder: '912345678', length: 9 },
  { name: 'Tajikistan', code: '+992', flag: '🇹🇯', iso: 'TJ', placeholder: '901234567', length: 9 },
  { name: 'Tanzania', code: '+255', flag: '🇹🇿', iso: 'TZ', placeholder: '712345678', length: 9 },
  { name: 'Thailand', code: '+66', flag: '🇹🇭', iso: 'TH', placeholder: '812345678', length: 9 },
  { name: 'Timor-Leste', code: '+670', flag: '🇹🇱', iso: 'TL', placeholder: '77123456', length: 8 },
  { name: 'Togo', code: '+228', flag: '🇹🇬', iso: 'TG', placeholder: '90123456', length: 8 },
  { name: 'Tonga', code: '+676', flag: '🇹🇴', iso: 'TO', placeholder: '7712345', length: 7 },
  { name: 'Trinidad and Tobago', code: '+1868', flag: '🇹🇹', iso: 'TT', placeholder: '8681234567', length: 10 },
  { name: 'Tunisia', code: '+216', flag: '🇹🇳', iso: 'TN', placeholder: '20123456', length: 8 },
  { name: 'Turkey', code: '+90', flag: '🇹🇷', iso: 'TR', placeholder: '5321234567', length: 10 },
  { name: 'Turkmenistan', code: '+993', flag: '🇹🇲', iso: 'TM', placeholder: '65123456', length: 8 },
  { name: 'Turks and Caicos Islands', code: '+1649', flag: '🇹🇨', iso: 'TC', placeholder: '2311234', length: 7 },
  { name: 'Tuvalu', code: '+688', flag: '🇹🇻', iso: 'TV', placeholder: '901234', length: 6 },

  // --- U ---
  { name: 'Uganda', code: '+256', flag: '🇺🇬', iso: 'UG', placeholder: '771234567', length: 9 },
  { name: 'Ukraine', code: '+380', flag: '🇺🇦', iso: 'UA', placeholder: '501234567', length: 9 },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', iso: 'AE', placeholder: '501234567', length: 9 },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', iso: 'GB', placeholder: '7911123456', length: 10 },
  { name: 'United States', code: '+1', flag: '🇺🇸', iso: 'US', placeholder: '2015550123', length: 10 },
  { name: 'Uruguay', code: '+598', flag: '🇺🇾', iso: 'UY', placeholder: '94123456', length: 8 },
  { name: 'Uzbekistan', code: '+998', flag: '🇺🇿', iso: 'UZ', placeholder: '901234567', length: 9 },

  // --- V ---
  { name: 'Vanuatu', code: '+678', flag: '🇻🇺', iso: 'VU', placeholder: '7712345', length: 7 },
  { name: 'Vatican City', code: '+39', flag: '🇻🇦', iso: 'VA', placeholder: '0669812345', length: 10 },
  { name: 'Venezuela', code: '+58', flag: '🇻🇪', iso: 'VE', placeholder: '4121234567', length: 10 },
  { name: 'Vietnam', code: '+84', flag: '🇻🇳', iso: 'VN', placeholder: '912345678', length: 9 },
  { name: 'Virgin Islands (US)', code: '+1340', flag: '🇻🇮', iso: 'VI', placeholder: '3401234', length: 7 },

  // --- Y ---
  { name: 'Yemen', code: '+967', flag: '🇾🇪', iso: 'YE', placeholder: '711234567', length: 9 },

  // --- Z ---
  { name: 'Zambia', code: '+260', flag: '🇿🇲', iso: 'ZM', placeholder: '971234567', length: 9 },
  { name: 'Zimbabwe', code: '+263', flag: '🇿🇼', iso: 'ZW', placeholder: '771234567', length: 9 },
];

// Pre-grouped alphabetically A-Z for optimal dropdown navigation
export const COUNTRIES_BY_LETTER: Record<string, Country[]> = COUNTRIES.reduce<Record<string, Country[]>>((acc, country) => {
  const firstLetter = country.name.charAt(0).toUpperCase();
  if (!acc[firstLetter]) {
    acc[firstLetter] = [];
  }
  acc[firstLetter].push(country);
  return acc;
}, {});

export const DEFAULT_COUNTRY: Country = COUNTRIES.find((c) => c.iso === 'IN') || COUNTRIES[0];

// Common TimeZone to ISO 3166-1 alpha-2 mapping for instant client-side resolution
const TIMEZONE_TO_ISO: Record<string, string> = {
  'Asia/Dhaka': 'BD',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Karachi': 'PK',
  'Asia/Kathmandu': 'NP',
  'Asia/Katmandu': 'NP',
  'Asia/Colombo': 'LK',
  'Asia/Thimphu': 'BT',
  'Asia/Riyadh': 'SA',
  'Asia/Dubai': 'AE',
  'Asia/Qatar': 'QA',
  'Asia/Kuwait': 'KW',
  'Asia/Bahrain': 'BH',
  'Asia/Muscat': 'OM',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Kuching': 'MY',
  'Asia/Singapore': 'SG',
  'Asia/Bangkok': 'TH',
  'Asia/Jakarta': 'ID',
  'Asia/Pontianak': 'ID',
  'Asia/Makassar': 'ID',
  'Asia/Jayapura': 'ID',
  'Asia/Manila': 'PH',
  'Asia/Ho_Chi_Minh': 'VN',
  'Asia/Saigon': 'VN',
  'Asia/Tokyo': 'JP',
  'Asia/Seoul': 'KR',
  'Asia/Shanghai': 'CN',
  'Asia/Urumqi': 'CN',
  'Asia/Chongqing': 'CN',
  'Asia/Harbin': 'CN',
  'Asia/Hong_Kong': 'HK',
  'Asia/Taipei': 'TW',
  'Asia/Yangon': 'MM',
  'Asia/Rangoon': 'MM',
  'Asia/Phnom_Penh': 'KH',
  'Asia/Vientiane': 'LA',
  'Asia/Brunei': 'BN',
  'Asia/Amman': 'JO',
  'Asia/Beirut': 'LB',
  'Asia/Baghdad': 'IQ',
  'Asia/Tehran': 'IR',
  'Asia/Jerusalem': 'IL',
  'Asia/Tel_Aviv': 'IL',
  'Asia/Gaza': 'PS',
  'Asia/Hebron': 'PS',
  'Asia/Tashkent': 'UZ',
  'Asia/Samarkand': 'UZ',
  'Asia/Almaty': 'KZ',
  'Asia/Qyzylorda': 'KZ',
  'Asia/Aqtobe': 'KZ',
  'Asia/Aqtau': 'KZ',
  'Europe/London': 'GB',
  'Europe/Belfast': 'GB',
  'Europe/Dublin': 'IE',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES',
  'Atlantic/Canary': 'ES',
  'Europe/Lisbon': 'PT',
  'Atlantic/Madeira': 'PT',
  'Atlantic/Azores': 'PT',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Vienna': 'AT',
  'Europe/Zurich': 'CH',
  'Europe/Athens': 'GR',
  'Europe/Stockholm': 'SE',
  'Europe/Oslo': 'NO',
  'Europe/Helsinki': 'FI',
  'Europe/Copenhagen': 'DK',
  'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ',
  'Europe/Budapest': 'HU',
  'Europe/Bucharest': 'RO',
  'Europe/Sofia': 'BG',
  'Europe/Kiev': 'UA',
  'Europe/Kyiv': 'UA',
  'Europe/Moscow': 'RU',
  'Europe/Samara': 'RU',
  'Europe/Yekaterinburg': 'RU',
  'Asia/Novosibirsk': 'RU',
  'Asia/Vladivostok': 'RU',
  'Europe/Istanbul': 'TR',
  'Europe/Belgrade': 'RS',
  'Europe/Zagreb': 'HR',
  'Europe/Sarajevo': 'BA',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Los_Angeles': 'US',
  'America/Denver': 'US',
  'America/Phoenix': 'US',
  'America/Detroit': 'US',
  'America/Indiana/Indianapolis': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Montreal': 'CA',
  'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA',
  'America/Halifax': 'CA',
  'America/St_Johns': 'CA',
  'America/Mexico_City': 'MX',
  'America/Cancun': 'MX',
  'America/Merida': 'MX',
  'America/Monterrey': 'MX',
  'America/Tijuana': 'MX',
  'America/Sao_Paulo': 'BR',
  'America/Manaus': 'BR',
  'America/Fortaleza': 'BR',
  'America/Recife': 'BR',
  'America/Argentina/Buenos_Aires': 'AR',
  'America/Buenos_Aires': 'AR',
  'America/Cordoba': 'AR',
  'America/Bogota': 'CO',
  'America/Lima': 'PE',
  'America/Santiago': 'CL',
  'America/Caracas': 'VE',
  'America/Guayaquil': 'EC',
  'America/Panama': 'PA',
  'America/Costa_Rica': 'CR',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU',
  'Australia/Hobart': 'AU',
  'Australia/Darwin': 'AU',
  'Pacific/Auckland': 'NZ',
  'Pacific/Chatham': 'NZ',
  'Pacific/Fiji': 'FJ',
  'Africa/Cairo': 'EG',
  'Africa/Johannesburg': 'ZA',
  'Africa/Lagos': 'NG',
  'Africa/Nairobi': 'KE',
  'Africa/Casablanca': 'MA',
  'Africa/Accra': 'GH',
  'Africa/Addis_Ababa': 'ET',
  'Africa/Tunis': 'TN',
  'Africa/Algiers': 'DZ',
  'Africa/Kampala': 'UG',
  'Africa/Dar_es_Salaam': 'TZ',
  'Africa/Harare': 'ZW',
  'Africa/Lusaka': 'ZM',
};

/**
 * Instant synchronous country detection using:
 * 1. Previously cached country in sessionStorage
 * 2. Device/Browser timezone (Intl.DateTimeFormat)
 * 3. Browser locale languages (navigator.language)
 * 4. Default: India (IN) (+91)
 */
export function getInstantDetectedCountry(): Country {
  if (typeof window === 'undefined') return DEFAULT_COUNTRY;

  try {
    // 1. Check cached detection
    const cachedIso = sessionStorage.getItem('user_detected_country_iso');
    if (cachedIso) {
      const match = COUNTRIES.find((c) => c.iso === cachedIso.toUpperCase());
      if (match) return match;
    }

    // 2. Check timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_TO_ISO[tz]) {
      const iso = TIMEZONE_TO_ISO[tz];
      const match = COUNTRIES.find((c) => c.iso === iso);
      if (match) return match;
    }

    // 3. Check browser language (e.g. "en-US", "bn-BD", "en-IN")
    const languages = [navigator.language, ...(navigator.languages || [])];
    for (const lang of languages) {
      if (!lang) continue;
      const parts = lang.split(/[-_]/);
      if (parts.length >= 2) {
        const candidateIso = parts[1].toUpperCase();
        const match = COUNTRIES.find((c) => c.iso === candidateIso);
        if (match) return match;
      }
    }
  } catch (err) {
    console.warn('Instant country detection failed:', err);
  }

  return DEFAULT_COUNTRY;
}

/**
 * Asynchronous user location detector that:
 * 1. Checks instant detection & cache
 * 2. Queries fast IP-based geo-location service (https://api.country.is)
 * 3. Updates session storage cache and returns matching Country object
 */
export async function detectUserCountryAsync(): Promise<Country> {
  const instant = getInstantDetectedCountry();
  if (typeof window === 'undefined') return instant;

  try {
    const cachedIso = sessionStorage.getItem('user_detected_country_iso');
    if (cachedIso) {
      const match = COUNTRIES.find((c) => c.iso === cachedIso.toUpperCase());
      if (match) return match;
    }

    // Fast IP lookup with 2.5 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('https://api.country.is', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.country === 'string') {
        const found = COUNTRIES.find((c) => c.iso === data.country.toUpperCase());
        if (found) {
          sessionStorage.setItem('user_detected_country_iso', found.iso);
          return found;
        }
      }
    }
  } catch {
    // Non-blocking fallback to instant detected country
  }

  return instant;
}
