# HR & Recruitment Module

Comprehensive guide for the AI-powered HR & Recruitment module.

## Overview

The HR & Recruitment module provides end-to-end recruitment and onboarding management powered by Gemini AI. It automates CV parsing, generates professional job offers, and creates detailed onboarding checklists with document tracking.

## Features

### 1. AI-Powered CV Parsing

Upload candidate CVs (PDF format) and let AI automatically extract:
- Full Name
- Contact Information (Email, Phone)
- Location
- Professional Summary
- Work Experience (companies, positions, durations, responsibilities)
- Education (institutions, degrees, years)
- Skills (technical and soft skills)
- Certifications
- Languages

### 2. Profile Photo Management

- Extract photos embedded in PDF CVs (if available)
- Upload profile photos separately
- Automatic image processing and optimization (300x300px, JPEG)
- Display photos in candidate profiles

### 3. Candidate Management

Track candidates through their recruitment journey:
- **Applied**: Initial application received
- **Screening**: Under initial review
- **Interviewing**: In the interview process
- **Offer Sent**: Job offer has been extended
- **Hired**: Candidate accepted and hired
- **Rejected**: Not moving forward

### 4. AI-Generated Job Offers

Generate professional job offer letters that include:
- Personalized greeting and congratulations
- Position details (title, department, start date)
- Compensation and benefits
- Working conditions (location, hours, remote policy)
- Key responsibilities overview
- Reporting structure
- Conditions of employment
- Next steps and acceptance deadline
- Professional closing

The system uses your File Search store to reference:
- Company HR policies
- Job offer templates
- Benefits information
- Standard employment terms

### 5. Onboarding Workflow Management

Generate comprehensive onboarding checklists organized by timeframe:

#### Pre-boarding (Before Day 1)
- Document collection (ID, tax forms, bank details)
- Equipment setup
- System access preparation
- Welcome communications

#### First Day
- Welcome and orientation
- Workspace setup
- Team introductions
- Initial training sessions

#### First Week
- Department overview
- Key processes training
- Tools and systems training
- Initial assignments

#### First Month
- Regular check-ins schedule
- Performance expectations
- Additional training
- Team integration activities

#### Required HR Documents
- Employment contract
- NDA/Confidentiality agreement
- Code of conduct acknowledgment
- Benefits enrollment forms
- Emergency contact information
- IT usage policy
- Role-specific documents

Each task includes:
- Task description
- Responsible party (HR, Manager, IT, Employee)
- Due date relative to start date
- Priority level (High, Medium, Low)
- Required documents list

## Usage Guide

### Step 1: Set Up File Search Store

1. Navigate to the HR & Recruitment module
2. Create or select a File Search store
3. (Optional) Upload HR policy documents, job templates, or onboarding guides

### Step 2: Upload Candidate CV

1. Go to the "Candidates" tab
2. Drag and drop a PDF CV or click to browse
3. (Optional) Upload a profile photo if not in CV
4. Click "Upload and Parse CV"
5. Wait for AI processing (typically 5-10 seconds)
6. Review extracted candidate information

### Step 3: Generate Job Offer

1. Go to the "Job Offers" tab
2. Select a candidate from the list
3. Fill in job details:
   - Position/Job Title (required)
   - Department
   - Start Date
   - Salary/Compensation
   - Location
   - Employment Type
   - Additional Details (benefits, perks, etc.)
4. Click "Generate Job Offer Letter"
5. Review the AI-generated offer letter
6. Download as Markdown for further editing if needed

### Step 4: Create Onboarding Checklist

1. Go to the "Onboarding" tab
2. Select a candidate
3. Enter:
   - Position (required)
   - Department
   - Start Date (required)
4. Click "Generate Onboarding Checklist"
5. Review the comprehensive checklist
6. Track progress by checking off completed tasks
7. Download checklist as Markdown

## API Endpoints

### Candidates

```
POST   /api/hr/candidates/upload-cv        Upload and parse CV
GET    /api/hr/candidates                  List all candidates
GET    /api/hr/candidates/:id              Get specific candidate
PATCH  /api/hr/candidates/:id/status       Update candidate status
GET    /api/hr/candidates/:id/photo        Get candidate photo
```

### Job Offers

```
POST   /api/hr/job-offers/generate         Generate job offer
GET    /api/hr/job-offers                  List all job offers
GET    /api/hr/job-offers/:id              Get specific job offer
PATCH  /api/hr/job-offers/:id/status       Update job offer status
```

### Onboarding

