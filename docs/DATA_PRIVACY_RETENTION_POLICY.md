# Data Privacy & Retention Policy

## Overview

This document outlines what data we collect, store, retain, and how we handle user privacy in the XMLPrompter application.

## Data Categories

### 1. **Essential User Data** (Keep Indefinitely)
- **User ID**: Unique identifier for account management
- **Email**: Required for authentication and communication
- **Account Creation Date**: For account management and legal compliance
- **Subscription Information**: Billing and service tier management

### 2. **User-Generated Content** (Keep Until Account Deletion)
- **Prompts**: User-created prompts and templates
- **Prompt Metadata**: Titles, descriptions, categories, tags
- **Enrichment Results**: AI-enhanced versions of prompts
- **Quality Scores**: AI-generated quality assessments

### 3. **Usage Analytics** (Keep for 12 months, then anonymize)
- **Session Data**: Basic usage patterns (not detailed content)
- **Feature Usage**: Which features are used most
- **Performance Metrics**: Response times, success rates
- **Model Usage**: Which AI models are selected

### 4. **Privacy Settings** (Keep until account deletion)
- **Notification Preferences**: Email frequency and types
- **Privacy Controls**: Profile visibility, data sharing settings
- **Theme Preferences**: UI customization choices
- **Export Preferences**: User's export format and data selection

### 5. **Security Data** (Keep for security purposes)
- **Login History**: Last 10 login attempts with timestamps
- **2FA Status**: Whether 2FA is enabled (not the secret)
- **Security Events**: Failed login attempts, suspicious activity

### 6. **Data We DO NOT Keep**
- **Raw Prompt Content**: After processing, only store structured data
- **AI Model Responses**: Don't store actual AI outputs
- **Personal Information**: Names, addresses, phone numbers (unless provided)
- **Payment Details**: Only store payment method IDs, not actual card data
- **2FA Secrets**: Only store encrypted backup codes
- **Session Tokens**: Temporary authentication tokens
- **IP Addresses**: Only for security monitoring, not long-term storage

## Data Retention Schedule

### Immediate Deletion (Upon Request)
- User account and all associated data
- Specific prompts or content
- Export preferences
- Notification settings

### 30 Days
- Failed login attempts
- Temporary session data
- API rate limiting data

### 12 Months
- Detailed usage analytics
- Session history
- Performance metrics

### 24 Months (Anonymized)
- Aggregated usage statistics
- Feature adoption rates
- System performance data

### Indefinite (Essential)
- Account creation records (for legal compliance)
- Subscription history (for billing)
- Security audit logs

## Privacy Controls

### User Control Over Data
1. **Export**: Users can export their data in multiple formats
2. **Delete**: Users can delete specific prompts or entire account
3. **Anonymize**: Users can request data anonymization
4. **Opt-out**: Users can opt out of analytics and marketing

### Data Minimization
- Only collect data necessary for service provision
- Don't store unnecessary personal information
- Use pseudonymization where possible
- Implement data retention limits

### Security Measures
- Encrypt sensitive data at rest and in transit
- Implement access controls and audit logging
- Regular security assessments
- Compliance with GDPR and other privacy regulations

## Export Data Privacy

### What's Included in Exports
✅ **Safe to Export**:
- User-created prompts (content only)
- Basic account information (email, subscription status)
- Privacy and notification settings
- Usage statistics (aggregated)
- Export preferences

❌ **Never Exported**:
- Internal system IDs
- Security tokens or secrets
- Payment information
- Detailed session logs
- AI model responses
- Other users' data

### Export Format Security
- JSON: Human-readable, includes metadata
- CSV: Structured data, no sensitive fields
- ZIP: Compressed, same security as JSON

## Implementation Guidelines

### Database Schema Updates
```sql
-- Add data retention columns
ALTER TABLE profiles ADD COLUMN data_retention_policy TEXT DEFAULT 'standard';
ALTER TABLE prompts ADD COLUMN retention_until TIMESTAMP;
ALTER TABLE session_history ADD COLUMN anonymized_at TIMESTAMP;

-- Add privacy controls
ALTER TABLE profiles ADD COLUMN data_analytics_opt_out BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN marketing_opt_out BOOLEAN DEFAULT FALSE;
```

### Application Changes
1. **Data Sanitization**: Remove sensitive data before storage
2. **Retention Policies**: Implement automatic data cleanup
3. **User Controls**: Add privacy settings to user interface
4. **Audit Logging**: Track all data access and modifications

### Export Service Updates
1. **Data Filtering**: Remove sensitive fields from exports
2. **Anonymization**: Option to anonymize exported data
3. **Format Security**: Ensure exports don't contain secrets
4. **User Consent**: Require explicit consent for data export

## Compliance

### GDPR Compliance
- Right to access personal data
- Right to rectification
- Right to erasure (right to be forgotten)
- Right to data portability
- Right to object to processing

### CCPA Compliance
- Right to know what personal information is collected
- Right to delete personal information
- Right to opt-out of sale of personal information
- Right to non-discrimination

### Industry Standards
- SOC 2 Type II compliance
- ISO 27001 information security
- Regular privacy impact assessments
- Third-party security audits

## Monitoring and Enforcement

### Regular Reviews
- Quarterly privacy policy reviews
- Annual data retention audits
- Monthly security assessments
- Continuous compliance monitoring

### Incident Response
- 72-hour breach notification
- User notification procedures
- Regulatory reporting requirements
- Remediation and prevention measures

## Contact Information

For privacy-related inquiries:
- Email: privacy@xmlprompter.com
- Data Protection Officer: dpo@xmlprompter.com
- Legal: legal@xmlprompter.com

---

**Last Updated**: August 7, 2025
**Version**: 1.0
**Next Review**: November 7, 2025 