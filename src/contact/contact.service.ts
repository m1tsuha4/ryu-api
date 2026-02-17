import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ContactUsDto } from './dto/contact-us.dto';
import { ContactEventDto } from './dto/contact-event.dto';

@Injectable()
export class ContactService {
    constructor(private readonly mailerService: MailerService) { }

    async sendContactUsEmail(dto: ContactUsDto): Promise<void> {
        this.mailerService.sendMail({
            to: 'ryupowertools.indonesia@gmail.com',
            subject: `Contact Us: ${dto.contact_type} - ${dto.name}`,
            html: `
          <h3>New Contact Us Inquiry</h3>
          <p><strong>Contact Type:</strong> ${dto.contact_type}</p>
          <p><strong>Name:</strong> ${dto.name}</p>
          <p><strong>Phone:</strong> ${dto.phone}</p>
          <p><strong>Email:</strong> ${dto.email}</p>
          <p><strong>City:</strong> ${dto.city}</p>
          <p><strong>Message:</strong></p>
          <p>${dto.message}</p>
        `,
        }).catch((error) => {
            console.error('Error sending contact us email:', error);
        });
    }

    async sendContactUsEventEmail(dto: ContactEventDto): Promise<void> {
        this.mailerService.sendMail({
            to: 'ryupowertools.indonesia@gmail.com',
            subject: `Contact Event: ${dto.event_type} - ${dto.name}`,
            html: `
          <h3>New Contact Event Inquiry</h3>
          <p><strong>Event Type:</strong> ${dto.event_type}</p>
          <p><strong>Name:</strong> ${dto.name}</p>
          <p><strong>Phone:</strong> ${dto.phone}</p>
          <p><strong>Email:</strong> ${dto.email}</p>
          <p><strong>City:</strong> ${dto.city}</p>
          <p><strong>Message:</strong></p>
          <p>${dto.message}</p>
        `,
        }).catch((error) => {
            console.error('Error sending contact event email:', error);
        });
    }
}