```
POST   /api/hr/onboarding/generate                              Generate onboarding checklist
GET    /api/hr/onboarding                                       List all onboarding tasks
GET    /api/hr/onboarding/:id                                   Get specific onboarding
PATCH  /api/hr/onboarding/:id/tasks/:sectionIndex/:taskIndex   Update task completion
```

## Data Storage

Currently, the HR module uses in-memory storage for demonstration purposes. In a production environment, you should:

1. **Integrate a database** (PostgreSQL, MongoDB, etc.)
2. **Implement proper file storage** (AWS S3, Google Cloud Storage, etc.)
3. **Add authentication and authorization**
4. **Implement audit logging**
5. **Add data encryption** for sensitive information

## Best Practices

### CV Upload

- Use high-quality PDF files
- Ensure CVs are text-based (not scanned images)
- Standard CV formats work best
- File size limit: 10MB for CVs, 5MB for photos

### Job Offers

- Fill in as many details as possible for better AI generation
- Upload company HR policies to File Search store for consistency
- Review and customize generated offers before sending
- Keep templates in your knowledge base for reference

### Onboarding

- Generate checklists before the start date
- Assign responsible parties to tasks
- Set realistic due dates
- Track progress regularly
- Update checklists based on role requirements

## Integration with File Search

The HR module leverages File Search stores for:

### CV Processing
- Reference company job descriptions
- Compare against role requirements
- Identify skill matches

### Job Offer Generation
- Pull from HR policy documents
- Reference standard benefits packages
- Use company-specific templates
- Include accurate compensation data

### Onboarding
- Reference onboarding guides
- Include company-specific procedures
- Cite relevant policies
- List required documents based on role

### Recommended Documents to Upload

1. **HR Policies**
   - Employment handbook
   - Code of conduct
   - Benefits guide
   - Leave policies

2. **Job Templates**
   - Offer letter templates
   - Job description templates
   - Compensation guidelines

3. **Onboarding Materials**
   - Onboarding guides
   - Training materials
   - IT setup procedures
   - Compliance documents

4. **Company Information**
   - Company overview
   - Organizational charts
   - Department descriptions
   - Mission and values

## Troubleshooting

### CV Parsing Issues

**Problem**: CV not parsing correctly
- **Solution**: Ensure PDF is text-based, not a scanned image
- **Solution**: Try a different PDF export format
- **Solution**: Check file isn't corrupted

**Problem**: Missing information in parsed data
- **Solution**: CV may use non-standard formatting
- **Solution**: Information might not be present in CV
- **Solution**: Manually update candidate profile if needed

### Photo Extraction

**Problem**: Profile photo not extracted from CV
- **Solution**: PDF may not contain embedded images
- **Solution**: Upload photo separately
- **Solution**: Some PDF formats don't support image extraction

### Job Offer Generation

**Problem**: Generic or incomplete job offer
- **Solution**: Provide more detailed job information
- **Solution**: Upload company HR policies and templates to File Search
- **Solution**: Add specific benefits and perks in additional details

### Onboarding Checklist

**Problem**: Checklist doesn't include specific company requirements
- **Solution**: Upload company onboarding guides to File Search
- **Solution**: Add metadata tags to onboarding documents
- **Solution**: Manually add custom tasks after generation

## Security Considerations

1. **Data Privacy**: CV data contains PII - ensure compliance with GDPR, CCPA, etc.
2. **Access Control**: Implement role-based access control in production
3. **Data Retention**: Define and implement data retention policies
4. **Audit Trails**: Log all access and modifications to candidate data
5. **Encryption**: Encrypt data at rest and in transit
6. **File Validation**: Validate uploaded files to prevent malicious uploads

## Future Enhancements

Potential improvements for production deployment:

1. **Email Integration**: Send job offers and onboarding emails directly
2. **Calendar Integration**: Schedule interviews and onboarding events
3. **E-Signature**: Integrate DocuSign or similar for document signing
4. **ATS Integration**: Connect with Applicant Tracking Systems
5. **Background Checks**: Integrate background check services
6. **Analytics Dashboard**: Track recruitment metrics and KPIs
7. **Interview Scheduling**: Automated interview scheduling
8. **Candidate Portal**: Self-service portal for candidates
9. **Mobile App**: Mobile access for on-the-go management
10. **Multi-language Support**: Support for international hiring

## Support

For issues or questions:
1. Check this documentation
2. Review the main [README.md](README.md)
3. Check [Gemini API documentation](https://ai.google.dev/gemini-api/docs)
4. Create an issue in the repository
