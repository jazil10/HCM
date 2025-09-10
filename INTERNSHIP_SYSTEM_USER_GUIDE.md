# Internship Management System - User Guide

## Overview
The Internship Management System is a comprehensive solution for managing internship programs, applications, and applicant tracking within your HCM application.

## Access Requirements
- **Admin Users**: Full access to all features
- **HR Users**: Full access to all features
- **Other Users**: No access to internship management features

## How to Use the System

### 1. Creating an Internship Program

**Step 1: Navigate to Internships**
- Log in as an Admin or HR user
- Go to the Dashboard
- Click on "Internships" in the left navigation menu

**Step 2: Create New Program**
- Click the "Create Program" button in the top-right corner
- Fill out the program creation form with the following information:

**Basic Information:**
- Program Title (required)
- Department (required)
- Location (required)
- Duration in months (1-12, required)
- Max Applicants (required)
- Monthly Stipend (optional)
- Check "Remote internship" if applicable
- Program Description (required)

**Important Dates:**
- Application Deadline (required)
- Program Start Date (required)
- Program End Date (required)

**Program Details:**
- Requirements (add multiple bullet points)
- Required Skills (add multiple skills)
- Benefits (add multiple benefits)

**Custom Application Questions:**
- Add custom questions beyond the standard form fields
- Choose question types: Text, Long Text, Dropdown, Radio Buttons, Checkboxes
- Mark questions as required or optional
- For multiple choice questions, add options (one per line)

**Step 3: Save and Publish**
- Click "Create Program" to save
- The program will be created with a unique public URL for applications

### 2. Managing Existing Programs

**View All Programs:**
- Go to Dashboard → Internships
- See all programs with their status, applicant count, and deadlines
- Use filters to search by status, department, or title

**View Program Details:**
- Click the "View" button (eye icon) on any program card
- See complete program information, application form configuration, and public URL
- Copy the public application URL to share with candidates

**Edit Program:**
- Click the "Edit" button (pencil icon) on any program card
- Modify any program details, dates, or requirements
- Update the application form configuration
- Save changes

**Delete Program:**
- Only available to Admin users
- Click the "Delete" button (trash icon) on any program card
- Programs with existing applications cannot be deleted (must be archived instead)

### 3. Program Statuses

- **Draft**: Program is being created/edited, not visible to public
- **Active**: Program is live and accepting applications
- **Paused**: Program is temporarily not accepting new applications
- **Closed**: Application deadline has passed or manually closed
- **Archived**: Program is completed and archived for records

### 4. Public Application Process

**For Students/Applicants:**
1. Access the public application URL (shared by HR)
2. Fill out the application form with:
   - Personal Information (name, email, phone)
   - Academic Information (university, major, graduation year)
   - Upload Resume (required)
   - Upload Cover Letter (optional)
   - Portfolio/LinkedIn/GitHub links (optional)
   - Answer any custom questions
3. Submit the application
4. Receive email confirmation

### 5. Reviewing Applications

**View Applications:**
- From the Internships page, click "Applications" button on any program
- Or go to Dashboard → Internships → Applications tab
- Filter applications by program, status, or search by name/email

**Application Statuses:**
- **Submitted**: Initial application received
- **Under Review**: HR is reviewing the application
- **Shortlisted**: Candidate selected for next round
- **Interview Scheduled**: Interview arranged
- **Interviewed**: Interview completed
- **Offer Extended**: Job offer sent to candidate
- **Offer Accepted**: Candidate accepted the offer
- **Offer Declined**: Candidate declined the offer
- **Rejected**: Application rejected
- **Withdrawn**: Candidate withdrew application

**Manage Applications:**
- Update application status
- Send email notifications to applicants
- Download/view uploaded resumes and cover letters
- Add internal notes and comments

### 6. Email Notifications

The system automatically sends emails for:
- Application submission confirmation (to applicant)
- New application notification (to HR)
- Status updates (to applicant when status changes)
- Custom email communications (manual send by HR)

### 7. Analytics and Reporting

**Program Statistics:**
- Total applications received
- Applications by status breakdown
- Application trends over time
- Recent applications list
- Fill rate (current vs. max applicants)

### 8. Best Practices

**Program Creation:**
- Set realistic application deadlines (at least 2-4 weeks)
- Provide detailed job descriptions and requirements
- Include attractive benefits and growth opportunities
- Use custom questions to screen candidates effectively

**Application Management:**
- Review applications promptly
- Update statuses regularly to keep candidates informed
- Use consistent evaluation criteria
- Keep internal notes for decision tracking

**Communication:**
- Respond to applications within 1-2 business days
- Provide clear next steps in status updates
- Send rejection emails professionally and constructively
- Keep candidates informed throughout the process

### 9. Troubleshooting

**Common Issues:**
- **Cannot create program**: Check all required fields are filled
- **Public URL not working**: Ensure program status is "Active"
- **Applications not appearing**: Check program filters and status
- **Email notifications not sending**: Verify email service configuration

**Technical Requirements:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- File upload support for resume/cover letter attachments
- Email client for notification management

### 10. URLs and Access Points

**Internal (HR/Admin) URLs:**
- Dashboard: `/dashboard/internships`
- Create Program: `/dashboard/internships/programs/new`
- View Program: `/dashboard/internships/programs/{id}`
- Edit Program: `/dashboard/internships/programs/{id}/edit`
- Applications: `/dashboard/internships/applications`

**Public (Applicant) URLs:**
- Application Form: `/apply/{program-slug}`
- Example: `https://yourcompany.com/apply/software-engineering-summer-2025`

### 11. File Management

**Supported File Types:**
- Resume: PDF, DOC, DOCX (max 5MB)
- Cover Letter: PDF, DOC, DOCX (max 5MB)
- Portfolio: PDF, ZIP (max 10MB)

**File Storage:**
- Files are securely stored and accessible only to HR/Admin users
- Download links are available in the application review interface
- Files are retained according to company data retention policies

---

This system provides a complete end-to-end solution for managing internship programs efficiently while providing a professional experience for both HR teams and applicants.
