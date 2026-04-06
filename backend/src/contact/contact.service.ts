import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('EMAIL_SERVICE') || 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendContactEmail(contactDto: ContactDto): Promise<void> {
    const { name, email, message } = contactDto;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      replyTo: email,
      to: this.configService.get<string>('CONTACT_EMAIL') || 'skyvoyage09@gmail.com',
      subject: `Contact Form: Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">✈️ SkyVoyage Contact Form</h1>
            <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 14px;">New message received</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <div style="margin-bottom: 20px;">
              <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">From</p>
              <p style="color: #111827; margin: 0; font-size: 16px; font-weight: 600;">${name}</p>
              <p style="color: #3b82f6; margin: 5px 0 0 0; font-size: 14px;">${email}</p>
            </div>
            
            <div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
              <p style="color: #6b7280; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Message</p>
              <p style="color: #111827; margin: 0; font-size: 14px; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">Received on: ${new Date().toLocaleString()}</p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">This message was sent from the SkyVoyage website contact form</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Contact email sent successfully from ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send contact email from ${email}`, error.stack);
      throw new Error('Failed to send email. Please try again later.');
    }
  }
}
