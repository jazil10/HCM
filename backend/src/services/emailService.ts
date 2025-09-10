import nodemailer from 'nodemailer';
import { IInternshipApplication, ApplicationStatus } from '../models/InternshipApplication';
import { IInternshipProgram } from '../models/InternshipProgram';
import { IUser } from '../models/User';

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  applicationReceived: (applicantName: string, programTitle: string) => ({
    subject: `Application Received - ${programTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank you for your application!</h2>
        <p>Dear ${applicantName},</p>
        <p>We have successfully received your application for the <strong>${programTitle}</strong> internship program.</p>
        <p>Our team will review your application and get back to you within 5-7 business days.</p>
        <h3>What's Next?</h3>
        <ul>
          <li>Our HR team will review your application and resume</li>
          <li>If shortlisted, you'll receive an email for the next steps</li>
          <li>We may contact you for additional information if needed</li>
        </ul>
        <p>Thank you for your interest in joining our team!</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  }),

  statusUpdate: (applicantName: string, programTitle: string, status: ApplicationStatus, customMessage?: string) => {
    const statusMessages = {
      [ApplicationStatus.UNDER_REVIEW]: 'Your application is currently under review.',
      [ApplicationStatus.SHORTLISTED]: 'Congratulations! You have been shortlisted for the next round.',
      [ApplicationStatus.INTERVIEW_SCHEDULED]: 'Your interview has been scheduled. Details will follow in a separate email.',
      [ApplicationStatus.INTERVIEWED]: 'Thank you for attending the interview. We are reviewing your performance.',
      [ApplicationStatus.OFFER_EXTENDED]: 'Congratulations! We are pleased to extend an offer for this position.',
      [ApplicationStatus.REJECTED]: 'After careful consideration, we have decided not to move forward with your application.',
      [ApplicationStatus.WITHDRAWN]: 'Your application has been withdrawn as requested.',
      [ApplicationStatus.OFFER_ACCEPTED]: 'Welcome to the team! Your offer has been confirmed.',
      [ApplicationStatus.OFFER_DECLINED]: 'We understand your decision to decline our offer.',
      [ApplicationStatus.SUBMITTED]: 'Your application has been submitted successfully.'
    };

    return {
      subject: `Application Update - ${programTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Status Update</h2>
          <p>Dear ${applicantName},</p>
          <p>We wanted to update you on the status of your application for the <strong>${programTitle}</strong> internship program.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0; color: #374151;">Current Status: ${status.replace('_', ' ').toUpperCase()}</h3>
            <p style="margin: 10px 0 0 0;">${customMessage || statusMessages[status]}</p>
          </div>
          <p>If you have any questions, please don't hesitate to contact our HR team.</p>
          <p>Best regards,<br>HR Team</p>
        </div>
      `
    };
  },

  interviewInvite: (applicantName: string, programTitle: string, interviewDate: Date, interviewType: string, additionalInfo?: string) => ({
    subject: `Interview Invitation - ${programTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Interview Invitation</h2>
        <p>Dear ${applicantName},</p>
        <p>Congratulations! We would like to invite you for an interview for the <strong>${programTitle}</strong> internship program.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #374151;">Interview Details</h3>
          <p><strong>Date & Time:</strong> ${interviewDate.toLocaleString()}</p>
          <p><strong>Type:</strong> ${interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview</p>
          ${additionalInfo ? `<p><strong>Additional Information:</strong> ${additionalInfo}</p>` : ''}
        </div>
        <h3>What to Prepare:</h3>
        <ul>
          <li>Review your resume and portfolio</li>
          <li>Prepare questions about the role and company</li>
          <li>Ensure a stable internet connection (for video interviews)</li>
          <li>Dress professionally</li>
        </ul>
        <p>Please confirm your attendance by replying to this email.</p>
        <p>We look forward to meeting you!</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  }),

  offerLetter: (applicantName: string, programTitle: string, startDate: Date, stipend?: number, responseDeadline?: Date) => ({
    subject: `Offer Letter - ${programTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Congratulations on Your Internship Offer!</h2>
        <p>Dear ${applicantName},</p>
        <p>We are delighted to offer you a position in our <strong>${programTitle}</strong> internship program.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #374151;">Offer Details</h3>
          <p><strong>Program:</strong> ${programTitle}</p>
          <p><strong>Start Date:</strong> ${startDate.toLocaleDateString()}</p>
          ${stipend ? `<p><strong>Monthly Stipend:</strong> $${stipend}</p>` : ''}
          ${responseDeadline ? `<p><strong>Response Deadline:</strong> ${responseDeadline.toLocaleDateString()}</p>` : ''}
        </div>
        <h3>Next Steps:</h3>
        <ul>
          <li>Please confirm your acceptance by replying to this email</li>
          <li>Complete any required documentation</li>
          <li>Attend the orientation session (details will follow)</li>
        </ul>
        <p>We are excited about the possibility of you joining our team and contributing to our organization.</p>
        <p>Best regards,<br>HR Team</p>
      </div>
    `
  }),

  internalNotification: (hrUserName: string, applicantName: string, programTitle: string, action: string) => ({
    subject: `Internship Application Update - ${applicantName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Application Update Notification</h2>
        <p>Dear ${hrUserName},</p>
        <p>There has been an update to an internship application:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Applicant:</strong> ${applicantName}</p>
          <p><strong>Program:</strong> ${programTitle}</p>
          <p><strong>Action:</strong> ${action}</p>
        </div>
        <p>Please review the application in the HR dashboard.</p>
        <p>Best regards,<br>HCM System</p>
      </div>
    `
  })
};

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = createTransporter();
  }

  async sendApplicationReceivedEmail(
    applicantEmail: string, 
    applicantName: string, 
    program: IInternshipProgram
  ): Promise<void> {
    try {
      const { subject, html } = emailTemplates.applicationReceived(applicantName, program.title);
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@company.com',
        to: applicantEmail,
        subject,
        html
      });

      console.log(`Application received email sent to ${applicantEmail}`);
    } catch (error) {
      console.error('Error sending application received email:', error);
      throw error;
    }
  }

  async sendStatusUpdateEmail(
    application: IInternshipApplication,
    program: IInternshipProgram,
    customMessage?: string
  ): Promise<void> {
    try {
      const { subject, html } = emailTemplates.statusUpdate(
        application.name, 
        program.title, 
        application.status,
        customMessage
      );
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@company.com',
        to: application.email,
        subject,
        html
      });

      console.log(`Status update email sent to ${application.email}`);
    } catch (error) {
      console.error('Error sending status update email:', error);
      throw error;
    }
  }

  async sendInterviewInviteEmail(
    application: IInternshipApplication,
    program: IInternshipProgram,
    interviewDate: Date,
    interviewType: string,
    additionalInfo?: string
  ): Promise<void> {
    try {
      const { subject, html } = emailTemplates.interviewInvite(
        application.name,
        program.title,
        interviewDate,
        interviewType,
        additionalInfo
      );
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@company.com',
        to: application.email,
        subject,
        html
      });

      console.log(`Interview invite email sent to ${application.email}`);
    } catch (error) {
      console.error('Error sending interview invite email:', error);
      throw error;
    }
  }

  async sendOfferLetterEmail(
    application: IInternshipApplication,
    program: IInternshipProgram,
    startDate: Date,
    stipend?: number,
    responseDeadline?: Date
  ): Promise<void> {
    try {
      const { subject, html } = emailTemplates.offerLetter(
        application.name,
        program.title,
        startDate,
        stipend,
        responseDeadline
      );
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@company.com',
        to: application.email,
        subject,
        html
      });

      console.log(`Offer letter email sent to ${application.email}`);
    } catch (error) {
      console.error('Error sending offer letter email:', error);
      throw error;
    }
  }

  async sendInternalNotificationEmail(
    hrUserEmail: string,
    hrUserName: string,
    applicantName: string,
    programTitle: string,
    action: string
  ): Promise<void> {
    try {
      const { subject, html } = emailTemplates.internalNotification(
        hrUserName,
        applicantName,
        programTitle,
        action
      );
      
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@company.com',
        to: hrUserEmail,
        subject,
        html
      });

      console.log(`Internal notification email sent to ${hrUserEmail}`);
    } catch (error) {
      console.error('Error sending internal notification email:', error);
      throw error;
    }
  }

  async sendCustomEmail(
    to: string,
    subject: string,
    htmlContent: string,
    sentBy: IUser
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@company.com',
        to,
        subject,
        html: htmlContent,
        replyTo: sentBy.email
      });

      console.log(`Custom email sent to ${to} by ${sentBy.name}`);
    } catch (error) {
      console.error('Error sending custom email:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
